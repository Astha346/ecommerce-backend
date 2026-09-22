import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role, RoleDocument } from "./schemas/role.schema";

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  // Create Role
  async create(roleData: Partial<Role>) {
    const role = new this.roleModel(roleData);
    return role.save();
  }

  // Get All Roles
  async findAll() {
    return this.roleModel.find();
  }

  // Find Role by Name
  async findByName(name: string) {
    return this.roleModel.findOne({ name });
  }

  // Find Role by ID
  async findById(id: string) {
    return this.roleModel.findById(id);
  }

  // Assign Permissions to Role
  async updatePermissions(roleId: string, permissionIds: string[]) {
    return this.roleModel.findByIdAndUpdate(
      roleId,
      {
        permissions: permissionIds,
      },
      {
        new: true,
      },
    );
  }
}