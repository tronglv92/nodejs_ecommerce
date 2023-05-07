'use strict'
const {Schema,model, default: mongoose}=require('mongoose')

const DOCUMENT_NAME='Key'
const COLLECTION_NAME='Keys'

var keyTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Shop",
  },
  // privateKey:{
  //   type: String,
  //   required: true,
  // },
  publicKey: {
    type: String,
    required: true,
  },
  refreshTokensUsed:{
    type: Array,
    default:[]
  },
  refreshToken:{
    type: String,
    required:true
  }
},{
    collection:COLLECTION_NAME,
    timestamps:true
});

//Export the model
module.exports=mongoose.model(DOCUMENT_NAME,keyTokenSchema)