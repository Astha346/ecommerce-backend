import {
  Module,
} from "@nestjs/common";

import {
  MongooseModule,
} from "@nestjs/mongoose";

import {
  Permission,
  PermissionSchema,
} from "./permission.schema";

import { PermissionsController } from "./permissions.controller";

import { PermissionsService } from "./permissions.service";



import {
  RolePermissionsModule,
} from "../role-permissions/role-permissions.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),

    RolePermissionsModule,
  ],

  controllers: [
    PermissionsController,
  ],

  providers: [
    PermissionsService,
    
  ],

  exports: [
    PermissionsService,
  ],
})
export class PermissionsModule {}