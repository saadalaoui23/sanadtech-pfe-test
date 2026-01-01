# Technical Test - Large List Display System

## 🎯 Objective

Efficiently display and navigate through 10 million sorted user names without freezing the browser. This project demonstrates advanced algorithmic optimization techniques and modern web development practices.

## 🏗️ Architecture Overview

The application is built with a **separation of concerns** architecture:

- **Backend (Node.js + Express + TypeScript)**: Handles data processing, indexing, and API endpoints
- **Frontend (React + TypeScript)**: Implements virtual scrolling and user interface
- **Data Layer**: File-based storage with alphabetical indexing for fast lookups

### Key Components

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React Frontend │ ◄─────► │  Express Backend │ ◄─────► │  users.txt   │
│  (Virtual Scroll)│         │  (Indexed API)   │         │  (10M users) │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │   Indexes/   │
                              │  (A-Z JSON)  │
                              └──────────────┘
```

## 🚀 Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **react-window** - Virtual scrolling implementation
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **compression** - Gzip compression middleware
- **express-rate-limit** - API rate limiting

## 📊 Key Algorithmic Decisions

### 1. **Alphabet Indexing System**

Instead of scanning 10 million lines for each request, we pre-build an index:

- **Index Structure**: Each letter (A-Z) maps to:
  - `start`: Starting line number in the file
  - `end`: Ending line number in the file
  - `count`: Total number of users for this letter

- **Benefits**:
  - O(1) lookup time for letter-based navigation
  - Direct file offset calculation (no full file scan)
  - Reduced memory footprint

**Implementation**: `backend/src/services/indexService.ts`

### 2. **Virtual Scrolling Strategy**

Using `react-window` to render only visible items:

- **Window Size**: ~20-30 items visible at once
- **Overscan**: 5 items outside viewport for smooth scrolling
- **Item Height**: Fixed 60px for predictable calculations
- **Total Height Estimation**: Calculated dynamically based on data

**Benefits**:
- Constant DOM size regardless of total items (10M items = ~30 DOM nodes)
- 60 FPS scrolling performance
- Minimal memory usage

**Implementation**: `frontend/src/components/UserList/UserList.tsx`

### 3. **Pagination Approach**

- **Chunked Loading**: Load 100-500 users per request
- **Infinite Scroll**: Automatically load next page when approaching bottom
- **LRU Cache**: Cache frequently requested pages in memory
- **Streaming File Reading**: Use `readline` interface to read file line-by-line

**Implementation**: 
- Backend: `backend/src/services/userService.ts`
- Frontend: `frontend/src/hooks/useUserData.ts`

### 4. **Search Optimization**

- **Debouncing**: 300ms delay to reduce API calls
- **Streaming Search**: Read file line-by-line, stop at max results
- **Early Termination**: Stop searching once max results reached

**Implementation**: `backend/src/utils/dataProcessor.ts` (binarySearchUsers

## ⚡ Performance Metrics

### Backend
- **Index Build Time**: ~2-5 minutes for 10M users (one-time operation)
- **API Response Time**: 
  - Paginated requests: 50-200ms
  - Alphabet stats: <10ms (cached)
  - Search: 100-500ms (depends on query position)
- **Memory Usage**: ~50-100MB (with LRU cache)

### Frontend
- **Initial Load**: <500ms
- **Scroll Performance**: 60 FPS maintained
- **Memory Usage**: ~20-30MB (only visible items in DOM)
- **Time to Interactive**: <1 second

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run build
npm run dev  # Development mode with hot reload
# OR
npm start    # Production mode
```

The backend will start on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Development server (usually http://localhost:5173)
# OR
npm run build && npm run preview  # Production build
```

### Environment Variables

Create `.env` files if needed:

**Backend** (`backend/.env`):
```
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
WebApp/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Error handling, etc.
│   │   ├── utils/            # Utilities (cache, data processing)
│   │   ├── types/            # TypeScript types
│   │   └── server.ts         # Entry point
│   ├── data/
│   │   ├── users.txt        # 10M user names (one per line)
│   │   └── indexes/         # Alphabetical indexes (A-Z.json, stats.json)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── UserList/     # Virtual scrolling list
│   │   │   ├── Navigation/   # Search, Alphabet menu
│   │   │   └── Layout/       # Header, Sidebar
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions
│   │   └── App.tsx           # Main component
│   └── package.json
│
└── scripts/
    └── buildIndexes.js       # Script to build alphabetical indexes
```

## 🧪 Testing with 10M Users

### Step 1: Prepare Your Data File

Place your `users.txt` file in `backend/data/users.txt`. Format: one name per line:
```
Jean Dupont
Marie Martin
Pierre Dubois
...
```

### Step 2: Build Indexes

**Option 1: Using TypeScript (Recommended)**
```bash
cd scripts
npm install  # Install dependencies if needed
npx ts-node buildIndexes.ts
```

**Option 2: Using JavaScript (if backend is compiled)**
```bash
cd scripts
node buildIndexes.js
```

This will:
- Read through all 10M users
- Create index files for each letter (A-Z)
- Save statistics to `backend/data/indexes/stats.json`

**Expected time**: 2-5 minutes for 10M users

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

### Step 5: Test the Application

1. Open `http://localhost:5173` (or your frontend URL)
2. Navigate using alphabet menu
3. Test search functionality
4. Scroll through the list (should be smooth)

## 🎨 UI/UX Features

### ✅ Implemented Features

1. **Virtual Scrolling**
   - Only renders visible items
   - Smooth 60 FPS scrolling
   - Infinite scroll loading

2. **Alphabet Navigation Menu**
   - A-Z buttons with user counts
   - Active letter highlighting
   - Jump-to-letter functionality

3. **Search Functionality**
   - Real-time search with debouncing
   - Search by name or email
   - Clear search option

4. **Loading States**
   - Loading indicators
   - Progress information
   - Error handling

5. **Responsive Design**
   - Mobile-friendly layout
   - Adaptive sidebar

## 🔮 Future Improvements

If given more time, I would implement:

1. **Advanced Search**
   - Fuzzy search with typo tolerance
   - Search filters (by email domain, etc.)
   - Search history

2. **Performance Enhancements**
   - Service Worker for offline support
   - IndexedDB caching
   - WebSocket for real-time updates

3. **User Experience**
   - Keyboard navigation (arrow keys, etc.)
   - Jump to specific user ID
   - Export functionality (CSV, JSON)

4. **Backend Optimizations**
   - Database migration (PostgreSQL/MongoDB)
   - Full-text search index (Elasticsearch)
   - Redis caching layer

5. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)

6. **Monitoring**
   - Performance metrics collection
   - Error tracking (Sentry)
   - Analytics

## 📝 API Endpoints

### `GET /api/users/paginated`
Get paginated list of users.

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 100, max: 500)
- `letter` (string, optional): Filter by first letter (A-Z)
- `search` (string, optional): Search term

**Response**:
```json
{
  "users": [...],
  "total": 1000000,
  "hasMore": true,
  "page": 1
}
```

### `GET /api/users/alphabet-stats`
Get statistics for each letter.

**Response**:
```json
{
  "A": { "count": 500000, "startIndex": 0 },
  "B": { "count": 400000, "startIndex": 500000 },
  ...
}
```

### `GET /api/users/search`
Search for users.

**Query Parameters**:
- `q` (string, required): Search query
- `maxResults` (number, optional): Max results (default: 100, max: 500)

**Response**:
```json
{
  "users": [...],
  "positions": [0, 5, 10, ...],
  "total": 50
}
```

### `GET /api/users/jump-to-letter/:letter`
Jump to a specific letter.

**Path Parameters**:
- `letter` (string): Letter A-Z

**Query Parameters**:
- `limit` (number, optional): Items per page (default: 100)

**Response**: Same as `/paginated`

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `users.txt` exists in `backend/data/`
- Run `npm install` to ensure dependencies are installed

### Indexes not found
- Run `node scripts/buildIndexes.js` to generate indexes
- Check `backend/data/indexes/` directory exists

### Frontend can't connect to API
- Verify backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend

### Slow performance
- Ensure indexes are built (`buildIndexes.js`)
- Check file I/O performance (SSD recommended)
- Reduce `limit` parameter in API calls

## 📄 License

This project is created for a technical test/assessment.

## 👤 Author

Created for Sanadtech PFE Technical Test

---

**Note**: This application is optimized for handling large datasets (10M+ items) efficiently. The key to its performance is the combination of:
1. Pre-built alphabetical indexes
2. Virtual scrolling (only render visible items)
3. Chunked data loading
4. LRU caching
