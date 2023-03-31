/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const dedicatedbrand = require('./eshops/dedicatedbrand');
const montlimart = require('./eshops/montlimart');
const circle_sportswear = require('./eshops/circle_sportswear');


function add_brand(product, brand) {
    product['brand'] = brand;
    return product;
}

function add_date(product) {
    var today = new Date().toISOString();
    product['date'] = today;
    return product;
}

async function get_products(eshop, mod, brand) {
    try {
        console.log(`🕵️‍♀️  browsing ${eshop} eshop`);
        let products = await mod.scrape(eshop);
        products = Array.from(products, product => add_date(add_brand(product, brand)));
        return products;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function main() {
    let productsDedicated = await get_products('https://www.dedicatedbrand.com/en/men/news', dedicatedbrand, "DEDICATED")
    console.log(productsDedicated);
    let productsMontlimart = await get_products('https://www.montlimart.com/99-vetements', montlimart, "Montlimart")
    let productsCircleSportSwear = await get_products('https://shop.circlesportswear.com/collections/collection-homme', circle_sportswear, "Circle Sportswear")
    let products = JSON.stringify(productsDedicated.concat(productsMontlimart).concat(productsCircleSportSwear));
    fs.writeFileSync("products.json", products, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

main();
