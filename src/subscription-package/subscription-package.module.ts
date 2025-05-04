import { Module } from '@nestjs/common';
import { SubscriptionPackageService } from './subscription-package.service';
import { SubscriptionPackageController } from './subscription-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPackage, SubscriptionPackageSchema } from './schemas/subscription-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPackage.name, schema: SubscriptionPackageSchema }
    ])
  ],
  controllers: [SubscriptionPackageController],
  providers: [SubscriptionPackageService],
  exports: [SubscriptionPackageService]
})
export class SubscriptionPackageModule {}
