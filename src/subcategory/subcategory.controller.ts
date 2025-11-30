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
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { SubcategoryService } from './services/subcategory.service';

@ApiTags('Subcategories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('subcategories')
export class SubcategoryController {
  constructor(private readonly service: SubcategoryService) {}

  @Post()
  @ApiBody({ type: CreateSubcategoryDto })
  @ApiCreatedResponse({ description: 'Subcategoria criada com sucesso' })
  create(@Body() dto: CreateSubcategoryDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de subcategorias do usuário' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da subcategoria' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID da subcategoria' })
  @ApiBody({ type: UpdateSubcategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubcategoryDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da subcategoria' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
