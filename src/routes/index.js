'use strict'
const express = require('express')

const { apiKey, permission } = require('../auth/checkAuth');
const asyncHandler = require('../helpers/asyncHandler');
const router=express.Router()

// check apiKey
router.use(asyncHandler(apiKey));
// check permission
router.use(permission("0000"));

// signUp
router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api/cart", require("./cart"));
router.use("/v1/api", require("./access"));

module.exports=router