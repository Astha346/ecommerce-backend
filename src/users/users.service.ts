import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Get all users
  async findAll() {
    return this.userModel.find();
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // Create user
  async create(userData: Partial<User>) {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByResetToken(
  token: string,
) {
  return this.userModel.findOne({
    resetPasswordToken:
      token,
  });
}
}