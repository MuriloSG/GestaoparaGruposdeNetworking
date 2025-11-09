import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  getProfile(@CurrentUser() user) {
    return this.usersService.findOne(user.id);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user,
  ) {
    if (user.id !== +id) {
      throw new UnauthorizedException('Você só pode atualizar seu próprio perfil');
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
