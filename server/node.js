const {MongoClient} = require('mongodb');
// const MONGODB_URI = 'mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority';
const MONGODB_URI = 'mongodb://mongodb0.example.com:27017';
const MONGODB_DB_NAME = 'clearfashion';

const client = MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
const db =  client.db(MONGODB_DB_NAME)

const products = [];

const collection = db.collection('products');
const result = collection.insertMany(products);

console.log(result);
