import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import * as crypto from 'crypto';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  pending: [TransactionStatus.approved, TransactionStatus.rejected, TransactionStatus.failed],
  approved: [TransactionStatus.completed, TransactionStatus.failed],
  rejected: [],
  failed: [],
  completed: [],
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) { }

  private generateReference(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TXN-${dateStr}-${randomChars}`;
  }

  async create(dto: CreateTransactionDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: dto.merchant_id }
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with id ${dto.merchant_id} not found`);
    }

    const reference = this.generateReference();
    return this.prisma.transaction.create({
      data: {
        merchantId: dto.merchant_id,
        amount: dto.amount,
        currency: dto.currency,
        type: dto.type,
        reference,
        metadata: dto.metadata ? (dto.metadata as any) : undefined,
      },
    });
  }

  async findAll(query: ListTransactionsDto) {
    const { page = 1, limit = 20, status, type, date_from, date_to } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    if (date_from || date_to) {
      where.createdAt = {
        ...(date_from && { gte: new Date(date_from) }),
        ...(date_to && { lte: new Date(date_to) }),
      };
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id '${id}' not found`);
    }
    return transaction;

  }
  async updateStatus(id: string, dto: UpdateTransactionStatusDto) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id '${id}' not found`);
    }

    const allowedTransitions = VALID_TRANSITIONS[transaction.status];

    if (!allowedTransitions.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Invalid transition: Cannot change from '${transaction.status}' to '${dto.status}'`
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}