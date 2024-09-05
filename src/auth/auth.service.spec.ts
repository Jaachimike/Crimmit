import {Test, TestingModule} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {ConflictException, UnauthorizedException} from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {provide: UsersService, useValue: mockUsersService},
        {provide: JwtService, useValue: mockJwtService},
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerDto = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        ...registerDto,
        _id: "user_id",
      } as any);

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as never);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as never);

      const result = await authService.register(registerDto);

      expect(result).toEqual(expect.objectContaining({_id: "user_id"}));
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
          password: "hashedPassword",
        }),
      );
    });

    it("should throw ConflictException if username is taken", async () => {
      const registerDto = {
        username: "existinguser",
        email: "test@example.com",
        password: "password123",
      };

      usersService.findByUsername.mockResolvedValue({
        username: "existinguser",
      } as any);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException if email is already registered", async () => {
      const registerDto = {
        username: "testuser",
        email: "existing@example.com",
        password: "password123",
      };

      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue({
        email: "existing@example.com",
      } as any);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("validateUser", () => {
    it("should return user object if credentials are valid", async () => {
      const mockUser = {
        _id: "user_id",
        email: "test@example.com",
        password: "hashedPassword",
        toObject: jest.fn().mockReturnValue({
          _id: "user_id",
          email: "test@example.com",
          password: "hashedPassword",
        }),
      };

      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const result = await authService.validateUser(
        "test@example.com",
        "password123",
      );

      expect(result).toEqual({
        _id: "user_id",
        email: "test@example.com",
      });
    });

    it("should return null if user is not found", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser(
        "nonexistent@example.com",
        "password123",
      );

      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
      };

      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const result = await authService.validateUser(
        "test@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token for valid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "user_id",
        username: "testuser",
      };

      jest.spyOn(authService, "validateUser").mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue("mock_token");

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        access_token: "mock_token",
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: "testuser",
        sub: "user_id",
      });
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      jest.spyOn(authService, "validateUser").mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
