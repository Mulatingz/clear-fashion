// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
// Filters
// // Brand
let currentBrand = "All";
let brands = [];
// // Release date
let releaseFilter = new Date().getTime() - (14 * 24 * 60 * 60 * 1000);
// // Price
let priceFilter = 50;
// Sort
let currentSort = "price-asc";
let sortSelectToFunction = {
    "price-asc": (p1, p2) => { return p1.price > p2.price},
    "price-desc": (p1, p2) => { return p1.price < p2.price},
    "date-asc": (p1, p2) => { return Date.parse(p1.released) > Date.parse(p2.released)},
    "date-desc": (p1, p2) => { return Date.parse(p1.released) < Date.parse(p2.released)}
};
// Information
let pricePercentile = {
    50: 0,
    90: 0,
    95: 0,
};
let nbProductNew = 0;
let lastReleasedDate = new Date();
let nbBrands = 0;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbProductsNew = document.querySelector('#nbProductsNew');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');
const spanNbBrands = document.querySelector('#nbBrands')
const pricePercentileSpans = {
    50: document.querySelector('#p50-value-span'),
    90: document.querySelector('#p90-value-span'),
    95: document.querySelector('#p95-value-span'),
};
const checkboxRelease = document.querySelector('#release-checkbox');
const checkboxPrice = document.querySelector('#price-checkbox');
const selectSort = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
    if(currentBrand !== "All") {
        result = filterProductByBrand(result);
    }
    if(checkboxRelease.checked) {
        result = filterProductByRelease(result);
    }
    if(checkboxPrice.checked) {
        result = filterProductByPrice(result);
    }
    currentProducts = result.sort(sortSelectToFunction[selectSort.value]);
    currentPagination = meta;
};


// FILTERS
/**
 * Filter products by their brand
 * @param {Array} products - the products
 * @param {String} brand - the brand to filter with
 * @return {Array}
 */
const filterProductByBrand = (products) => {
    products = products.filter(product => product.brand === currentBrand);
    return products;
}
/**
 * Compute the difference between two dates in days
 * @param {Date} d1 - first date
 * @param {Date} d2 - second date
 * @return {Number} The day difference
 */
const getDiffInDays = (d1, d2) => {
    const diffTime = Math.abs(d1 - d2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * Filter products by their release date
 * @param {Array} products - the products
 * @return {Array}
 */
const filterProductByRelease = (products) => {
    products = products.filter(product => getDiffInDays(Date.parse(product.released), releaseFilter) <= 14);
    return products;
}
/**
 * Filter products by their price
 * @param {Array} products - the products
 * @return {Array}
 */
const filterProductByPrice = (products) => {
    products = products.filter(product => product.price <= priceFilter);
    return products;
}


/**
 * Compute the percentile of the products price
 * @param {Array} products - the products
 * @param {Number} percentile - the percentile
 * @param {Number}
 */
const getProductPricePercentile = (products, percentile) => {
    let prices = Array.from(
        products,
        product => product.price
    );
    prices = prices.sort();
    return prices[Math.ceil((percentile / 100) * prices.length)]
}


/**
 * Set the price percentiles
 */
const setProductPricePercentile = async () => {
    const products = await fetchProducts(1, 222);
    for(const [key, value] of Object.entries(pricePercentile)) {
        pricePercentile[key] = getProductPricePercentile(products.result, key);
        pricePercentileSpans[key].innerHTML = pricePercentile[key];
    }

}

/**
 * Set the number of recently released products
 */
const setNbProductNew = async () => {
    const products = await fetchProducts(1, 222);
    let newProducts = filterProductByRelease(products.result);
    nbProductNew = newProducts.length;
    spanNbProductsNew.innerHTML = nbProductNew;
}

/**
 * Set the last released date
 */
const setLastReleasedDate = async () => {
    const products = await fetchProducts(1, 222);
    let sortedProducts = products.result.sort(sortSelectToFunction["date-desc"]);
    lastReleasedDate = sortedProducts[0].released;
    spanLastReleasedDate.innerHTML = lastReleasedDate.toString();
}

/**
 * Set the number of brands
 */
const setNbBrands = async () => {
    const brands = await fetchBrands();
    nbBrands = brands.length;
    spanNbBrands.innerHTML = nbBrands;
}

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
    try {
        let request_str = `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
        const response = await fetch(request_str);
        const body = await response.json();
        if (body.success !== true) {
            console.error(body);
            return {currentProducts, currentPagination};
        }
        return body.data;
    } catch (error) {
        console.error(error);
        return {currentProducts, currentPagination};
    }
};

/**
 * Fetch available brands from api
 */
const fetchBrands = async () => {
    try {
        let request_str = "https://clear-fashion-api.vercel.app/brands"
        const response = await fetch(request_str);
        const body = await response.json();
        body.data.result.splice(0, 0, "All");
        return body.data.result;
    } catch (error) {
        console.error(error);
        return brands;
    }
}

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    const template = products
        .map(product => {
            return `
                <div class="product" id=${product.uuid}>
                <span>${product.brand}</span>
                <a href="${product.link}" target="_blank">${product.name}</a>
                <span>${product.price}</span>
                </div>
                `;
        })
        .join('');

    div.innerHTML = template;
    fragment.appendChild(div);
    sectionProducts.innerHTML = '<h2>Products</h2>';
    sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
    const {currentPage, pageCount} = pagination;
    const options = Array.from(
        {'length': pageCount},
        (value, index) => `<option value="${index + 1}">${index + 1}</option>`
    ).join('');

    selectPage.innerHTML = options;
    selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
    const {count} = pagination;
    spanNbProducts.innerHTML = count;
};

/**
 * Render brand selector
 */
const renderBrands = () => {
    const options = Array.from(
        brands,
        brand => `<option value="${brand}">${brand}</option>`
    ).join('');
    selectBrand.innerHTML = options;
    selectBrand.value = currentBrand;
}

const render = (products, pagination) => {
    renderProducts(products);
    renderPagination(pagination);
    renderIndicators(pagination);
    renderBrands();
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
});

/**
 * Feature 1 - Browse pages
 */
selectPage.addEventListener('change', async (event) => {
    const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})

/**
 * Feature 2 - Filter by brands
 */
selectBrand.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    currentBrand = event.target.value;
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})

/**
 * Feature 3 - Filter by recent products
 */
checkboxRelease.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})

/**
 * Feature 4 - Filter by reasonable price
 */
checkboxPrice.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})

/*
 * Feature 5 and 6 - Sort by price and date
 */
selectSort.addEventListener('change', async (event) => {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    currentSort = event.target.value;
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})



document.addEventListener('DOMContentLoaded', async () => {
    setProductPricePercentile();
    setNbBrands();
    setNbProductNew();
    setLastReleasedDate();
    const products = await fetchProducts();
    brands = await fetchBrands();
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
})
