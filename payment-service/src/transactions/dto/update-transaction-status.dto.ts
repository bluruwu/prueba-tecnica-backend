import { TransactionStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateTransactionStatusDto {
    @IsEnum(TransactionStatus)
    @IsNotEmpty()
    status: TransactionStatus;
}