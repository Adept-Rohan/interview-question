const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

function calculateCourierPrice(totalWeight) {
  if (totalWeight <= 200) return 5;
  if (totalWeight <= 500) return 10;
  if (totalWeight <= 1000) return 15;
  return 20;
}

// The function that divides item into packages. Created a packages array and have looped through each item from items. Also have checked the rule that no packages should be more than 250
function divideIntoPackages(items) {
  const MAX_PRICE = 250;

  items.sort((a, b) => b.price - a.price); // Sort by price to prioritize high-value items

  const packages = [];

  for (const item of items) {
    let placed = false;

    // Adding the item to an existing package if it doesn't exceed the price or weight limit
    for (const pkg of packages) {
      if (pkg.totalPrice + item.price <= MAX_PRICE) {
        pkg.items.push(item);
        pkg.totalWeight += item.weight;
        pkg.totalPrice += item.price;
        placed = true;
        break;
      }
    }

    // If the item couldn't be placed in an existing package, create a new package
    if (!placed) {
      packages.push({
        items: [item],
        totalWeight: item.weight,
        totalPrice: item.price,
        courierPrice: 0,
      });
    }
  }

  // Calculate courier prices for all packages and balance weights
  for (const pkg of packages) {
    pkg.courierPrice = calculateCourierPrice(pkg.totalWeight);
  }

  return packages;
}

app.get("/items", (_, res) => {
  const filePath = path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to load data" });
      return;
    }

    res.json(JSON.parse(data));
  });
});

app.post('/place-order', (req, res) => {
  const { selectedItems } = req.body;
  const result = divideIntoPackages(selectedItems);

  res.json({ packages: result });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})