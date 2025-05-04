import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { SubscriptionPackage } from '../../subscription-package/schemas/subscription-package.schema';
import { Transaction } from '../../transactions/schemas/transaction.schema';

export type VipHistoryDocument = HydratedDocument<VipHistory>;

@Schema({ timestamps: true })
export class VipHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SubscriptionPackage.name, required: true })
  packageId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Transaction.name })
  transactionId: mongoose.Schema.Types.ObjectId;

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

export const VipHistorySchema = SchemaFactory.createForClass(VipHistory);
