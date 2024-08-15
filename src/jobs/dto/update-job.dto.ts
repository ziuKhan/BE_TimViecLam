import mongoose from 'mongoose';

export class UpdateJobDto {
  name: string;

  skills: string[];

  company: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  location: string;

  salary: number;

  quantity: number;

  level: string;

  description: string;

  startDate: Date;

  endDate: Date;

  isActive: boolean;
}
