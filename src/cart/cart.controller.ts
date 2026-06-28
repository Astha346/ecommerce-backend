import { Controller, Get, Post, Body, Delete, Param } from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller("cart") // ✅ VERY IMPORTANT
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("add") // ✅ THIS MUST MATCH
  add(@Body() body: any) {
    return this.cartService.addToCart(body);
  }

  @Get(":userId")
  getCart(@Param("userId") userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.cartService.removeFromCart(id);
  }

  @Delete("clear/:userId")
  clear(@Param("userId") userId: string) {
    return this.cartService.clearCart(userId);
  }
}