"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getIntoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenRequestError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
    check this token used
  */
  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenRequestError("Something wrong happend!! Pls relogin");
    }
    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop not registered");

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered 2");

    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    // await KeyTokenService.createKeyToken({
    //   userId: userId,
    //   refreshToken: tokens.refreshToken,
    //   // privateKey,
    //   publicKey,
    // });
    await KeyTokenService.updateKeyToken({
      id: keyStore._id,
      refreshTokenNew: tokens.refreshToken,
      refreshTokenOld: refreshToken,
      publicKey,
    });

    console.log("user::", user);
    console.log("tokens::", tokens);
    return {
      user,
      tokens,
    };
  };
  static handlerRefreshToken = async (refreshToken) => {
    // check xem token nay da duoc su dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    console.log("foundToken::", foundToken);
    // neu co
    if (foundToken) {
      // decode xem may thang nao
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // xoa tat ca token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenRequestError(
        "Some thing wrong happend !! Pls relogin"
      );
    }

    // No, qua ngon
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");
    console.log("holderToken::", holderToken);
    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("[2]--", { userId, email });
    //check Userid
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // create 1 cap moi
    const tokens = await createTokenPair(
      {
        userId: userId,
        email,
      },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update token
    await KeyTokenService.updateRefreshToken({
      id: holderToken._id,
      refreshTokenNew: tokens.refreshToken,
      refreshTokenOld: refreshToken,
    });
    //update token
    //  await holderToken.updateOne({
    //    $set: {
    //      refreshToken: tokens.refreshToken,
    //    },
    //    $addToSet: {
    //      refreshTokensUsed:refreshToken
    //    },
    //  });

    return {
      user: { userId, email },
      tokens,
    };
  };
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
  /*
    1 - check email in dbs
    2 - match password
    3 - create AT vs RT and save
    4 - generate tokens
    5 - get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3.
    // created privateKey, publicKey
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    let userId = foundShop._id;
    // created token pair

    const publicKeyString = publicKey.toString();
    const tokens = await createTokenPair(
      {
        userId: userId,
        email,
      },
      publicKeyString,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: userId,
      refreshToken: tokens.refreshToken,
      // privateKey,
      publicKey,
    });
    return {
      shop: getIntoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    // step1: check email exists??
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Eror: shop already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      email,
      name,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    if (newShop) {
      // created privateKey, publicKey
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      console.log({ privateKey, publicKey });

      const publicKeyString = publicKey.toString();

      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKeyString,
        privateKey
      );
      await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        // privateKey,
        refreshToken: tokens.refreshToken,
      });
      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getIntoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}
module.exports = AccessService;
