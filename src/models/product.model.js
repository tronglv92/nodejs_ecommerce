"use strict";
const { Schema, model, default: mongoose } = require("mongoose");
const slugify = require("slugify");

const PRODUCT_DOCUMENT_NAME = "Product";
const PRODUCT_COLLECTION_NAME = "Products";
const CLOTHE_DOCUMENT_NAME = "Clothe";
const CLOTHE_COLLECTION_NAME = "Clothes";
const ELECTRONIC_DOCUMENT_NAME = "Electronic";
const ELECTRONIC_COLLECTION_NAME = "Electronics";
const FURNITURE_DOCUMENT_NAME = "Furniture";
const FURNITURE_COLLECTION_NAME = "Furnitures";
var productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: String,
    product_slug: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    // more
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      // 4.34 => 4.3
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    collection: PRODUCT_COLLECTION_NAME,
    timestamps: true,
  }
);
// create index for search
productSchema.index({product_name:'text',product_description:'text'})

// Document middleware: runs before .save() and . create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// define the product type = clothing
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: CLOTHE_COLLECTION_NAME,
    timestamps: true,
  }
);
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: ELECTRONIC_COLLECTION_NAME,
    timestamps: true,
  }
);
const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: FURNITURE_COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: mongoose.model(PRODUCT_DOCUMENT_NAME, productSchema),
  electronic: mongoose.model(ELECTRONIC_DOCUMENT_NAME, electronicSchema),
  clothing: mongoose.model(CLOTHE_DOCUMENT_NAME, clothingSchema),
  furniture: mongoose.model(FURNITURE_DOCUMENT_NAME, furnitureSchema),
};
