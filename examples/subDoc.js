var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var subSchema = new Schema({
  randomNumer: {
    type: Number,
    fake: "random.number"
  },
  randomImage: {
    type: String,
    fake: "internet.avatar"
  }
});

module.exports = subSchema;
