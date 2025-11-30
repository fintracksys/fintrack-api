import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClassifyTransactionDto {
  @ApiProperty({
    example: 'abc123',
    description: 'ID da transação a ser classificada',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'abc123' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: 'abc123' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'abc123' })
  @IsString()
  subcategoryId: string;

  @ApiProperty({ example: 'abc123' })
  @IsString()
  transactionTypeId: string;

  @ApiProperty({
    example:
      'https://sat.sef.sc.gov.br/tax.NET/Sat.DFe.NFCe.Web/Consultas/NFCe_Detalhes.aspx?rq=t8BOzGQxqyEgg9ZZ95dPZWzijZwmn14zEtHkyIZLtmQl2IyhyB2f8WdmhWePZjUrmSmnKVGsa6gU2FgdT2wRlphAuoa85lrPSe8U4ot4ABZ6%2FPqfD7yE7n%2BUhrddHy7lSjRiL7rEPL78lj77UbpgwjQg9fC%2BI%2BAe',
    required: false,
  })
  @IsOptional()
  @IsString()
  urlNfe?: string;
}
