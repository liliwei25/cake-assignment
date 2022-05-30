import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Model, Types } from 'mongoose';
import { Block, BlockDocument } from './schemas/block.schema';
import { Level } from 'level';
import { AbstractSublevel } from 'abstract-level';
import { max } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lexint = require('lexicographic-integer-encoding')('hex', {
  strict: true,
});

@Injectable()
export class AppService {
  private db: Level;
  private heightIndex: AbstractSublevel<
    Level,
    string | Buffer | Uint8Array,
    number,
    Types.ObjectId
  >;
  private addressIndex: AbstractSublevel<
    Level,
    string | Buffer | Uint8Array,
    string,
    string[]
  >;

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Block.name)
    private blockModel: Model<BlockDocument>,
  ) {
    this.db = new Level('indexes', { valueEncoding: 'json' });
    this.heightIndex = this.db.sublevel<number, Types.ObjectId>('height', {
      keyEncoding: lexint,
    });
    this.addressIndex = this.db.sublevel<string, string[]>('address', {
      valueEncoding: 'json',
    });
  }

  async findByMaxHeight(maxHeight: number): Promise<Block[]> {
    if (maxHeight === undefined) {
      return this.blockModel.find().populate('tx').sort({ height: -1 }).exec();
    }
    const ids = await this.heightIndex
      .iterator({ lte: Number(maxHeight) })
      .all();
    return this.blockModel
      .find({
        _id: { $in: ids.map((tup) => tup[1]) },
      })
      .populate('tx')
      .sort({ height: -1 })
      .exec();
  }

  async findTransactionsByBlockHeight(height: number): Promise<Transaction[]> {
    const id = await this.heightIndex.get(height);
    const block = await this.blockModel.findById(id).populate('tx').exec();
    return block.tx;
  }

  async findTransactionsByAddress(address: string): Promise<Transaction[]> {
    const ids = await this.addressIndex.get(address);
    return this.findTransactionsByIds(ids);
  }

  async processBlock(block) {
    const transactions = await this.processTransactions(block.tx);
    const createdBlock = await this.saveBlock(block, transactions);
    await this.heightIndex.put(Number(block.height), createdBlock._id);
  }

  async unProcessBlock(blockHash: string) {
    const block = await this.blockModel
      .findById(blockHash)
      .populate('tx')
      .exec();
    await this.unProcessTransactions(block.tx);
    await this.heightIndex.del(block.height);
    await this.deleteBlock(block._id);
  }

  async processTransactions(
    transactions: Transaction[],
  ): Promise<Transaction[]> {
    const savedTransactions = await this.saveTransactions(transactions);
    await Promise.all(
      savedTransactions.map(this.processTransaction.bind(this)),
    );
    return savedTransactions;
  }

  async unProcessTransactions(transactions: Transaction[]) {
    await this.transactionModel.deleteMany({
      _id: { $in: transactions.map((transaction) => transaction._id) },
    });
    await Promise.all(transactions.map(this.unProcessTransaction.bind(this)));
  }

  async processTransaction(transaction: Transaction) {
    await Promise.all(
      transaction.vout.flatMap((out) =>
        out.scriptPubKey.addresses.map((address: string) =>
          this.addTransactionToAddress(address, transaction._id.toString()),
        ),
      ),
    );
  }

  async unProcessTransaction(transaction: Transaction) {
    await Promise.all(
      transaction.vout.flatMap((out) =>
        out.scriptPubKey.addresses.map((address: string) =>
          this.removeTransactionFromAddress(
            address,
            transaction._id.toString(),
          ),
        ),
      ),
    );
  }

  async addTransactionToAddress(address: string, transactionId: string) {
    const vals = await this.addressIndex
      .get(address)
      .then((res) => res)
      .catch(() => []);
    await this.addressIndex.put(address, vals.concat(transactionId));
  }

  async removeTransactionFromAddress(address: string, transactionId: string) {
    const vals = await this.addressIndex
      .get(address)
      .then((res) => res)
      .catch(() => []);
    await this.addressIndex.put(
      address,
      vals.filter((val) => val !== transactionId),
    );
  }

  async saveTransactions(transactions): Promise<Transaction[]> {
    return await Promise.all(
      transactions.map((transaction) =>
        new this.transactionModel({
          ...transaction,
          _id: transaction.txid,
        }).save(),
      ),
    );
  }

  async saveBlock(block, transactions: Transaction[]): Promise<Block> {
    return new this.blockModel({
      ...block,
      _id: block.hash,
      tx: transactions.map((tx) => tx._id),
    }).save();
  }

  async deleteBlock(id) {
    return this.blockModel.findByIdAndDelete(id).exec();
  }

  async findBlockByHash(hash: string): Promise<Block> {
    return this.blockModel.findById(hash).populate('tx').exec();
  }

  async findTransactionsByIds(ids: string[]): Promise<Transaction[]> {
    return this.transactionModel
      .find({
        _id: { $in: ids },
      })
      .exec();
  }
}
