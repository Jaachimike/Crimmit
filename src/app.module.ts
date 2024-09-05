import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AppService} from "./app.service";
import {MongooseModule} from "@nestjs/mongoose";
import {AuthModule} from "./auth/auth.module";
import {UsersModule} from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
