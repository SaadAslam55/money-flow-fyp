import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async findAll(organizationId: string, options?: { page?: number; limit?: number }) {
    const cacheKey = `invoices:${organizationId}:list`;

    return this.redis.cache(
      cacheKey,
      async () => {
        // TODO: Implement after Prisma schema
        this.logger.debug(`Fetching invoices for org: ${organizationId}`);
        return [];
      },
      300 // 5 minutes cache
    );
  }

  async findById(id: string, organizationId: string) {
    const cacheKey = `invoices:${organizationId}:${id}`;

    return this.redis.cache(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching invoice: ${id}`);
        return null;
      },
      300
    );
  }

  async create(organizationId: string, data: any) {
    this.logger.debug(`Creating invoice for org: ${organizationId}`);
    // TODO: Implement after Prisma schema
    return { id: 'new-id', ...data };
  }

  async update(id: string, organizationId: string, data: any) {
    this.logger.debug(`Updating invoice: ${id}`);
    await this.redis.del(`invoices:${organizationId}:${id}`);
    return { id, ...data };
  }

  async delete(id: string, organizationId: string) {
    this.logger.debug(`Deleting invoice: ${id}`);
    await this.redis.del(`invoices:${organizationId}:${id}`);
    return { deleted: true };
  }
}
