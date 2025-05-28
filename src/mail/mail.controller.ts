import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/Schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/Schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { Skill, SkillDocument } from 'src/skills/Schemas/skill.schema';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Skill.name)
    private skillModel: SoftDeleteModel<SkillDocument>,
  ) {}

  @Get()
  @Cron('0 0 * * 6')
  @Public()
  @ResponseMessage('Send email')
  async handleEmail() {
    try {
      const subscribers = await this.subscriberModel.find({});

      for (const subs of subscribers) {
        if (!subs.skills || subs.skills.length === 0) {
          continue;
        }

        // Tìm skill IDs từ tên skill
        const skills = await this.skillModel.find({
          name: { $in: subs.skills }
        });
        
        // Lấy mảng ID của các skill
        const skillIds = skills.map(skill => skill._id);
        
        // Nếu không tìm thấy skill nào, bỏ qua subscriber này
        if (skillIds.length === 0) {
          continue;
        }

        const jobWithMatchingSkills = await this.jobModel
          .find({
            skills: { $in: skillIds },
          })
          .populate({
            path: 'companyId',
            select: { name: 1, _id: 1, logo: 1 },
          })
          .populate('skills');

        if (jobWithMatchingSkills?.length > 0) {
          const jobs = jobWithMatchingSkills.map((item) => {
            return {
              name: item.name,
              company: (item.companyId as any)?.name || 'Không có tên công ty',
              salary:
                `${item.salaryFrom || 0} - ${item.salaryTo || 0}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ',',
                ) + ' đ',
              skills: item.skills?.map(skill => (skill as any)?.name || '') || [],
            };
          });

          await this.mailerService.sendMail({
            to: subs.email,
            from: '"ITViec" <itviec@example.com>',
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'new-job',
            context: {
              receiver: subs.name || 'Người dùng',
              jobs: jobs,
            },
          });
        }
      }
      return { message: 'Đã gửi email thành công' };
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      return { error: error.message || 'Lỗi khi gửi email' };
    }
  }
}
