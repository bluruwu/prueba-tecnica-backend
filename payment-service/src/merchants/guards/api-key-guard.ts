import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { MerchantStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const merchant = await this.prisma.merchant.findUnique({ where: { apiKey } });

    if (!merchant) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (merchant.status === MerchantStatus.inactive) {
      throw new ForbiddenException('Merchant account is inactive');
    }

    request.merchant = merchant;
    return true;
  }
}
