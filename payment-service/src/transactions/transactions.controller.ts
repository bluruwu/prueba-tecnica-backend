import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { ApiKeyGuard } from 'src/merchants/guards/api-key-guard';
import { CurrentMerchant } from 'src/merchants/decorators/current-merchant.decorator';
import type { Merchant } from '@prisma/client';

@Controller('transactions')
@UseGuards(ApiKeyGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentMerchant() merchant: Merchant,
  ) {
    if (createTransactionDto.merchant_id !== merchant.id) {
      throw new ForbiddenException('You do not have permission to operate with this merchant_id');
    }
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(@Query() query: ListTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, updateTransactionStatusDto);
  }
}
