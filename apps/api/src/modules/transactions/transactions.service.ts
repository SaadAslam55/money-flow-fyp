import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  async findAll(orgId: string) {
    return [];
  }
  async findById(id: string) {
    return null;
  }
  async create(orgId: string, data: any) {
    return { id: 'new', ...data };
  }
  async update(id: string, data: any) {
    return { id, ...data };
  }
  async delete(id: string) {
    return { deleted: true };
  }
}
