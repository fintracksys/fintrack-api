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
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { TransactionTypeService } from './services/transaction-type.service';

@ApiTags('Transaction Types')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transaction-types')
export class TransactionTypeController {
  constructor(private readonly service: TransactionTypeService) {}

  @Post()
  @ApiBody({ type: CreateTransactionTypeDto })
  @ApiCreatedResponse({ description: 'Tipo de transação criado com sucesso' })
  create(@Body() dto: CreateTransactionTypeDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de tipos de transação do usuário' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do tipo de transação' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID do tipo de transação' })
  @ApiBody({ type: UpdateTransactionTypeDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionTypeDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID do tipo de transação' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
