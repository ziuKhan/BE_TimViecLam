import { StatisticsTimeUnit } from '../dto/statistics-query.dto';

export class DateHelper {
  /**
   * Tạo điểm bắt đầu và kết thúc dựa trên đơn vị thời gian
   * @param timeUnit Đơn vị thời gian (năm, tháng, tuần, ngày)
   */
  static getDateRange(
    timeUnit: StatisticsTimeUnit = StatisticsTimeUnit.MONTH,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now); // Thời gian hiện tại

    // Thiết lập thời gian dựa trên đơn vị thời gian
    switch (timeUnit) {
      case StatisticsTimeUnit.YEAR:
        // Từ đầu năm đến hiện tại
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      
      case StatisticsTimeUnit.MONTH:
        // Từ đầu năm đến hiện tại để xem dữ liệu các tháng
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      
      case StatisticsTimeUnit.WEEK:
 // Từ đầu tháng đến hiện tại
 startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      
      case StatisticsTimeUnit.DAY:
        // Ngày hiện tại
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Điều chỉnh cho Chủ Nhật
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      
      default:
        // Mặc định là từ đầu năm
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Đặt thời gian kết thúc vào cuối ngày hiện tại
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Tạo định dạng nhóm theo cho MongoDB Aggregation dựa trên đơn vị thời gian
   * @param timeUnit Đơn vị thời gian (năm, tháng, tuần, ngày)
   */
  static getGroupByFormat(timeUnit: StatisticsTimeUnit): Record<string, any> {
    switch (timeUnit) {
      case StatisticsTimeUnit.YEAR:
        return { 
          year: { $year: '$createdAt' } 
        };
      
      case StatisticsTimeUnit.MONTH:
        return { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
      
      case StatisticsTimeUnit.WEEK:
        return { 
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
      
      case StatisticsTimeUnit.DAY:
        return { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
      
      default:
        return { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }
  }

  /**
   * Tạo các nhãn dựa trên đơn vị thời gian và kết quả từ database
   * @param timeUnit Đơn vị thời gian
   * @param result Kết quả từ database
   */
  static formatLabels(timeUnit: StatisticsTimeUnit, result: any[]): { labels: string[]; data: any[] } {
    const now = new Date();
    const labels: string[] = [];
    const data: any[] = [];
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    switch (timeUnit) {
      case StatisticsTimeUnit.YEAR:
        // Lấy 5 năm gần đây
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() - i;
          labels.push(year.toString());
          
          const foundItem = result.find(item => item._id?.year === year);
          // Ưu tiên lấy totalRevenue trước nếu có
          data.push(foundItem ? (foundItem.totalRevenue !== undefined ? foundItem.totalRevenue : foundItem.count || 0) : 0);
        }
        break;
      
      case StatisticsTimeUnit.MONTH:
        // 12 tháng trong năm hiện tại
        const currentYear = now.getFullYear();
        for (let i = 0; i < 12; i++) {
          labels.push(monthNames[i]);
          
          const foundItem = result.find(item => 
            item._id?.year === currentYear && item._id?.month === i + 1
          );
          // Ưu tiên lấy totalRevenue trước nếu có
          data.push(foundItem ? (foundItem.totalRevenue !== undefined ? foundItem.totalRevenue : foundItem.count || 0) : 0);
        }
        break;
      
      case StatisticsTimeUnit.WEEK:
        // 4 tuần gần đây
        const currentWeek = this.getWeekNumber(now);
        for (let i = 3; i >= 0; i--) {
          const weekNum = currentWeek - i;
          let targetWeek = weekNum;
          let targetYear = now.getFullYear();
          
          // Xử lý trường hợp tuần thuộc năm trước
          if (weekNum <= 0) {
            const lastYearDate = new Date(now);
            lastYearDate.setFullYear(now.getFullYear() - 1);
            lastYearDate.setMonth(11, 31); // 31/12 năm trước
            const weeksInLastYear = this.getWeekNumber(lastYearDate);
            targetWeek = weeksInLastYear + weekNum;
            targetYear = now.getFullYear() - 1;
          }
          
          labels.push(`Tuần ${4-i}`);
          
          const foundItem = result.find(item => 
            item._id?.year === targetYear && item._id?.week === targetWeek
          );
          // Ưu tiên lấy totalRevenue trước nếu có
          data.push(foundItem ? (foundItem.totalRevenue !== undefined ? foundItem.totalRevenue : foundItem.count || 0) : 0);
        }
        break;
      
      case StatisticsTimeUnit.DAY:
        // 7 ngày gần đây
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
          const dayOfMonth = date.getDate();
          labels.push(`${dayName} (${dayOfMonth})`);
          
          const foundItem = result.find(item => 
            item._id?.year === date.getFullYear() && 
            item._id?.month === date.getMonth() + 1 && 
            item._id?.day === date.getDate()
          );
          // Ưu tiên lấy totalRevenue trước nếu có
          data.push(foundItem ? (foundItem.totalRevenue !== undefined ? foundItem.totalRevenue : foundItem.count || 0) : 0);
        }
        break;
      
      default:
        // Mặc định là tháng
        for (let i = 0; i < 12; i++) {
          labels.push(monthNames[i]);
          
          const foundItem = result.find(item => 
            item._id?.year === now.getFullYear() && item._id?.month === i + 1
          );
          // Ưu tiên lấy totalRevenue trước nếu có
          data.push(foundItem ? (foundItem.totalRevenue !== undefined ? foundItem.totalRevenue : foundItem.count || 0) : 0);
        }
    }

    return { labels, data };
  }

  /**
   * Lấy số tuần trong năm cho một ngày cụ thể
   * @param date Ngày cần tính số tuần
   */
  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
} 