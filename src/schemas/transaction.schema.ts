import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  hash: string;

  @Prop()
  version: number;

  @Prop()
  size: number;

  @Prop()
  vsize: number;

  @Prop()
  weight: number;

  @Prop()
  locktime: number;

  @Prop({
    type: [{ coinbase: { type: String }, sequence: { type: Number } }],
  })
  vin: Record<string, any>[];

  @Prop({
    type: [
      {
        value: { type: Number },
        n: { type: Number },
        scriptPubKey: {
          type: {
            asm: { type: String },
            hex: { type: String },
            regSigs: { type: Number },
            // type: { type: String },
            addresses: { type: [String] },
          },
        },
      },
    ],
  })
  vout: Record<string, any>[];

  @Prop()
  hex: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
