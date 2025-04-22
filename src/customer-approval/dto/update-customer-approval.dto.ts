import { PartialType } from '@nestjs/swagger';
import { CreateCustomerApprovalDto } from './create-customer-approval.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerApprovalDto extends PartialType(CreateCustomerApprovalDto) {

    @IsOptional()
    @IsString()
    reason: string;
}
