import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AppService} from "./app.service";
import {MongooseModule} from "@nestjs/mongoose";
import {AuthModule} from "./auth/auth.module";
import {UsersModule} from "./users/users.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      "mongodb+srv://okaforjaachi:ow6cdXAsMuqSsDo2@cluster0.6ox8a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
