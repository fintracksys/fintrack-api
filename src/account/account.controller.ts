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
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountService } from './services/account.service';

@ApiTags('Accounts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({ description: 'Conta criada com sucesso' })
  create(@Body() dto: CreateAccountDto, @Request() req: any) {
    return this.accountService.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de contas do usuário' })
  findAll(@Request() req: any) {
    return this.accountService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da conta' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.accountService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID da conta' })
  @ApiBody({ type: UpdateAccountDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() req: any,
  ) {
    return this.accountService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da conta' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.accountService.remove(id, req.user.userId);
  }
}
