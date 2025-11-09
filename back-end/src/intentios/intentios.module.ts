import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IntentiosService } from './intentios.service';
import { IntentiosController } from './intentios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IntentionRepositoryPrisma } from './repositories/intention-repository.prisma';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [IntentiosController],
  providers: [
    IntentiosService,
    {
      provide: 'IntentionRepository',
      useClass: IntentionRepositoryPrisma,
    },
  ],
})
export class IntentiosModule {}
