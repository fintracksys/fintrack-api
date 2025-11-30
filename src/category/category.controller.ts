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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './services/category.service';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  @ApiBody({ type: CreateCategoryDto })
  @ApiCreatedResponse({ description: 'Categoria criada com sucesso' })
  create(@Body() dto: CreateCategoryDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de categorias do usuário' })
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
