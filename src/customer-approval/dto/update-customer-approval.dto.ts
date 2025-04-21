import { PartialType } from '@nestjs/swagger';
import { CreateCustomerApprovalDto } from './create-customer-approval.dto';

export class UpdateCustomerApprovalDto extends PartialType(CreateCustomerApprovalDto) {}
