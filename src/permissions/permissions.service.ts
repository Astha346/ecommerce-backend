import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  Permission,
  PermissionDocument,
} from "./permission.schema";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  create(data: any) {
    return this.permissionModel.create(data);
  }

  findAll() {
    return this.permissionModel.find();
  }
}