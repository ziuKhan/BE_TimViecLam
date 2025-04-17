import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillDocument } from './Schemas/skill.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Skill } from './Schemas/skill.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '../auth/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name)
    private skillModel: SoftDeleteModel<SkillDocument>,
  ) {}

  async create(createSkillDto: CreateSkillDto, user: IUser) {
    if (
      await this.skillModel.findOne({
        name: createSkillDto.name,
      })
    )
      throw new BadRequestException(
        `Kỹ năng ${createSkillDto.name} đã tồn tại, vui lòng điền kỹ năng khác`,
      );

    const Skill = await this.skillModel.create({
      ...createSkillDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: Skill._id, createdAt: Skill.createdAt };
  }

  async findAll(currentPage: number, limit: number,search: string, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } },
      ];
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.skillModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.skillModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID Không tồn tại');
    }

    return this.skillModel.findById(id);
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, user: IUser) {


    return this.skillModel.updateOne(
      { _id: id },
      {
        ...updateSkillDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }
  getAll(){
    return this.skillModel.find();
  }
  async remove(id: string, user: IUser) {
    const skill = await this.skillModel.findById(id);
    if (!skill) throw new BadRequestException('ID Không tồn tại');

    await this.skillModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.skillModel.softDelete({ _id: id });
  }
}
