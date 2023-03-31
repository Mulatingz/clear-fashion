const fs = require('fs');
const { MongoClient } = require('mongodb');
const MONGODB_URI = 'mongodb+srv://<user>:<password>.7ttcxis.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(MONGODB_URI);



async function add_all_products(collection) {
    let productsRaw = fs.readFileSync('products.json');
    let productsJSON = JSON.parse(productsRaw);
    return collection.insertMany(productsJSON);
}

async function find_products_by_brand(collection, brand) {
    const products = await collection.find({brand}).toArray();
    return products;
}

async function find_products_cheaper_than(collection, price) {
    const query = { price: { $lt: price }}
    const products = await collection.find(query).toArray();
    return products;
}

async function get_products_sorted_by(collection, field, order=1) {
    const query = {}
    query[field] = order;
    const products = await collection.find().sort(query).toArray();
    return products
}

async function get_products_scrapped_less_than(collection, days) {
    var now = new Date();
    console.log(now)
    now.setDate(now.getDate() - days);
    console.log(now)
    const query = { "date": { $gte: now.toISOString() }};
    const products = await collection.find(query).toArray();
    return products
}

async function run() {
    try {
        const collection = client.db('clearfashion').collection('products');
        //await add_all_products(collection);
        //console.log("All products added");
        //const products = await find_products_by_brand(collection, 'Montlimart')
        //const products = await find_products_cheaper_than(collection, 50);
        //const products = await get_products_sorted_by(collection, "price");
        //const products = await get_products_sorted_by(collection, "date");
        //const products = await get_products_scrapped_less_than(collection, 14);
        console.log(products)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


run().catch(console.dir);
