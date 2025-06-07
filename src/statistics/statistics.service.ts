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
  TaxStatisticsQueryDto,
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
    );

    // Thống kê số lượng công việc theo level - chỉ tính các công việc không bị xóa
    const jobsByLevel = await this.JobModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
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

    // Thống kê số lượng công việc theo thời gian - chỉ tính các công việc không bị xóa
    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);
    const jobsByTime = await this.JobModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
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

    // Thêm thống kê công việc theo công ty
    const jobsByCompany = await this.JobModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo',
        },
      },
      {
        $unwind: {
          path: '$companyInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$company',
          companyName: { $first: '$companyInfo.name' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5, // Lấy top 5 công ty đăng nhiều việc nhất
      },
    ]);

    const companyLabels = jobsByCompany.map(item => item.companyName || 'Không xác định');
    const companyData = jobsByCompany.map(item => item.count);

    // Tính tổng số công việc và phân bổ theo level
    const totalJobs = levelData.reduce((sum, count) => sum + count, 0);
    const levelPercentages = levelData.map(count => 
      totalJobs > 0 ? parseFloat(((count / totalJobs) * 100).toFixed(2)) : 0
    );

    // Tính tăng trưởng số lượng công việc theo thời gian
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
      summary: {
        totalJobs,
        byLevel: levelLabels.map((level, index) => ({
          level,
          count: levelData[index],
          percentage: levelPercentages[index],
        })),
      },
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
          {
            label: 'Tỷ lệ tăng trưởng (%)',
            data: growthRates,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            type: 'line',
          },
        ],
      },
      byCompany: {
        labels: companyLabels,
        datasets: [
          {
            label: 'Số lượng công việc theo công ty',
            data: companyData,
            backgroundColor: [
              'rgba(255, 159, 64, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
          },
        ],
      },
    };
  }

  async getUserRegistrationStats(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê người dùng đăng ký theo thời gian - chỉ tính các người dùng không bị xóa
    const result = await this.UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
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

    // Thống kê người dùng theo loại (có công ty và không có công ty) - chỉ tính các người dùng không bị xóa
    const usersByType = await this.UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
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

    // Tính tổng số người dùng và tỷ lệ
    const totalUsers = typeData.reduce((sum, count) => sum + count, 0);
    const employerPercentage = totalUsers > 0 ? (typeData[0] / totalUsers) * 100 : 0;
    const jobSeekerPercentage = totalUsers > 0 ? (typeData[1] / totalUsers) * 100 : 0;

    // Thêm thống kê tăng trưởng người dùng theo thời gian
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
      summary: {
        totalUsers,
        employerCount: typeData[0],
        jobSeekerCount: typeData[1],
        employerPercentage: parseFloat(employerPercentage.toFixed(2)),
        jobSeekerPercentage: parseFloat(jobSeekerPercentage.toFixed(2)),
      },
      byTime: {
        labels,
        datasets: [
          {
            label: 'Số lượng người dùng đăng ký',
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
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê số lượng hồ sơ nộp theo thời gian - chỉ tính các hồ sơ không bị xóa
    const result = await this.ResumeModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
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

    // Thống kê theo trạng thái hồ sơ - chỉ tính các hồ sơ không bị xóa
    const resumesByStatus = await this.ResumeModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Các trạng thái có thể có của hồ sơ
    const statusLabels = ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'];
    const statusData = statusLabels.map(status => {
      const found = resumesByStatus.find(item => item._id === status);
      return found ? found.count : 0;
    });

    // Thêm thống kê theo công ty
    const resumesByCompany = await this.ResumeModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'companyInfo',
        },
      },
      {
        $unwind: {
          path: '$companyInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$companyId',
          companyName: { $first: '$companyInfo.name' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5, // Lấy top 5 công ty có nhiều hồ sơ nhất
      },
    ]);

    const companyLabels = resumesByCompany.map(item => item.companyName || 'Không xác định');
    const companyData = resumesByCompany.map(item => item.count);

    // Thêm thống kê tỷ lệ chuyển đổi trạng thái
    const totalResumes = statusData.reduce((sum, count) => sum + count, 0);
    const conversionRates = {
      approvalRate: totalResumes > 0 ? (statusData[2] / totalResumes) * 100 : 0,
      rejectionRate: totalResumes > 0 ? (statusData[3] / totalResumes) * 100 : 0,
      reviewingRate: totalResumes > 0 ? (statusData[1] / totalResumes) * 100 : 0,
      pendingRate: totalResumes > 0 ? (statusData[0] / totalResumes) * 100 : 0,
    };

    return {
      summary: {
        totalResumes,
        approvedCount: statusData[2],
        rejectedCount: statusData[3],
        reviewingCount: statusData[1],
        pendingCount: statusData[0],
        conversionRates: {
          approvalRate: parseFloat(conversionRates.approvalRate.toFixed(2)),
          rejectionRate: parseFloat(conversionRates.rejectionRate.toFixed(2)),
          reviewingRate: parseFloat(conversionRates.reviewingRate.toFixed(2)),
          pendingRate: parseFloat(conversionRates.pendingRate.toFixed(2)),
        },
      },
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
        labels: ['Chờ xử lý', 'Đang xem xét', 'Đã chấp nhận', 'Đã từ chối'],
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
      byCompany: {
        labels: companyLabels,
        datasets: [
          {
            label: 'Số lượng hồ sơ theo công ty',
            data: companyData,
            backgroundColor: [
              'rgba(255, 159, 64, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
          },
        ],
      },
    };
  }

  async getRevenueStatistics(query?: StatisticsQueryDto) {
    const { startDate, endDate } = DateHelper.getDateRange(
      query?.timeUnit,
    );

    const groupBy = DateHelper.getGroupByFormat(query?.timeUnit);

    // Thống kê doanh thu theo thời gian - chỉ tính các giao dịch có status là PAID
    const result = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'PAID',
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

    // Lấy danh sách tất cả các giao dịch PAID trong khoảng thời gian để kiểm tra
    const allPaidTransactions = await this.TransactionModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'PAID',
      isDeleted: { $ne: true },
    }).select('amount type createdAt').lean();

    console.log('All paid transactions:', JSON.stringify(allPaidTransactions, null, 2));

    // Xử lý dữ liệu theo thời gian
    const { labels, data: revenueData } = DateHelper.formatLabels(query?.timeUnit, result);

    // Thống kê doanh thu theo loại giao dịch - chỉ tính các giao dịch có status là PAID
    const revenueByType = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'PAID',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$type',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Log kết quả theo loại giao dịch
    console.log('Revenue by type result:', JSON.stringify(revenueByType, null, 2));

    // Tính thủ công doanh thu theo loại
    let normalRevenue = 0;
    let vipRevenue = 0;
    
    allPaidTransactions.forEach(transaction => {
      if (transaction.type === 'NORMAL') {
        normalRevenue += transaction.amount;
      } else if (transaction.type === 'VIP_UPGRADE') {
        vipRevenue += transaction.amount;
      }
    });
    
    console.log('Manual calculation:', { normalRevenue, vipRevenue });

    // Tính tổng doanh thu từ tất cả các giao dịch PAID trong khoảng thời gian
    const totalPaidTransactions = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'PAID',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const totalStats = totalPaidTransactions[0] || { totalRevenue: 0, count: 0 };
    console.log('Total stats:', totalStats);
    
    // Tính doanh thu trung bình
    const averageRevenue = totalStats.count > 0 ? totalStats.totalRevenue / totalStats.count : 0;

    // Tổng doanh thu thủ công
    const manualTotalRevenue = allPaidTransactions.reduce((sum, t) => sum + t.amount, 0);
    console.log('Manual total revenue:', manualTotalRevenue);

    return {
      summary: {
        totalRevenue: totalStats.totalRevenue,
        averageRevenue: parseFloat(averageRevenue.toFixed(2)),
        transactionCount: totalStats.count,
      },
      byTime: {
        labels,
        datasets: [
          {
            label: 'Doanh thu theo thời gian',
            data: revenueData,
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
            data: [normalRevenue, vipRevenue],
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
          },
        ],
      },
    };
  }

  async getTaxStatistics(query: TaxStatisticsQueryDto) {
    const year = query.year;
    
    // Tạo mảng các quý trong năm
    const quarters = [
      { name: 'Quý 1', startMonth: 1, endMonth: 3 },
      { name: 'Quý 2', startMonth: 4, endMonth: 6 },
      { name: 'Quý 3', startMonth: 7, endMonth: 9 },
      { name: 'Quý 4', startMonth: 10, endMonth: 12 },
    ];
    
    // Kết quả thống kê theo quý
    const quarterlyStats = [];
    
    // Tính toán thống kê cho từng quý
    for (const quarter of quarters) {
      const startDate = new Date(year, quarter.startMonth - 1, 1);
      const endDate = new Date(year, quarter.endMonth, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Thống kê doanh thu và thuế theo quý - chỉ tính các giao dịch có status là PAID
      const result = await this.TransactionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'PAID',
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTax: { $sum: '$tax' },
            totalAmountBeforeTax: { $sum: '$amountAfterTax' },
            count: { $sum: 1 },
          },
        },
      ]);
      
      const stats = result[0] || { totalRevenue: 0, totalTax: 0, totalAmountBeforeTax: 0, count: 0 };
      
      quarterlyStats.push({
        quarter: quarter.name,
        totalRevenue: stats.totalRevenue,
        totalTax: stats.totalTax,
        totalAmountBeforeTax: stats.totalAmountBeforeTax,
        transactionCount: stats.count,
      });
    }
    
    // Tính tổng thống kê cho cả năm
    const yearlyStats = await this.TransactionModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999),
          },
          status: 'PAID',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTax: { $sum: '$tax' },
          totalAmountBeforeTax: { $sum: '$amountAfterTax' },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const yearSummary = yearlyStats[0] || { 
      totalRevenue: 0, 
      totalTax: 0, 
      totalAmountBeforeTax: 0, 
      count: 0 
    };
    
    // Tạo dữ liệu cho biểu đồ
    const labels = quarters.map(q => q.name);
    const revenueData = quarterlyStats.map(q => q.totalRevenue);
    const taxData = quarterlyStats.map(q => q.totalTax);
    const revenueAfterTaxData = quarterlyStats.map(q => q.totalAmountBeforeTax);
    
    return {
      year,
      summary: {
        totalRevenue: yearSummary.totalRevenue,
        totalTax: yearSummary.totalTax,
        totalAmountBeforeTax: yearSummary.totalAmountBeforeTax,
        transactionCount: yearSummary.count,
        taxPercentage: yearSummary.totalRevenue > 0 
          ? parseFloat(((yearSummary.totalTax / yearSummary.totalRevenue) * 100).toFixed(2))
          : 0,
      },
      quarterlyStats,
      chart: {
        labels,
        datasets: [
          {
            label: 'Tổng doanh thu',
            data: revenueData,
            backgroundColor: 'rgba(45, 194, 73, 0.5)', 
            borderColor: 'rgb(45, 194, 73)',
          },
          {
            label: 'Thuế',
            data: taxData,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'Doanh thu (Đã trừ VAT)',
            data: revenueAfterTaxData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
          },
        ],
      },
    };
  }
}
