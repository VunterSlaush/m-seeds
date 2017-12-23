var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SubDoc = require("./subDoc");
var UserSchema = new Schema({
  firstName: {
    type: String,
    fake: "name.firstName" // calls faker.name.firstName()
  },
  lastName: {
    type: String,
    fake: "name.lastName" // calls faker.name.lastName()
  },
  userName: {
    type: String,
    fake: "internet.userName" // calls faker.internet.userName()
  },
  someArrayOfStrings: [{ type: String, fake: "random.word" }], // this fill an array with random words
  someSubDoc: SubDoc // this sub document is filled too, with its fake options
  //refToAnotherModel: { type: Schema.Types.ObjectId, ref: "AnotherModel" } this works when the model are connected to a real database
});

module.exports = mongoose.model("User", UserSchema);
