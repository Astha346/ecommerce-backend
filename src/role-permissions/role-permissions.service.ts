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
    private rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

   async create(data: any) {
  return this.rolePermissionModel.create(data);
}

  async getPermissionsByRole(roleId: string) {
    return this.rolePermissionModel
      .find({ role: roleId })
      .populate("permission");
  }
}