import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IntentionRepository } from './repositories/intention-repository.interface';
import { CreateIntentioDto } from './dto/create-intentio.dto';
import { UpdateIntentioDto } from './dto/update-intentio.dto';
import * as crypto from 'crypto';

@Injectable()
export class IntentiosService {
  constructor(
    @Inject('IntentionRepository')
    private readonly intentionRepository: IntentionRepository,
  ) {}

  create(createIntentioDto: CreateIntentioDto) {
    return this.intentionRepository.create(createIntentioDto);
  }

  findAll(groupId?: number, isAdmin = false) {
    if (!isAdmin && !groupId) {
      throw new BadRequestException('Group ID is required for non-admin users');
    }
    return this.intentionRepository.findAll(groupId);
  }

  async findOne(id: number) {
    const intention = await this.intentionRepository.findOne(id);
    if (!intention) {
      throw new NotFoundException(`Intention with ID ${id} not found`);
    }
    return intention;
  }

  async findByToken(token: string) {
    const intention = await this.intentionRepository.findByToken(token);
    if (!intention) {
      throw new NotFoundException('Invalid or expired token');
    }
    return intention;
  }

  async approve(id: number) {
    const intention = await this.findOne(id);
    if (!intention) {
      throw new NotFoundException('Intention not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    return this.intentionRepository.update(id, {
      status: 'approved',
      token,
    });
  }

  async reject(id: number) {
    const intention = await this.findOne(id);
    if (!intention) {
      throw new NotFoundException('Intention not found');
    }

    return this.intentionRepository.update(id, {
      status: 'rejected',
    });
  }

  update(id: number, updateIntentioDto: UpdateIntentioDto) {
    return this.intentionRepository.update(id, updateIntentioDto);
  }

  remove(id: number) {
    return this.intentionRepository.delete(id);
  }
}
