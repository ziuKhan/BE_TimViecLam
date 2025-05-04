import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { SubscriptionPackage } from '../../subscription-package/schemas/subscription-package.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ unique: true })
  orderCode: number;

  @Prop()
  amount: number;

  @Prop()
  description: string;

  @Prop()
  buyerName: string;

  @Prop()
  buyerEmail: string;

  @Prop()
  isAnonymous: boolean;

  @Prop({ type: [{ name: String, quantity: Number, price: Number }] })
  items: { name: string; quantity: number; price: number }[];

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  cancelUrl: string;

  @Prop()
  returnUrl: string;

  @Prop()
  expiredAt: number;

  @Prop()
  signature: string;

  @Prop()
  transactionDateTime: string

  @Prop()
  counterAccountBankId: string;

  @Prop()
  counterAccountName: string;

  @Prop()
  counterAccountNumber: string;

  @Prop({ default: 'NORMAL' })
  type: string; // NORMAL, VIP_UPGRADE

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SubscriptionPackage.name })
  packageId: mongoose.Schema.Types.ObjectId;

  //----------------------------------
  //-----CÁC TRƯỜNG MẶC ĐỊNH
  //----------------------------------
  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  deletedAt: Date;
  @Prop()
  isDeleted: boolean;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
