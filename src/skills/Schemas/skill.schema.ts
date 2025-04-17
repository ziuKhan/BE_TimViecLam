import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
export type SkillDocument = HydratedDocument<Skill>;

@Schema({ timestamps: true })
export class Skill {

    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description: string;
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
export const SkillSchema = SchemaFactory.createForClass(Skill);
