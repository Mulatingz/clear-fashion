/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const dedicatedbrand = require('./eshops/dedicatedbrand');
const montlimart = require('./eshops/montlimart');
const circle_sportswear = require('./eshops/circle_sportswear');

async function get_products(eshop, mod, filename) {
    try {
        console.log(`🕵️‍♀️  browsing ${eshop} eshop`);
        const products = await mod.scrape(eshop);
        return products;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

//async function main() {
//    await save_products('https://www.dedicatedbrand.com/en/men/news', dedicatedbrand, 'dedicated.json');
//    await save_products('https://www.montlimart.com/99-vetements', montlimart, 'montlimart.json');
//    await save_products('https://shop.circlesportswear.com/collections/collection-homme', circle_sportswear, "circle_sportswear.json");
//}
//
//main();

get_products('https://www.dedicatedbrand.com/en/men/news', dedicatedbrand)
    .then(products => fs.writeFileSync("dedicated.json", JSON.stringify(products), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }))

get_products('https://www.montlimart.com/99-vetements', montlimart)
    .then(products => fs.writeFileSync("montlimart.json", JSON.stringify(products), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }))

get_products('https://shop.circlesportswear.com/collections/collection-homme', circle_sportswear)
    .then(products => fs.writeFileSync("circle_sportswear.json", JSON.stringify(products), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }))
