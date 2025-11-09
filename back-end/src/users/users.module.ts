import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepositoryPrisma } from './repositories/user-repository.prisma';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryPrisma,
    },
  ],
  exports: ['UserRepository', UsersService],
})
export class UsersModule {}
