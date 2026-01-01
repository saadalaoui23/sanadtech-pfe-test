# Backend API - Large User Directory

## Overview

Backend API built with Node.js, Express, and TypeScript for efficiently serving 10 million user records.

## Features

- ✅ Alphabetical indexing system (A-Z)
- ✅ Paginated API endpoints
- ✅ Search functionality
- ✅ LRU caching for performance
- ✅ Gzip compression
- ✅ Rate limiting
- ✅ TypeScript for type safety

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the server with hot reload using `ts-node-dev`.

## Production

```bash
npm run build
npm start
```

## API Endpoints

See main README.md for full API documentation.

## Environment Variables

Create a `.env` file:

```
PORT=3000
NODE_ENV=development
```

## Building Indexes

Before using the API, you must build the alphabetical indexes:

```bash
cd ../scripts
node buildIndexes.js
# OR if using TypeScript:
ts-node buildIndexes.ts
```

This creates index files in `data/indexes/` for each letter (A-Z.
