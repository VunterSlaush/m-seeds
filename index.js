const faker = require("faker");

class Seeder {
  async seed(model, count) {
    await this.seedWithDefaults(model, count, {});
  }

  async seedWithDefaults(model, count, defaults) {
    if (!model.collection) return;
    let triesCount = 0;

    console.log("Seeding:", model.collection.collectionName);
    let doc;
    for (var i = 0; i < count; i++) {
      try {
        doc = await this.makeFakeDoc(model, defaults);
        await new model(doc).save();
      } catch (e) {
        i--;
        triesCount++;
        if (triesCount == 1000) {
          console.log("Models Generated:", i);
          console.log("Error Getted", e);
          break;
        }
      }
    }
    console.log("Finished to Seed:", model.collection.collectionName);
  }

  async makeFakeDoc(model, defaults) {
    let paths;

    if (model.schema) paths = Object.keys(model.schema.paths);
    else paths = Object.keys(model.paths);

    const fakeCreatedAt =
      model.schema && model.schema.options
        ? model.schema.options.fakeCreatedAt
        : null;

    const createdAtFieldName =
      model.schema && model.schema.options && model.schema.options.timestamps
        ? model.schema.options.timestamps.createdAt
        : null;

    const doc = {};

    if (!defaults) defaults = {};

    for (var i = 0; i < paths.length; i++) {
      if (
        defaults.hasOwnProperty(paths[i]) ||
        defaults.hasOwnProperty(paths[i].path)
      ) {
        doc[paths[i]] = defaults[paths[i]];
      } else {
        if (!doc[paths[i]]) {
          var value = await this.fakePathParamByModel(model, paths[i], doc);
          if (value)
            doc[paths[i]] = typeof value == "function" ? value() : value;
        }
      }
    }
    if (fakeCreatedAt)
      doc[createdAtFieldName] = this.generateRandomCreatedAt(fakeCreatedAt);
    return doc;
  }

  async fakePathParam(path, paths, doc) {
    if (!path) return null;

    path.options = path.options || {};
    var prop = path.options.fake;

    if (prop && prop.includes("optional")) {
      let how = Number(prop.replace("optional:", "").replace("%", ""));
      if (Math.floor(Math.random() * 100) > how) return null;
    }
    if (prop && prop.indexOf(",") !== -1) return this.arrayOfFakerProps(prop);
    if (path.options.enum) return this.randomValueFrom(path.options.enum);
    if (path.instance == "Array") return this.makeFakeArray(path);
    if (path.schema) return this.makeFakeDoc(path);
    if (path.options.refPath) return await this.makeMultiRef(path, paths, doc);
    if (path.options.ref) return await this.makeFakeRef(path.options.ref);

    if (prop) {
      if (typeof prop === "function") return prop;
      return this.fakerProp(faker, prop);
    }

    return null;
  }

  arrayOfFakerProps(props) {
    const fakeParams = [];
    props.split(",").map(prop => {
      fakeParams.push(this.fakerProp(faker, prop.trim()));
    });
    return fakeParams.map(value => value());
  }

  async makeMultiRef(path, paths, seededDoc) {
    if (!this.models)
      throw new Error(
        "please set the models with 'mseed.setModels(models)' to make ref fill function work"
      );
    if (!paths[path.options.refPath].options.enum)
      throw new Error(
        "the kind field for dynamic reference must have an enum with posibles Models"
      );

    if (!seededDoc[path.options.refPath]) {
      let ref = this.randomValueFrom(paths[path.options.refPath].options.enum);
      seededDoc[path.options.refPath] = ref;
    }

    return await this.makeFakeRef(seededDoc[path.options.refPath]);
  }

  async fakePathParamByModel(model, pathName, doc) {
    try {
      var path;
      if (model.schema) path = model.schema.paths[pathName];
      else path = model.paths[pathName];
      return this.fakePathParam(
        path,
        model.schema ? model.schema.paths : model.paths,
        doc
      );
    } catch (e) {
      //console.log("E", e, model);
    }
  }

  fakerProp(obj, prop) {
    var nestedProps = prop.split(".");
    var key;
    while ((key = nestedProps.shift())) {
      obj = obj[key];
    }
    return obj;
  }

  randomValueFrom(arry) {
    let random = Math.floor(Math.random() * arry.length);
    return arry[random];
  }

  generateRandomCreatedAt(createAtOptions) {
    return this.randomDate(
      new Date(createAtOptions.from),
      new Date(createAtOptions.to)
    );
  }

  randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
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
    let random = Math.floor(Math.random() * 7);
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
