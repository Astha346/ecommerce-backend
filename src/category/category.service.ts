import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  Category,
  CategoryDocument,
} from "./category.schema";

import {
  Product,
  ProductDocument,
} from "../products/product.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  async create(category: Partial<Category>) {
    return this.categoryModel.create(category);
  }

  // ==========================================
  // GET CATEGORIES WITH PAGINATION
  // ==========================================

  async findAll(
    page: number = 1,
    limit: number = 5,
    search: string = "",
    status: string = "",
  ) {
    page = Math.max(Number(page) || 1, 1);

    limit = Math.max(Number(limit) || 5, 1);

    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    const filter: any = {};

    const cleanSearch = search.trim();

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

    const cleanStatus = status.trim();

    if (
      cleanStatus &&
      cleanStatus !== "all"
    ) {
      filter.status = cleanStatus;
    }

    const [categories, total] =
      await Promise.all([
        this.categoryModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.categoryModel.countDocuments(
          filter,
        ),
      ]);

    const totalPages =
      Math.ceil(total / limit);

    const safeTotalPages =
      Math.max(totalPages, 1);

    return {
      categories,

      pagination: {
        page,
        limit,
        total,
        totalPages: safeTotalPages,
        hasNextPage:
          page < safeTotalPages,
        hasPreviousPage:
          page > 1,
      },
    };
  }

  // ==========================================
  // SYNC CATEGORIES FROM PRODUCTS
  // ==========================================

  async syncCategoriesFromProducts() {
    // Get all products
    const products =
      await this.productModel
        .find({})
        .select("category")
        .lean();

    // Get category names from products
    const categoryNames =
      products
        .map((product) =>
          String(product.category ?? "").trim()
        )
        .filter(
          (name) => name.length > 0
        );

    // Remove duplicate names
    const uniqueCategoryNames = [
      ...new Set(
        categoryNames.map(
          (name) => name.toLowerCase()
        ),
      ),
    ];

    // Get existing categories
    const existingCategories =
      await this.categoryModel
        .find({})
        .select("name")
        .lean();

    // Existing category names
    const existingNames = new Set(
      existingCategories.map(
        (category) =>
          String(category.name ?? "")
            .trim()
            .toLowerCase(),
      ),
    );

    // Only create categories that don't exist
    const missingCategories =
      uniqueCategoryNames.filter(
        (name) =>
          !existingNames.has(name),
      );

    const createdCategories = [];

    for (const categoryName of missingCategories) {
      // Find the original capitalization
      const originalName =
        categoryNames.find(
          (name) =>
            name.toLowerCase() ===
            categoryName,
        ) || categoryName;

      const category =
        await this.categoryModel.create({
          name: originalName,
          description: `${originalName} products`,
          image: "",
          parentId:  undefined,
          productCount: 0,
          status: "active",
        });

      createdCategories.push(category);
    }

    return {
      message:
        "Categories synchronized successfully",

      productsChecked:
        products.length,

      existingCategories:
        existingCategories.length,

      categoriesCreated:
        createdCategories.length,

      createdCategories:
        createdCategories.map(
          (category) => ({
            _id: category._id,
            name: category.name,
          }),
        ),
    };
  }

  // ==========================================
  // GET SINGLE CATEGORY
  // ==========================================

  async findOne(id: string) {
    return this.categoryModel.findById(id);
  }

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  async update(
    id: string,
    category: Partial<Category>,
  ) {
    return this.categoryModel.findByIdAndUpdate(
      id,
      category,
      {
        new: true,
      },
    );
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  async remove(id: string) {
    return this.categoryModel.findByIdAndDelete(
      id,
    );
  }
}