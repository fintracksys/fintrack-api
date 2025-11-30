import { Module } from '@nestjs/common';
import { SubcategoryService } from './services/subcategory.service';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryRepository } from './repositories/subcategory.repository';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService, SubcategoryRepository],
})
export class SubcategoryModule {}
