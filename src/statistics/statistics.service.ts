import { Injectable } from '@nestjs/common';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from '../jobs/Schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Resume, ResumeDocument } from '../resumes/schemas/resume.schema';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema';
import {
  StatisticsQueryDto,
  StatisticsTimeUnit,
} from './dto/statistics-query.dto';
import { DateHelper } from './utils/date-helper.util';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Company.name)
    private CompanyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(User.name)
    private UserModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Resume.name)
    private ResumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(Transaction.name)
    private TransactionModel: SoftDeleteModel<TransactionDocument>,
  ) {}
  level: string[] = ['INTERN','FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'MANAGER']

  async calculateCompanyGrowthRate(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
      query?.startDate,
      query?.endDate,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    const result = await this.CompanyModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const { labels, data } = DateHelper.formatLabels(query?.timeUnit, result);

    // Tính tỷ lệ tăng trưởng
    const growthRates = [];
    for (let i = 1; i < data.length; i++) {
      const previous = data[i - 1] || 0;
      const current = data[i] || 0;
      
      let growthRate = 0;
      if (previous > 0) {
        growthRate = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        growthRate = 100; // Nếu trước đó là 0 và hiện tại > 0, tăng trưởng 100%
      }
      
      growthRates.push(parseFloat(growthRate.toFixed(2)));
    }

    // Thêm 0 cho giá trị đầu tiên vì không có dữ liệu trước đó để so sánh
    growthRates.unshift(0);

    return {
      labels,
      datasets: [
        {
          label: 'Số lượng công ty',
          data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Tỷ lệ tăng trưởng (%)',
          data: growthRates,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          type: 'line',
        },
      ],
    };
  }

  async getTotalJobsByCategory(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
      query?.startDate,
      query?.endDate,
    );

    // Thống kê số lượng công việc theo level
    const jobsByLevel = await this.JobModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Đảm bảo tất cả các level đều có trong kết quả
    const levelData = [];
    const levelLabels = [];
    
    for (const level of this.level) {
      const found = jobsByLevel.find(item => item._id === level);
      levelData.push(found ? found.count : 0);
      levelLabels.push(level);
    }

    // Thống kê số lượng công việc theo thời gian
    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);
    const jobsByTime = await this.JobModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const { labels, data } = DateHelper.formatLabels(query?.timeUnit, jobsByTime);

    return {
      byLevel: {
        labels: levelLabels,
        datasets: [
          {
            label: 'Số lượng công việc theo trình độ',
            data: levelData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
          },
        ],
      },
      byTime: {
        labels,
        datasets: [
          {
            label: 'Số lượng công việc theo thời gian',
            data,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      },
    };
  }

  async getUserRegistrationStats(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
      query?.startDate,
      query?.endDate,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê người dùng đăng ký theo thời gian
    const result = await this.UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const { labels, data } = DateHelper.formatLabels(query?.timeUnit, result);

    // Thống kê người dùng theo loại (có công ty và không có công ty)
    const usersByType = await this.UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: { $cond: [{ $ifNull: ['$company', false] }, 'Nhà tuyển dụng', 'Người tìm việc'] },
          count: { $sum: 1 },
        },
      },
    ]);

    const typeLabels = ['Nhà tuyển dụng', 'Người tìm việc'];
    const typeData = typeLabels.map(label => {
      const found = usersByType.find(item => item._id === label);
      return found ? found.count : 0;
    });

    return {
      byTime: {
        labels,
        datasets: [
          {
            label: 'Số lượng người dùng đăng ký',
            data,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      },
      byType: {
        labels: typeLabels,
        datasets: [
          {
            label: 'Số lượng người dùng theo loại',
            data: typeData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)',
            ],
          },
        ],
      },
    };
  }

  async getResumeSubmissionStats(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
      query?.startDate,
      query?.endDate,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê số lượng hồ sơ nộp theo thời gian
    const result = await this.ResumeModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const { labels, data } = DateHelper.formatLabels(query?.timeUnit, result);

    // Thống kê theo trạng thái hồ sơ
    const resumesByStatus = await this.ResumeModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Các trạng thái có thể có của hồ sơ
    const statusLabels = ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'];
    const statusData = statusLabels.map(status => {
      const found = resumesByStatus.find(item => item._id === status);
      return found ? found.count : 0;
    });

    return {
      byTime: {
        labels,
        datasets: [
          {
            label: 'Số lượng hồ sơ nộp',
            data,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      },
      byStatus: {
        labels: statusLabels,
        datasets: [
          {
            label: 'Số lượng hồ sơ theo trạng thái',
            data: statusData,
            backgroundColor: [
              'rgba(255, 206, 86, 0.5)', // PENDING - vàng
              'rgba(54, 162, 235, 0.5)', // REVIEWING - xanh dương
              'rgba(75, 192, 192, 0.5)', // APPROVED - xanh lá
              'rgba(255, 99, 132, 0.5)', // REJECTED - đỏ
            ],
          },
        ],
      },
    };
  }

  async getRevenueStatistics(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
      query?.startDate,
      query?.endDate,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê doanh thu theo thời gian
    const result = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'SUCCESSFUL',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const { labels, data } = DateHelper.formatLabels(query?.timeUnit, result);

    // Thống kê doanh thu theo loại giao dịch
    const revenueByType = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'SUCCESSFUL',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$type',
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);

    // Các loại giao dịch
    const typeLabels = ['NORMAL', 'VIP_UPGRADE'];
    const typeData = typeLabels.map(type => {
      const found = revenueByType.find(item => item._id === type);
      return found ? found.totalRevenue : 0;
    });

    // Tính tổng doanh thu
    const totalRevenue = data.reduce((sum, current) => sum + current, 0);
    
    // Tính doanh thu trung bình
    const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;

    return {
      summary: {
        totalRevenue,
        averageRevenue: parseFloat(averageRevenue.toFixed(2)),
        transactionCount: result.reduce((sum, item) => sum + item.count, 0),
      },
      byTime: {
        labels,
        datasets: [
          {
            label: 'Doanh thu theo thời gian',
            data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
      },
      byType: {
        labels: ['Giao dịch thường', 'Nâng cấp VIP'],
        datasets: [
          {
            label: 'Doanh thu theo loại giao dịch',
            data: typeData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
          },
        ],
      },
    };
  }
}
