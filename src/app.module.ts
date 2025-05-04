import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { CompaniesModule } from './companies/companies.module';
import { ResumesModule } from './resumes/resumes.module';
import { JobsModule } from './jobs/jobs.module';
import { FIlesModule } from './ﬁles/ﬁles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { StatisticsModule } from './statistics/statistics.module';
import { SkillsModule } from './skills/skills.module';
import { SearchModule } from './search/search.module';
import { CustomerApprovalModule } from './customer-approval/customer-approval.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SubscriptionPackageModule } from './subscription-package/subscription-package.module';
import { VipHistoryModule } from './vip-history/vip-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    ResumesModule,
    JobsModule,
    FIlesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    MailModule,
    WebsocketsModule,

    ScheduleModule.forRoot(),

    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 2,
    //   },
    // ]),

    HealthModule,

    NotificationsModule,

    StatisticsModule,

    SkillsModule,

    SearchModule,

    CustomerApprovalModule,

    TransactionsModule,

    SubscriptionPackageModule,

    VipHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
