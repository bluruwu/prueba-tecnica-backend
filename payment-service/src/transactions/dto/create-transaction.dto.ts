import { Currency, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateTransactionDto {
    @IsUUID()
    @IsNotEmpty()
    merchant_id: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    amount: number;

    @IsEnum(Currency)
    currency: Currency;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}