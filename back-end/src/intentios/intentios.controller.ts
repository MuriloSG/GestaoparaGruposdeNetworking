import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { IntentiosService } from './intentios.service';
import { CreateIntentioDto } from './dto/create-intentio.dto';
import { UpdateIntentioDto } from './dto/update-intentio.dto';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('intentios')
export class IntentiosController {
  constructor(private readonly intentiosService: IntentiosService) {}

  @Post()
  create(@Body() createIntentioDto: CreateIntentioDto) {
    return this.intentiosService.create(createIntentioDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('groupId') groupId?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user?.is_admin ?? false;
    return this.intentiosService.findAll(
      groupId ? +groupId : undefined,
      isAdmin,
    );
  }

  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.intentiosService.findByToken(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.intentiosService.findOne(+id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  approve(@Param('id') id: string) {
    return this.intentiosService.approve(+id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  reject(@Param('id') id: string) {
    return this.intentiosService.reject(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateIntentioDto: UpdateIntentioDto,
  ) {
    return this.intentiosService.update(+id, updateIntentioDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.intentiosService.remove(+id);
  }
}
