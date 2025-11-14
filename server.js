const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to API");
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);

    if (results.length === 0) {
      throw "API returned empty array";
    }
    res.send({
      fromCache: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", getSpeciesData);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
