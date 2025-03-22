const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 9876;

// Enable CORS
app.use(cors());

// Sliding window storage
const WINDOW_SIZE = 10;
let numberWindow = [];

// Function to fetch numbers from a third-party API
const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`https://your-test-api.com/numbers/${type}`, { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    console.error("Error fetching numbers:", error.message);
    return [];
  }
};

// API Endpoint to handle requests
app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  // Validate numberid
  if (!["p", "f", "e", "r"].includes(numberid)) {
    return res.status(400).json({ error: "Invalid number type" });
  }

  // Fetch new numbers
  const newNumbers = await fetchNumbers(numberid);

  // Add unique numbers while maintaining window size
  newNumbers.forEach((num) => {
    if (!numberWindow.includes(num)) {
      numberWindow.push(num);
      if (numberWindow.length > WINDOW_SIZE) {
        numberWindow.shift(); // Remove oldest number
      }
    }
  });

  // Calculate average
  const average =
    numberWindow.length > 0
      ? numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length
      : 0;

  // Send response
  res.json({
    windowPrevState: numberWindow.slice(0, -newNumbers.length),
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: parseFloat(average.toFixed(2)), // Rounded to 2 decimals
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
