import { Module } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SettlementsController } from './settlements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MerchantsModule } from 'src/merchants/merchants.module';

@Module({
  imports: [PrismaModule, MerchantsModule],
  controllers: [SettlementsController],
  providers: [SettlementsService],
})
export class SettlementsModule { }
