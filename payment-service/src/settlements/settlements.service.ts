import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) { }

  async generate(dto: CreateSettlementDto) {
    const { merchant_id, period_start, period_end } = dto;

    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchant_id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant with id '${merchant_id}' not found`);
    }

    const eligibleTransactions = await this.prisma.transaction.findMany({
      where: {
        merchantId: merchant_id,
        status: TransactionStatus.approved,
        createdAt: {
          gte: new Date(period_start),
          lte: new Date(period_end),
        },
        settlement: null,
      },
    });

    if (eligibleTransactions.length === 0) {
      throw new NotFoundException(
        `There are no eligible transactions for the merchant '${merchant_id}' in the indicated period`,
      );
    }

    const totalAmount = eligibleTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return this.prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.create({
        data: {
          merchantId: merchant_id,
          totalAmount,
          transactionCount: eligibleTransactions.length,
          periodStart: new Date(period_start),
          periodEnd: new Date(period_end),
        },
      });

      await tx.settlementTransaction.createMany({
        data: eligibleTransactions.map((t) => ({
          settlementId: settlement.id,
          transactionId: t.id,
        })),
      });

      return settlement;
    });
  }

  async findOne(id: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id },
      include: {
        merchant: true,
        transactions: {
          include: { transaction: true },
        },
      },
    });
    if (!settlement) {
      throw new NotFoundException(`Settlement with id '${id}' not found`);
    }
    return settlement;
  }
}
