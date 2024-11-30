import { Injectable } from '@nestjs/common';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from '../jobs/Schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Company.name)
    private CompanyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(User.name)
    private UserModel: SoftDeleteModel<UserDocument>,
  ) {}

  findAll() {
    return `This action returns all statistics`;

  }

  findOne(id: number) {
    return `This action returns a #${id} statistic`;
  }
  async calculateCompanyGrowthRate() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthCount = await this.CompanyModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    const currentMonthCount = await this.CompanyModel.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });

    const growthRate = lastMonthCount > 0 ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;

    return growthRate;
  }
}
