const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

function calculateCourierPrice(totalWeight) {
  if (totalWeight <= 200) return 5;
  if (totalWeight <= 500) return 10;
  if (totalWeight <= 1000) return 15;
  return 20;
}


function divideIntoPackages(items) {
  const MAX_PRICE = 250

  items.sort((a, b) => b.weight - a.weight)

  const packages = []

  let currentPackage = [];
  let currentWeight = 0;
  let currentPrice = 0;

  for (const item of items) {
    if (currentPrice + item.price > MAX_PRICE) {
      packages.push({
        items: [...currentPackage],
        totalWeight: currentWeight,
        totalPrice: currentPrice,
        courierPrice: calculateCourierPrice(currentWeight)
      })
      currentPackage = [];
      currentWeight = 0;
      currentPrice = 0;
    }
    currentPackage.push(item);
    currentWeight += item.weight;
    currentPrice += item.price;
  }
  if (currentPackage.length > 0) {
    packages.push({
      items: [...currentPackage],
      totalWeight: currentWeight,
      totalPrice: currentPrice,
      courierPrice: calculateCourierPrice(currentWeight),
    });
  }
  return packages
}

app.get("/items", (_, res) => {
  const filePath = path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data.json:", err);
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