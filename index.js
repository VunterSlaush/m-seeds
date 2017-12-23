const faker = require("faker");

class Seeder {
  constructor() {
    this.models = null;
  }

  async seed(model, count) {
    console.log("Seeding:", model.collection.collectionName);
    try {
      let doc;
      for (var i = 0; i < count; i++) {
        doc = await this.makeFakeDoc(model);
        try {
          await new model(doc).save();
        } catch (e) {
          //console.log("Error Making Model", e);
        }
      }
    } catch (e) {
      console.log("ERROR SEEDING", e);
    }
    console.log("Finished to Seed:", model.collection.collectionName);
  }

  async makeFakeDoc(model) {
    var paths = Object.keys(model.schema.paths);
    var doc = {};
    for (var i = 0; i < paths.length; i++) {
      var value = await this.fakePathParamByModel(model, paths[i]);
      if (value) doc[paths[i]] = typeof value == "function" ? value() : value;
    }
    return doc;
  }

  async fakePathParam(path) {
    if (!path) return null;
    if (path.instance == "Array") return this.makeFakeArray(path);
    if (path.schema) return this.makeFakeDoc(path);
    if (path.options.ref) return await this.makeFakeRef(path.options.ref);

    path.options = path.options || {};
    var prop = path.options.fake;
    if (prop) {
      if (typeof prop === "function") return prop;
      return this.fakerProp(faker, prop);
    }

    return null;
  }

  async fakePathParamByModel(model, pathName) {
    var path = model.schema.paths[pathName];
    return this.fakePathParam(path);
  }

  fakerProp(obj, prop) {
    var nestedProps = prop.split(".");
    var key;
    while ((key = nestedProps.shift())) {
      obj = obj[key];
    }
    return obj;
  }

  async makeFakeRef(ref) {
    if (this.models)
      throw new Error(
        "please set the models with 'mseed.models = models' to make ref fill function work"
      );
    let count = await models[ref].count();
    let random = Math.floor(Math.random() * count);
    let doc = await models[ref].findOne().skip(random);
    return doc ? doc.id : null;
  }

  async makeFakeArray(path) {
    let random = Math.floor(Math.random() * 5);
    let arry = [];
    for (var i = 0; i < random; i++) {
      let doc = await this.fakePathParam(path.caster);
      if (doc) typeof doc == "function" ? arry.push(doc()) : arry.push(doc);
    }
    return arry;
  }

  async seedAll(count) {
    if (this.models)
      throw new Error("please set the models with 'mseed.models = models'");

    for (k in models) {
      await this.seed(models[k], count);
    }
  }
}

module.exports = new Seeder();
