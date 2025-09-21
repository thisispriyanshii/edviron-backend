import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsObject, 
  IsOptional, 
  Min, 
  Max, 
  IsEmail, 
  ValidateNested, 
  IsIn, 
  IsAlphanumeric,
  IsUUID,
  IsNumberString,
  IsPositive,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsString({ message: 'Student name must be a string' })
  @IsNotEmpty({ message: 'Student name is required' })
  name: string;

  @IsString({ message: 'Student ID must be a string' })
  @IsNotEmpty({ message: 'Student ID is required' })
  id: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class CreateOrderDto {
  @IsString({ message: 'School ID must be a string' })
  @IsNotEmpty({ message: 'School ID is required' })
  school_id: string;

  @IsString({ message: 'Trustee ID must be a string' })
  @IsOptional()
  trustee_id?: string;

  @IsObject({ message: 'Student info must be an object' })
  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;

  @IsString({ message: 'Gateway name must be a string' })
  @IsIn(['razorpay', 'stripe', 'paypal'], { 
    message: 'Unsupported payment gateway. Supported gateways are: razorpay, stripe, paypal' 
  })
  @IsNotEmpty({ message: 'Gateway name is required' })
  gateway_name: string;

  @IsString({ message: 'Custom order ID must be a string' })
  @IsAlphanumeric('en-US', { message: 'Custom order ID must contain only letters and numbers' })
  @IsOptional()
  custom_order_id?: string;

  @IsNumber({}, { message: 'Order amount must be a number' })
  @IsPositive({ message: 'Order amount must be a positive number' })
  @Min(1, { message: 'Order amount must be at least 1' })
  @Max(1000000, { message: 'Order amount cannot exceed 1,000,000' })
  @IsNotEmpty({ message: 'Order amount is required' })
  order_amount: number;
}
