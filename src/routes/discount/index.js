"use strict";
const express = require("express");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication, authenticationv2 } = require("../../auth/authUtils");

// get amount a discount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodesWithProduct)
);

// authentication
router.use(authenticationv2);
router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodes));
module.exports = router;
