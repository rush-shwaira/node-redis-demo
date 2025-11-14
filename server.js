const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;

let redisClient;
(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.log(`Error: ${error}`));

  await redisClient.connect();
})();

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to API");
  return apiResponse.data;
}

// Cache middleware
async function cacheData(req, res, next) {
  const species = req.params.species;

  let results;

  try {
    const cacheResults = await redisClient.get(species);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);
    if (results.length === 0) {
      throw "API returned empty array";
    }
    await redisClient.set(species, JSON.stringify(results), {
      EX: 120, // Cache for 2 minutes
      NX: true, // Only set if key does not exist
    });

    res.send({
      fromCache: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", cacheData, getSpeciesData);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
