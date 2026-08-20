import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  RolePermission,
  RolePermissionDocument,
} from "./schemas/role-permission.schema";

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  // Create one role permission
  async create(data: any) {
    return this.rolePermissionModel.create(data);
  }

  // Get all permissions of a role
  async getPermissionsByRole(roleId: string) {
    return this.rolePermissionModel
      .find({
        role: roleId,
      })
      .populate("permission");
  }

  // Delete all permissions of a role
  async deleteByRole(roleId: string) {
    return this.rolePermissionModel.deleteMany({
      role: roleId,
    });
  }
}