import {Module} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {JwtStrategy} from "./jwt.strategy";
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {expiresIn: "1h"},
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

// {
//   secret: process.env.JWT_SECRET,
//   signOptions: {expiresIn: "60m"},
// }
