import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {User} from "../users/schemas/user.schema";
import * as bcrypt from "bcryptjs";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {CreateUserDto} from "src/users/dto/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new user
  async register(registerDto: RegisterDto): Promise<User> {
    const {password, ...userData} = registerDto;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password
    const user: CreateUserDto = {
      ...userData,
      password: hashedPassword,
    };

    return this.usersService.create(user);
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<any> {
    // Fetch user by email
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Return user data without the password
      const {password, ...result} = user.toObject();
      return result;
    }
    return null; // Return null if validation fails
  }

  // User login
  async login(loginDto: LoginDto) {
    const {email, password} = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate JWT payload
    const payload = {username: user.username, sub: user._id};

    // Return JWT token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
