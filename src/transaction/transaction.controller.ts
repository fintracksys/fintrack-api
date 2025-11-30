import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClassifyTransactionDto } from './dto/classify-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './services/transaction.service';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ description: 'Transação criada com sucesso' })
  create(@Body() dto: CreateTransactionDto, @Request() req: any) {
    return this.transactionService.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de transações do usuário' })
  findAll(@Request() req: any) {
    return this.transactionService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da transação' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID da transação' })
  @ApiBody({ type: UpdateTransactionDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Request() req: any,
  ) {
    return this.transactionService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da transação' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.remove(id, req.user.userId);
  }

  @Post('classify')
  @ApiBody({ type: ClassifyTransactionDto })
  @ApiCreatedResponse({ description: 'Transação classificada com sucesso' })
  async classify(
    @Body() dto: ClassifyTransactionDto,
    @Request() req: any,
  ): Promise<any> {
    return await this.transactionService.executeAsync(dto, req.user.userId);
  }
}
