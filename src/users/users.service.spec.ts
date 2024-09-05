import {Test, TestingModule} from "@nestjs/testing";
import {UsersService} from "./users.service";
import {getModelToken} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "./schemas/user.schema";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {NotFoundException} from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: "a-mock-id",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
  };

  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const result = await service.create(createUserDto);

      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      jest.spyOn(mockUserModel, "find").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockUser]),
      } as any);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });

    it("should throw NotFoundException if no users are found", async () => {
      jest.spyOn(mockUserModel, "find").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      jest.spyOn(mockUserModel, "findById").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findById("a-mock-id");

      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user is not found", async () => {
      jest.spyOn(mockUserModel, "findById").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      jest.spyOn(mockUserModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
    });

    it("should return null if user is not found", async () => {
      jest.spyOn(mockUserModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("should return a user by username", async () => {
      jest.spyOn(mockUserModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findByUsername("testuser");

      expect(result).toEqual(mockUser);
    });

    it("should return null if user is not found", async () => {
      jest.spyOn(mockUserModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findByUsername("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = {email: "updated@example.com"};

      jest.spyOn(mockUserModel, "findByIdAndUpdate").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({...mockUser, ...updateUserDto}),
      } as any);

      const result = await service.update("a-mock-id", updateUserDto);

      expect(result).toEqual({...mockUser, ...updateUserDto});
    });

    it("should throw NotFoundException if user to update is not found", async () => {
      jest.spyOn(mockUserModel, "findByIdAndUpdate").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.update("non-existent-id", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      jest.spyOn(mockUserModel, "findByIdAndDelete").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.delete("a-mock-id");

      expect(result).toEqual({
        message: "User Deleted Successfully",
        deletedUser: mockUser,
      });
    });

    it("should throw NotFoundException if user to delete is not found", async () => {
      jest.spyOn(mockUserModel, "findByIdAndDelete").mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.delete("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
