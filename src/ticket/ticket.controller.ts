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
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './services/ticket.service';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Post()
  @ApiBody({ type: CreateTicketDto })
  @ApiCreatedResponse({ description: 'Ticket criado com sucesso' })
  create(@Body() dto: CreateTicketDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de tickets do usuário' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiBody({ type: UpdateTicketDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
