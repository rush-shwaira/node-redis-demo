const express = require("express");

const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `httpsL//www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to API");
  return apiResponse.data;
}

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
