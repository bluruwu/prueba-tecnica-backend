import { IsDateString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateSettlementDto {
    @IsUUID()
    @IsNotEmpty()
    merchant_id: string;

    @IsDateString()
    @IsNotEmpty()
    period_start: string;

    @IsDateString()
    @IsNotEmpty()
    period_end: string;
}