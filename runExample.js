const models = require("./examples");
const mseeds = require("./").getSeeder();

async function run() {
  let filledObject = await mseeds.makeFakeDoc(models["SimpleSchema"]);
  console.log("this is a example model filled:", filledObject);
}

mseeds.setModels(models);
run();
