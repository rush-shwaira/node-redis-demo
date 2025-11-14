# Node.js + Redis Caching (Country API)

This project demonstrates how to implement server-side caching in a Node.js Express app using **Redis**, with Redis running inside a **Docker container**.  
The API used here is `restcountries.com`, and responses are cached for faster repeated access.

---

## Features
- Express server with a clean route structure  
- External API call to retrieve country information  
- Redis caching layer (TTL 2 minutes)  
- Middleware-based cache lookup  
- Docker-based Redis setup — no WSL or Linux installation required  

---

## Prerequisites
- Node.js 16+  
- Docker installed and running  
- Internet connection for the REST Countries API  

---

## 1. Install Dependencies

Clone the project and install packages:

```bash
npm install
```

The project uses:

* `express`
* `axios`
* `redis`

---

## 2. Run Redis in Docker

Redis is **not installed locally** — instead, a Docker container is used.

### Pull the Redis image:

```bash
docker pull redis:latest
```

### Run Redis with a persistent volume:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:latest
```

### Verify Redis is running:

```bash
docker ps
```

You should see a container named `redis`.

### Test Redis CLI:

```bash
docker exec -it redis redis-cli
PING
```

If it returns:

```
PONG
```

Redis is working.

---

## 3. Run the Node Server

Start the Express app:

```bash
node server.js
```

The server will listen on:

```
http://localhost:3000
```

---

## 4. Test the Caching

### Hit the API:

```
http://localhost:3000/country/us
```

### Expected behavior:

* **First request:**

  * `fromCache: false`
  * Console shows:

    ```
    Request sent to external API - us
    ```

* **Second request (same country):**

  * `fromCache: true`
  * No external API request — served from Redis

### Try more:

```
http://localhost:3000/country/in
http://localhost:3000/country/gb
http://localhost:3000/country/ca
```

---

## 5. Cache Expiry

Cache entries expire after **120 seconds** (2 minutes):

```js
await redisClient.set(key, JSON.stringify(data), {
  EX: 120,
  NX: true
});
```

After expiry, the next request re-fetches from the live API and refreshes the cache.

---

## 6. Project Structure

```
root
│── server.js      # Express + Redis caching logic
│── package.json
```

---

## 7. Stop / Restart Redis

### Stop:

```bash
docker stop redis
```

### Start again:

```bash
docker start redis
```

Your cached data **remains**, because a named volume stores Redis data.

---

## 8. Remove Redis Completely (optional)

```bash
docker stop redis
docker rm redis
docker volume rm redis-data
```

---

## Summary

This project shows how to:

* Run Redis in Docker
* Integrate Redis caching into an Express application
* Build a clean API with middleware-based cache lookup
* Persist Redis data using Docker volumes

You now have a fully working Redis caching layer for Node.js without installing Redis natively or using WSL.

```