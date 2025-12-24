// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';

// @Module({
//   imports: [
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('jwt.secret'),
//         signOptions: {
//           expiresIn: configService.get<string>('jwt.expiresIn') || '7d',
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService],
//   exports: [AuthService, JwtModule],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get('jwt.expiresIn') ?? '7d') as
          | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
          | number;

        return {
          secret: configService.getOrThrow<string>('jwt.secret'),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

