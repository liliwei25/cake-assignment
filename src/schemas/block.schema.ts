import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transaction } from './transaction.schema';

export type BlockDocument = Block & Document;

@Schema()
export class Block {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  hash: string;

  @Prop()
  confirmations: number;

  @Prop()
  strippedsize: number;

  @Prop()
  size: number;

  @Prop()
  weight: number;

  @Prop()
  height: number;

  @Prop()
  masternode: string;

  @Prop()
  minter: string;

  @Prop()
  mintedBlocks: number;

  @Prop()
  stackeModifier: string;

  @Prop()
  version: number;

  @Prop()
  versionHex: string;

  @Prop()
  merkleroot: string;

  @Prop({
    type: [
      {
        AnchorReward: { type: Number },
        Burnt: { type: Number },
        IncentiveFunding: { type: Number },
      },
    ],
  })
  nonutxo: string;

  @Prop({ type: [String], ref: Transaction.name })
  tx: Transaction[];

  @Prop()
  time: number;

  @Prop()
  mediantime: number;

  @Prop()
  bits: string;

  @Prop()
  difficulty: number;

  @Prop()
  chainwork: string;

  @Prop()
  nTx: number;

  @Prop()
  previousblockhash: string;

  @Prop()
  nextblockhash: string;

  @Prop()
  hex: string;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
