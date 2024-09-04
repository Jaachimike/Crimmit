import {Controller, Post, Body, HttpCode, HttpStatus} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Route to handle user registration
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {message: "User registered successfully", user};
  }

  // Route to handle user login
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return {access_token: token};
  }
}
