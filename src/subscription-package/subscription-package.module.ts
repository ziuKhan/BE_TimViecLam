import { Module } from '@nestjs/common';
import { SubscriptionPackageService } from './subscription-package.service';
import { SubscriptionPackageController } from './subscription-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPackage, SubscriptionPackageSchema } from './schemas/subscription-package.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPackage.name, schema: SubscriptionPackageSchema },
      { name: Transaction.name, schema: TransactionSchema },
  
    ])
  ],
  controllers: [SubscriptionPackageController],
  providers: [SubscriptionPackageService],
  exports: [SubscriptionPackageService]
})
export class SubscriptionPackageModule {}
