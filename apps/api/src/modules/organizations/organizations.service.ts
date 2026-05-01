import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    this.logger.debug(`Finding organization by id: ${id}`);
    // TODO: Implement after Prisma schema
    return null;
  }

  async findByUserId(userId: string) {
    this.logger.debug(`Finding organizations for user: ${userId}`);
    return [];
  }
}
