import { Injectable } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) { }

  async create(createMerchantDto: CreateMerchantDto) {
    const newApiKey = `pk_test_${crypto.randomUUID()}`;
    return this.prisma.merchant.create({
      data: {
        name: createMerchantDto.name,
        email: createMerchantDto.email,
        apiKey: newApiKey,
      },
    });
  }

  findAll() {
    return `This action returns all merchants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} merchant`;
  }

  update(id: number, updateMerchantDto: UpdateMerchantDto) {
    return `This action updates a #${id} merchant`;
  }

  remove(id: number) {
    return `This action removes a #${id} merchant`;
  }
}
