import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeyGuard } from './guards/api-key-guard';

@Module({
  imports: [PrismaModule],
  controllers: [MerchantsController],
  providers: [MerchantsService, ApiKeyGuard],
  exports: [MerchantsService, ApiKeyGuard]
})
export class MerchantsModule { }
