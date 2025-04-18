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

  async search(currentPage: number, limit: number, search: string, qs: any) {
    const { filter, sort, population, projection } = aqp(qs);

    const regex = new RegExp(search, 'i');
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
        value: 'Kĩ năng', 
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
}
