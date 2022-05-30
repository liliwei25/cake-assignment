import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import { Block, BlockSchema } from './block.schema';

const modules = MongooseModule.forFeature([
  { name: Transaction.name, schema: TransactionSchema },
  { name: Block.name, schema: BlockSchema },
]);

@Module({
  imports: [modules],
  exports: [modules],
})
export class SchemasModule {}
