import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { ApiKeyGuard } from 'src/merchants/guards/api-key-guard';
import { CurrentMerchant } from 'src/merchants/decorators/current-merchant.decorator';
import type { Merchant } from '@prisma/client';

@Controller('settlements')
@UseGuards(ApiKeyGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) { }

  @Post('generate')
  generate(
    @Body() createSettlementDto: CreateSettlementDto,
    @CurrentMerchant() merchant: Merchant,
  ) {
    if (createSettlementDto.merchant_id !== merchant.id) {
      throw new ForbiddenException('You do not have permission to operate with this merchant_id');
    }
    return this.settlementsService.generate(createSettlementDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.settlementsService.findOne(id);
  }
}
