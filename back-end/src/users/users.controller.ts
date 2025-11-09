import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    if (!user.is_admin) {
      throw new UnauthorizedException('Acesso negado. Apenas administradores podem listar todos os usuários.');
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (!user.is_admin && user.sub !== +id) {
      throw new UnauthorizedException('Você só pode visualizar seu próprio perfil');
    }
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.sub !== +id) {
      throw new UnauthorizedException('Você só pode atualizar seu próprio perfil');
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (!user.is_admin) {
      throw new UnauthorizedException('Apenas administradores podem remover usuários');
    }
    if (user.sub === +id) {
      throw new UnauthorizedException('Você não pode remover seu próprio usuário');
    }
    return this.usersService.remove(+id);
  }
}
