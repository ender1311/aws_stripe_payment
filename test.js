const storeItemsData = require('../../data/items.json');

const storeItems = new Map();

storeItemsData.forEach(item => {
    storeItems.set(item.id, item);
  });

module.exports = storeItems;
console.log(storeItems.get(101).name);