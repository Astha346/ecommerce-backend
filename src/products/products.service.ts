import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  Product,
  ProductDocument,
} from "./product.schema";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  create(product: any) {
    return this.productModel.create(product);
  }

  // =========================================================
  // GET ALL PRODUCTS
  // PAGINATION
  // =========================================================

  async findAll(
    page: number = 1,
    limit: number = 5,
    search: string = "",
    category: string = "",
  ) {
    // Make sure page is at least 1
    page = Math.max(
      Number(page) || 1,
      1,
    );

    // Make sure limit is at least 1
    limit = Math.max(
      Number(limit) || 5,
      1,
    );

    // Maximum 100 products per request
    limit = Math.min(
      limit,
      100,
    );

    // Calculate how many products to skip
    const skip =
      (page - 1) * limit;

    // Build filter
    const filter: any = {};

    // Search
    const cleanSearch =
      search.trim();

    if (cleanSearch) {
      filter.$or = [
        {
          name: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    const cleanCategory =
      category.trim();

    if (
      cleanCategory &&
      cleanCategory !== "all"
    ) {
      filter.category =
        cleanCategory;
    }

    // Get products and total count together
    const [
      products,
      total,
    ] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.productModel.countDocuments(
        filter,
      ),
    ]);

    // Calculate total pages
    const totalPages =
      Math.ceil(
        total / limit,
      );

    // Make sure totalPages is at least 1
    const safeTotalPages =
      Math.max(
        totalPages,
        1,
      );

    // Return products + pagination information
    return {
      products,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          safeTotalPages,

        hasNextPage:
          page <
          safeTotalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  // =========================================================
  // GET SINGLE PRODUCT
  // IMPORTANT FOR CHECKOUT
  // =========================================================

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  update(
    id: string,
    data: any,
  ) {
    return this.productModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );
  }

  // =========================================================
  // SEARCH / SUGGESTIONS
  // AUTOCOMPLETE
  // =========================================================

  getSuggestions(q: string) {
    if (!q) {
      return [];
    }

    return this.productModel
      .find({
        name: {
          $regex: q,
          $options: "i",
        },
      })
      .limit(5);
  }

  // =========================================================
  // GET PRODUCTS BY CATEGORY
  // =========================================================

  async getProductsByCategory() {
    const products =
      await this.productModel
        .find()
        .lean();

    const grouped:
      Record<string, any[]> = {};

    for (const product of products) {
      const originalCategory =
        product.category?.trim();

      if (!originalCategory) {
        continue;
      }

      const categoryKey =
        originalCategory.toLowerCase();

      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }

      grouped[categoryKey].push(
        product,
      );
    }

    return grouped;
  }
}