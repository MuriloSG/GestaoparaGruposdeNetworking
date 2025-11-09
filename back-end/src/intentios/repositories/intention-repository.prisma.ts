import { Injectable } from '@nestjs/common';
import { MembershipIntention } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateIntentioDto } from '../dto/update-intentio.dto';
import { IntentionRepository, CreateIntentionData } from './intention-repository.interface';

@Injectable()
export class IntentionRepositoryPrisma implements IntentionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIntentionData): Promise<MembershipIntention> {
    return this.prisma.membershipIntention.create({
      data,
    });
  }

  async findAll(groupId?: number): Promise<MembershipIntention[]> {
    return this.prisma.membershipIntention.findMany({
      where: groupId ? { group_id: groupId } : {},
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number): Promise<MembershipIntention | null> {
    return this.prisma.membershipIntention.findUnique({
      where: { id },
    });
  }

  async findByToken(token: string): Promise<MembershipIntention | null> {
    return this.prisma.membershipIntention.findUnique({
      where: { token },
    });
  }

  async update(
    id: number,
    data: UpdateIntentioDto | { status: 'approved' | 'rejected'; token?: string },
  ): Promise<MembershipIntention> {
    return this.prisma.membershipIntention.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.membershipIntention.delete({
      where: { id },
    });
  }
}