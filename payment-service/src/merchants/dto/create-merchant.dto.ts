import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateMerchantDto {
  @IsNotEmpty({ message: 'The name is required' })
  @IsString({ message: 'The name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'The email is required' })
  @IsEmail({}, { message: 'The email must be a valid email' })
  email: string;
}
