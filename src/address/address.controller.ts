import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { AddressService } from "./address.service";

@Controller("addresses")
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.addressService.create(body);
  }

  @Get(":userId")
  findByUser(@Param("userId") userId: string) {
    return this.addressService.findByUser(userId);
  }

  @Get(":userId/:id")
  findOne(
    @Param("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.addressService.findOne(id, userId);
  }

  @Patch(":userId/:id")
  update(
    @Param("userId") userId: string,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.addressService.update(
      id,
      userId,
      body,
    );
  }

  @Delete(":userId/:id")
  remove(
    @Param("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.addressService.remove(id, userId);
  }
}