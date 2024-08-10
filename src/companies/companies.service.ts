import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private CompanyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  create(createCompanyDto: CreateCompanyDto) {
    return this.CompanyModel.create(createCompanyDto);
  }

  findAll() {
    return `This action returns all companies`;
  }

  findOne(id: string) {
    return this.CompanyModel.findById(id);
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.CompanyModel.findByIdAndUpdate(id, updateCompanyDto);
  }

  remove(id: string) {
    return this.CompanyModel.softDelete({ _id: id });
  }
}
