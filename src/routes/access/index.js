'use strict'
const express=require('express')
const accessController=require('../../controllers/access.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication,authenticationv2 } = require('../../auth/authUtils');

const router=express.Router()

// signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

// authentication
router.use(authenticationv2);
// logout
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandler(accessController.handlerRefreshToken)
);
module.exports=router