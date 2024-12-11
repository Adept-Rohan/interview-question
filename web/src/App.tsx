import axios from "axios";
import { useEffect, useState } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
  weight: number;
}

interface Package {
  items: Item[];
  totalWeight: number;
  totalPrice: number;
  courierPrice: number;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {

    // Fetched all the data of items from the backend using axios and populated in items variable
    const fetchData = async () => {
      try {
        const response = await axios.get<Item[]>("http://localhost:3000/items");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Simple Handle Checkbox Change when user clicks on the checkbox. It populates the array with all the selected checkbox alongside their data. If there is same data it will not insert twice since the filter function will rule it out.
  const handleCheckboxChange = (product: Item) => {
    setSelectedItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Post API to calculate the packages rule , the described rule function is present in server.js file.
  const placeOrder = async () => {
    try {
      const response = await axios.post<{ packages: Package[] }>(
        "http://localhost:3000/place-order",
        {
          selectedItems,
        }
      );
      setPackages(response.data.packages);
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Place Your Order</h1>

      {/* Rendered all the items with it's specification */}
      <ul className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center border-b py-2"
          >
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox text-blue-600 rounded"
                onChange={() => handleCheckboxChange(item)}
              />
              <span>{item.name}</span>
            </label>
            <span className="text-gray-500">
              ${item.price} - {item.weight}g
            </span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={placeOrder}
      >
        Place Order
      </button>

      {/* Rendered the result after matching the conditions provided */}
      <div className="mt-6">
        <h2 className="text-center text-3xl mb-8">Order Summary</h2>
        {packages.length > 0 && (
          <div className="grid grid-cols-4 space-y-4">
            {packages.map((pkg, index) => (
              <div className="" key={index}>
                <h3>Package {index + 1}</h3>
                <p>
                  Items: {pkg.items.map((item) => item.name).join(", ")}
                </p>
                <p>Total Weight: {pkg.totalWeight}g</p>
                <p>Total Price: ${pkg.totalPrice}</p>
                <p>Courier Price: ${pkg.courierPrice}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
