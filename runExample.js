const models = require("./examples");
const mseeds = require("./");

async function run() {
  let filledObject = await mseeds.makeFakeDoc(models["SimpleSchema"]);
  console.log("this is a example model filled:", filledObject);
}

mseeds.models = models;
run();
