import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './Schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { IUser } from 'src/auth/users.interface';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    if (
      await this.roleModel.findOne({
        name: createRoleDto.name,
      })
    )
      throw new BadRequestException(
        `Name ${createRoleDto.name} đã tồn tại, vui lòng điền Name khác`,
      );

    const Role = await this.roleModel.create({
      ...createRoleDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return { _id: Role._id, createdAt: Role.createdAt };
  }

  async findAll(currentPage: number, limit: number,search: string, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search), $options: 'i' } },
      ];
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(projection as any)
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
    if (await !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID Không tồn tại');
    }

    return this.roleModel.findById(id).populate({
      path: 'permissions',
      select: { _id: 1, name: 1, apiPath: 1, method: 1, module: 1 },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    // if (await this.roleModel.findOne({ name: updateRoleDto.name })) {
    //   throw new BadRequestException(
    //     `Name ${updateRoleDto.name} đã tồn tại, vui lòng điền Name khác`,
    //   );
    // }

    return this.roleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
  }

  async remove(id: string, user: IUser) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new BadRequestException('ID Không tồn tại');
    else if (role.name === ADMIN_ROLE)
      throw new BadRequestException('ADMIN không được xóa');

    await this.roleModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.roleModel.softDelete({ _id: id });
  }
}
