import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Public, ResponseMessage, User } from '../decorator/customize';
import { IUser } from '../auth/users.interface';
import { CommonQueryDto } from '../dto/common-query.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ResponseMessage('Create Skill successfully')
  create(@Body() createSkillDto: CreateSkillDto, @User() user: IUser) {
    return this.skillsService.create(createSkillDto, user);
  }

  @Get()
  @ResponseMessage('Get list skills successfully')
  findAll(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.skillsService.findAll(+page, +pageSize, search, filter);
  }

  @Get('all')
  @Public()
  @ResponseMessage('Get list skills successfully')
  getAll() {
    return this.skillsService.getAll();
  }

  @Get(':id')
  @ResponseMessage('Get Skill successfully')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update Skill successfully')
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @User() user: IUser,
  ) {
    return this.skillsService.update(id, updateSkillDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete Skill successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.skillsService.remove(id, user);
  }
}
