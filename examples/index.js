const fs = require("fs");

const isIndex = file => file === "index.js";
const isJS = file => file.substr(-3) === ".js";
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

fs.readdirSync("./examples").forEach(file => {
  if (isJS(file) && !isIndex(file)) {
    const modelName = file.split(".")[0];
    const model = require("./" + file);
    module.exports[capitalize(modelName)] = model;
  }
});
