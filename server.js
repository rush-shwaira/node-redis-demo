const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;

let redisClient;
(async () => {
  redisClient = redis.createClient({ url: "redis://localhost:6379" });

  redisClient.on("error", (error) =>
    console.log(`Redis Client Error: ${error}`)
  );

  await redisClient.connect();
})();

async function fetchCountryApiData(countryCode) {
  const apiResponse = await axios.get(
    `https://restcountries.com/v3.1/alpha/${countryCode}`
  );
  console.log("Request sent to external API - countryCode:", countryCode);
  return apiResponse.data;
}

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const countryCode = req.params.code.toLowerCase();
  const key = `country:${countryCode}`;
  try {
    const cacheResults = await redisClient.get(key);
    if (cacheResults) {
      return res.send({
        fromCache: true,
        data: JSON.parse(cacheResults),
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

async function getCountryData(req, res) {
  try {
    const countryCode = req.params.code.toLowerCase();
    const key = `country:${countryCode}`;

    const data = await fetchCountryApiData(countryCode);
    if (data.length === 0) {
      throw new Error("No data found");
    }
    await redisClient.set(key, JSON.stringify(data), {
      EX: 120, // Cache for 2 minutes
      NX: true, // Only set if key does not exist
    });

    res.json({
      fromCache: false,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/country/:code", cacheMiddleware, getCountryData);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
