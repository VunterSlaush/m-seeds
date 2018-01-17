const faker = require("faker");

class Seeder {
  async seed(model, count) {
    if (!model.collection) return;
    let triesCount = 0;
    try {
      console.log("Seeding:", model.collection.collectionName);
      let doc;
      for (var i = 0; i < count; i++) {
        try {
          doc = await this.makeFakeDoc(model);
          await new model(doc).save();
        } catch (e) {
          i--;
          triesCount++;
          if (triesCount == 100) {
            console.log(
              "ERROR THIS MODEL HAVE SOME VALIDATIONS THAT CANNOT LET CREATE A FAKE DOC!"
            );
            break;
          }
        }
      }
      console.log("Finished to Seed:", model.collection.collectionName);
    } catch (e) {
      console.log("ERROR SEEDING", e);
    }
  }

  async makeFakeDoc(model) {
    let paths;
    if (model.schema) paths = Object.keys(model.schema.paths);
    else paths = Object.keys(model.paths);

    var doc = {};
    for (var i = 0; i < paths.length; i++) {
      var value = await this.fakePathParamByModel(model, paths[i]);
      if (value) doc[paths[i]] = typeof value == "function" ? value() : value;
    }
    return doc;
  }

  async fakePathParam(path) {
    if (!path) return null;

    path.options = path.options || {};
    var prop = path.options.fake;
    if (prop && prop.includes("optional")) {
      let how = Number(prop.replace("optional:", "").replace("%", ""));
      if (Math.floor(Math.random() * 100) > how) return null;
    }

    if (path.instance == "Array") return this.makeFakeArray(path);
    if (path.schema) return this.makeFakeDoc(path);
    if (path.options.ref) return await this.makeFakeRef(path.options.ref);

    if (prop) {
      if (typeof prop === "function") return prop;
      return this.fakerProp(faker, prop);
    }

    return null;
  }

  async fakePathParamByModel(model, pathName) {
    var path;
    if (model.schema) path = model.schema.paths[pathName];
    else path = model.paths[pathName];
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
    if (!this.models)
      throw new Error(
        "please set the models with 'mseed.setModels(models)' to make ref fill function work"
      );
    let count = await this.models[ref].count();
    let random = Math.floor(Math.random() * count);
    let doc = await this.models[ref].findOne().skip(random);
    if (!doc) doc = await this.createAndSaveFakeDoc(this.models[ref]);
    return doc ? doc.id : null;
  }

  async createAndSaveFakeDoc(model) {
    let doc = await this.makeFakeDoc(model);
    let docSaved = await new model(doc).save();
    return docSaved;
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
    if (!this.models)
      throw new Error("please set the models with 'mseed.setModels(models)'");

    for (let k in this.models) {
      await this.seed(this.models[k], count);
    }
  }

  setModels(allModels) {
    this.models = allModels;
  }
}

module.exports = new Seeder();
