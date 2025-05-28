import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from '../jobs/Schemas/job.schema';
import aqp from 'api-query-params';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Skill, SkillDocument } from '../skills/Schemas/skill.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(Skill.name)
    private skillModel: SoftDeleteModel<SkillDocument>,
  ) {}

  // Hàm escape regex characters
  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async suggest(currentPage: number, limit: number, search: string, qs: any) {
    const { filter, sort, population, projection } = aqp(qs);

    const escapedSearch = this.escapeRegExp(search);
    const regex = new RegExp(escapedSearch, 'i');
    const skip = (currentPage - 1) * limit;

    // Thực hiện các truy vấn đồng thời
    const [companies, skills] = await Promise.all([
      // Tìm kiếm công ty theo tên
      this.companyModel
        .find({
          name: regex,
          ...filter,
        })
        .skip(skip)
        .limit(limit)
        .sort(sort as any)
        .exec(),

      // Tìm kiếm kỹ năng theo tên  
      this.skillModel
        .find({
          name: regex,
          ...filter,
        })
        .skip(skip)
        .limit(limit)
        .sort(sort as any)
        .exec(),
    ]);

    // Định dạng kết quả
    const result = [
  
      skills.length > 0 && {
        value: 'Kĩ năng và tiêu đề', 
        options: skills.map((skill) => ({
          value: skill.name,
          _id: skill._id,
          type: 'skill',
        })),
      },
      companies.length > 0 && {
        value: 'Công ty',
        options: companies.map((company) => ({
          value: company.name,
          _id: company._id,
          type: 'company',
        })),
      }
    ].filter(Boolean);

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
      },
      result,
    };
  }

  async search(currentPage: number, limit: number, search: string, qs: any) {
    const { filter, sort, population, projection } = aqp(qs);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    if (search) {
        // Escape các ký tự đặc biệt trong tìm kiếm
        const escapedSearch = this.escapeRegExp(search);
        const searchRegex = new RegExp(escapedSearch, 'i');

        // Tìm công ty theo tên
        const companies = await this.companyModel.find({
            name: { $regex: searchRegex },
        });
        const companyIds = companies.map(company => company._id);

        // Tìm kỹ năng theo tên
        const skills = await this.skillModel.find({
            name: { $regex: searchRegex },
        });
        const skillIds = skills.map(skill => skill._id);

        filter.$or = [
            { name: { $regex: searchRegex } }, // Tìm theo tên job
            { companyId: { $in: companyIds } }, // Tìm theo tên công ty
            { skills: { $in: skillIds } }, // Tìm theo tên kỹ năng
        ];
    }

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population)
        .populate('companyId')
        .populate('skills')
        .select(projection)
        .exec();

    return {
        meta: {
            current: currentPage, //trang hiện tại
            pageSize: limit, //số lượng bản ghi đã lấy
            pages: totalPages, //tổng số trang với điều kiện query
            total: totalItems, // tổng số phần tử (số bản ghi)
        },
        result,
    };
  }
}
