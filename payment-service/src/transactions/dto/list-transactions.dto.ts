import { TransactionStatus, TransactionType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, Max, Min, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTransactionsDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;

    @IsOptional()
    @IsEnum(TransactionStatus)
    status?: TransactionStatus;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @IsOptional()
    @IsDateString()
    date_from?: string;

    @IsOptional()
    @IsDateString()
    date_to?: string;
}