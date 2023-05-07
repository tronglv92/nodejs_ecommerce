"use strict";

const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    // privateKey,
    refreshToken,
  }) => {
    try {
      // const publicKeyString=publicKey.toString()
      // const tokens=await keytokenModel.create({
      //     user:userId,
      //     publicKey:publicKeyString
      // })
      // return tokens ? tokens.publicKey: null;
      const filter = { user: userId },
        update = {
          publicKey,
          // privateKey,
          refreshTokenUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    console.log("userID", userId);
    return await keytokenModel
      .findOne({
        user: new Types.ObjectId(userId),
      })
      .lean();
  };
  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(id);
  };
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };
  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken: refreshToken }).lean();
  };
  static deleteKeyById = async (userId) => {
    

    return await keytokenModel.findOneAndDelete({ user: userId });
  };
  static updateKeyToken = async ({id, refreshTokenNew, refreshTokenOld,publicKey}) => {
    await keytokenModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          refreshToken: refreshTokenNew,
          publicKey: publicKey,
        },
        $addToSet: {
          refreshTokensUsed: refreshTokenOld,
        },
      }
    );
  };
}
module.exports = KeyTokenService;
