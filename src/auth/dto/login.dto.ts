import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'fenix.drs@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Fenix0809??' })
  @IsString()
  @MinLength(6)
  password: string;
}
