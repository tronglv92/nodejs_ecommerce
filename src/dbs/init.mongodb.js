"use strict";
const mongoose = require("mongoose");
const {
  db: { host, port, name, username, password },
} = require("../configs/config.mongodb");
const { countConnect } = require("../helpers/check.connect");

console.log("config port ", port);
// const connectString = `mongodb://${host}:${port}/${name}`;
const connectString = `mongodb://${username}:${password}@${host}:${port}/${name}?authSource=admin`;
console.log(`connectString:`, connectString);
// mongoose.connect(connectString).then(_=> console.log(`Connected Mongodb Success`))
// .catch(err => console.log(`Error Connect!`))

class Database {
  constructor() {
    
    this.connect();
  }

  //connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    console.log("vao trong nay 2");
    mongoose
      .connect(connectString)
      .then((_) => {
        console.log("Connected Mongodb Success PRO");
      })
      .catch((err) => console.log(`Error Connect! ${err}`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
