import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CustomerApprovalDocument = HydratedDocument<CustomerApproval>;

@Schema({ timestamps: true })
export class CustomerApproval {
  @Prop()
  lastName: string;
  @Prop()
  firstName: string;
  @Prop()
  email: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  logo: string;
  @Prop()
  address: string;
  @Prop({unique: true})
  companyName: string;
  @Prop({default: 'CD'})
  status: string;
  @Prop()
  description: string;
  @Prop()
  clause: boolean;
  
  
  //----------------------------------

  //----------------------------------
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

export const CustomerApprovalSchema = SchemaFactory.createForClass(CustomerApproval);
