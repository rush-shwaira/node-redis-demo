# Node.js + Redis Caching (Country API)

This project demonstrates how to implement server-side caching in a Node.js Express application using **Redis**, fully containerized with **Docker Compose**.  
The API used is `restcountries.com`, and responses are cached for faster repeated access.

---

## Features
- Express server with a clean route structure  
- External API call for country information  
- Redis caching layer (TTL: 2 minutes)  
- Middleware-based cache lookup  
- Complete **Docker Compose** setup (Node app + Redis)  
- No WSL or native Redis installation required  

---

## Prerequisites
- Node.js 16+  
- Docker + Docker Compose  
- Internet connection for the REST Countries API  

---

## 1. Clone & Install Dependencies

```bash
npm install
```

Dependencies:

* `express`
* `axios`
* `redis`

---

## 2. Environment Variables

Create a `.env` file:

```
PORT=3030
REDIS_URL=redis://redis:6379
```

These values are injected into the container via `docker-compose.yml`.

---

## 3. Docker Setup

This project uses **Docker Compose** to run:

* `node-redis-app` (your Express server)
* `redis-server` (Redis instance)

### Build & start all services:

```bash
docker compose up -d --build
```

### Check containers:

```bash
docker compose ps
```

### View logs (app):

```bash
docker compose logs -f app
```

Expected startup order:

1. Redis container: `Ready to accept connections`
2. Node app: `App listening on port 3030`
3. Redis client: `Redis client connected`

---

## 4. Test the API + Caching

Hit the API:

```
http://localhost:3030/country/us
```

### Behavior:

**First request:**

* `fromCache: false`
* Console logs:

  ```
  Request sent to external API - countryCode: us
  ```

**Second request (same code):**

* `fromCache: true`
* Returned instantly from Redis

Try more:

```
http://localhost:3030/country/in
http://localhost:3030/country/gb
http://localhost:3030/country/ca
```

---

## 5. Cache Expiry

Data is cached for 2 minutes:

```js
await redisClient.set(key, JSON.stringify(data), {
  EX: 120,
  NX: true
});
```

After expiry, the next request fetches new data from the API and refreshes the cache.

---

## 6. Project Structure

```
root
│── server.js
│── package.json
│── Dockerfile
│── docker-compose.yml
│── .env
│── .dockerignore
│── .gitignore
```

---

## 7. Stop / Restart Containers

Stop:

```bash
docker compose down
```

Restart (cached data persists via volume):

```bash
docker compose up -d
```

---

## 8. Remove Everything (optional)

```bash
docker compose down -v
```

Removes:

* containers
* network
* named volume (`redis-data`)

---

## Summary

With Docker Compose, this project provides a clean and production-friendly setup:

* Node app container
* Redis container
* Automatic networking between services
* Persistent Redis storage
* Fast caching layer with middleware logic

This is a complete working example of Redis caching in a Node.js microservice environment.

```
```
