# m-seeds

M-seeds is a npm module for seeding collections for MongoDB databases, using
[Mongoose](mongoosejs.com) and the [Faker](https://github.com/Marak/faker.js)
contextual data generation tool. M-seeds take the defined schemas and generate
the proper dummy data based on the functions of the faker tool indicated on the
model schema definition file, as you can see below.

To install you can use npm or yarn

```sh
npm install m-seeds or yarn add m-seeds
```

## How to use it

M-seeds only effects the models of schemas it is applied to. Inside the schema,
the `fake` property instructs m-seeds how to generate the proper dummy data. See
[Faker](https://github.com/Marak/faker.js) for a list of all methods.

```js
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
  someOptionalParam: { type:String, fake:"optional:70%" }, // if you want some optional param, that 70% of times get filled and sometimes not
  someArrayOfStrings: [{ type: String, fake: "random.word" }], // this fills an array with random words
  someSubDoc: SubDoc // this sub document is filled too, with its fake options
  refToAnotherModel: { type: Schema.Types.ObjectId, ref: "AnotherModel" } // if you fill m-seeds with a list of models (mSeeds.setModels())
                                                                          // it can fill ref data with random id of any documents
                                                                          // if the collections have no documents
                                                                          // it create new one and store it and then
                                                                          // add it ref
});

module.exports = mongoose.model("User", UserSchema);
```

## Run the Seeding

To run the seeding you can make a file just importing the module (`const mSeeds = require("m-seeds").getSeeder({})`), the models, and stablish the database connection and
then just simply call `mSeeds.seed(someModel,count)` or `mSeeds.seedAll(count)`,
where `count` is the number of documents we want to make on our collections.

**Note:** To call `mSeeds.seedAll(count)` you need to call before
`mSeeds.setModels(models)`, where `models` is a list of all models.

You can take control of certain options when getting the seeder, the `getSeeder` takes an options argument:

`getSeeder(options)`

* `options: `

| name | default | description |
| ---- | ------- | ----------- |
| silentLogging | `false` | if should hide all debug logs, either `boolean` or a `string` containing `NODE_ENV` env variable on which hide the logs.




```js
const mSeeds = require("m-seeds").getSeeder({});
const models = require("./models");

doDatabaseConnection();
mSeeds.setModels(models);
//then you can simply make
mSeeds.seed(models["User"], 5); // this will fill the User collection with 5 documents with fake data.
// or
mSeeds.seedAll(5); // this will fill all the models collections passed on setModels, with 5 documents with fake data.
```

## Seed with some Default Values

If you want to seed but you want to fill some properties with default values, you
can use `mSeeds.seedWithDefaults(someModel,count, defaults)`, where `defaults` is an object
like key and value, to indicate the value for the right property, as you can see in this example

```js
const mSeeds = require("m-seeds").getSeeder();
const models = require("./models");

doDatabaseConnection();

// this will fill the User collection with 5 documents, with firstName and lastName the same
// as indicate the 3th param
mSeeds.seedWithDefaults(models["User"], 5, {
  firstName: "Jesus",
  lastName: "Mota"
});
```

## Generate fake docs not for seeding purposes

To generate a fake docs instances of a model you just need to call

```js
mSeeds.makeFakeDoc(model);
// or if you want to generate it with with default Values
mSeeds.makeFakeDoc(model, defaults);
```

## Test it

If you clone or fork this repo, after you do `npm install or yarn install` you
can test this module as you can see below

```bash
# running tests
npm example or yarn example
```
