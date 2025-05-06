import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubscriptionPackageDocument = HydratedDocument<SubscriptionPackage>;

@Schema({ timestamps: true })
export class SubscriptionPackage {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  priceDiscount: number;
  
  @Prop({ required: true })
  duration: number;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

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

export const SubscriptionPackageSchema = SchemaFactory.createForClass(SubscriptionPackage);
