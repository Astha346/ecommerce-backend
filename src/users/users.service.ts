import {
  Injectable,
} from "@nestjs/common";

import {
  InjectModel,
} from "@nestjs/mongoose";

import {
  Model,
} from "mongoose";

import {
  User,
  UserDocument,
} from "./user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // ==========================================
  // GET ALL USERS
  // ==========================================

  async findAll() {
    return this.userModel
      .find()
      .populate("role")
      .exec();
  }

  // ==========================================
  // FIND USER BY EMAIL
  // ==========================================

  async findByEmail(
    email: string,
  ) {
    return this.userModel
      .findOne({
        email,
      })
      .populate("role")
      .exec();
  }

  // ==========================================
  // CREATE USER
  // ==========================================

  async create(
    userData: Partial<User>,
  ) {
    const user =
      new this.userModel(userData);

    return user.save();
  }

  // ==========================================
  // FIND USER BY ID
  // ==========================================

  async findById(
    id: string,
  ) {
    return this.userModel
      .findById(id)
      .populate("role")
      .exec();
  }

  // ==========================================
  // FIND USER BY REFRESH TOKEN
  // ==========================================

  async findByRefreshToken(
    refreshToken: string,
  ) {
    return this.userModel
      .findOne({
        refreshToken:
          refreshToken,
      })
      .populate("role")
      .exec();
  }

  // ==========================================
  // FIND USER BY RESET TOKEN
  // ==========================================

  async findByResetToken(
    token: string,
  ) {
    return this.userModel
      .findOne({
        resetPasswordToken:
          token,
      })
      .exec();
  }
}