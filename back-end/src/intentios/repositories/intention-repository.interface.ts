import { MembershipIntention } from '@prisma/client';
import { UpdateIntentioDto } from '../dto/update-intentio.dto';
import { CreateIntentioDto } from '../dto/create-intentio.dto';

export type CreateIntentionData = CreateIntentioDto;

export interface IntentionRepository {
  create(data: CreateIntentionData): Promise<MembershipIntention>;
  findAll(groupId?: number): Promise<MembershipIntention[]>;
  findOne(id: number): Promise<MembershipIntention | null>;
  findByToken(token: string): Promise<MembershipIntention | null>;
  update(id: number, data: UpdateIntentioDto | { status: 'approved' | 'rejected', token?: string }): Promise<MembershipIntention>;
  delete(id: number): Promise<void>;
}