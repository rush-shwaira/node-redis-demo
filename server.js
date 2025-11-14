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

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;

  let isCached = false;

  try {
    const cacheResults = await redisClient.get(species);
    if (cacheResults) {
      isCached = true;
      results = JSON.parse(cacheResults);
    } else {
      results = await fetchApiData(species);
      if (results.length === 0) {
        throw "API returned empty array";
      }
      await redisClient.set(species, JSON.stringify(results), {
        EX: 180, // Cache for 3 minutes
        NX: true, // Only set if key does not exist
      });
    }
    res.send({
      fromCache: isCached,
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
