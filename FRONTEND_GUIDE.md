# 🎮 QUIZIZZ FRONTEND - COMPLETE GUIDE

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Cài đặt](#cài-đặt)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Tính năng chính](#tính-năng-chính)
5. [Socket.IO Integration](#socketio-integration)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)

---

## 🚀 TỔNG QUAN

Frontend Quizizz được xây dựng với:
- **React 19** - UI Framework
- **Vite** - Build tool
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **React Router** - Routing
- **Axios** - HTTP client

### Tính năng nổi bật:
✅ Real-time multiplayer game
✅ Live room updates
✅ Instant player synchronization
✅ Countdown timer
✅ Live leaderboard
✅ Responsive design

---

## 📦 CÀI ĐẶT

### 1. Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### 2. Clone & Install
```bash
cd quizizz-fe
npm install
```

### 3. Environment Setup
Tạo file `.env` trong thư mục root:
```env
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:9092
```

### 4. Run Development Server
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 CẤU TRÚC DỰ ÁN

```
quizizz-fe/
├── src/
│   ├── assets/              # Images, icons
│   ├── components/          # Reusable components
│   │   ├── room/           # Room-related components
│   │   │   ├── CreateRoomModal.jsx
│   │   │   ├── JoinByCodeModal.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   ├── GamePlay.jsx
│   │   │   └── GameResults.jsx
│   │   ├── Profile/        # Profile components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── auth/          # Login, Register
│   │   ├── room/          # RoomPage
│   │   ├── game/          # GamePlay
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── services/          # API & Socket services
│   │   ├── apiInstance.js
│   │   ├── authApi.js
│   │   ├── roomApi.js
│   │   ├── socketService.js
│   │   └── topicApi.js
│   ├── stores/            # Zustand stores
│   │   ├── authStore.js
│   │   ├── useRoomStore.js
│   │   └── useGameStore.js
│   ├── hooks/             # Custom hooks
│   │   ├── useWebSocketCleanup.js
│   │   ├── useTopics.js
│   │   └── ...
│   ├── styles/            # CSS files
│   ├── routers/           # Route configuration
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 TÍNH NĂNG CHÍNH

### 1. Authentication
- ✅ Login/Register
- ✅ JWT Token management
- ✅ Auto-refresh token
- ✅ Protected routes

### 2. Room Management
- ✅ Create room (public/private)
- ✅ Join room by code
- ✅ Join public room directly
- ✅ Real-time room list updates
- ✅ Room search & pagination
- ✅ Player list management

### 3. Game Flow
- ✅ Waiting room
- ✅ Host controls (start game, next question)
- ✅ Real-time question display
- ✅ Countdown timer
- ✅ Answer submission
- ✅ Live leaderboard
- ✅ Game results

### 4. Real-time Features
- ✅ Player join/leave notifications
- ✅ Host transfer
- ✅ Room updates broadcast
- ✅ Live player count
- ✅ Instant score updates

---

## 🔌 SOCKET.IO INTEGRATION

### Connection Setup
```javascript
// services/socketService.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:9092', {
  auth: { token: accessToken },
  transports: ['polling', 'websocket']
});
```

### Event Listeners

#### Room Events
```javascript
// Subscribe to room list
socket.emit('subscribe-room-list');

// Listen for room updates
socket.on('room-created', (data) => {
  // Handle new room
});

socket.on('room-updated', (data) => {
  // Handle room update
});

socket.on('room-deleted', (data) => {
  // Handle room deletion
});
```

#### Game Events
```javascript
// Start game (host only)
socket.emit('start-game', { roomId });

// Listen for game start
socket.on('game-started', (data) => {
  // Display first question
});

// Submit answer
socket.emit('submit-answer', {
  roomId,
  questionId,
  answerId,
  timeTaken
});

// Listen for answer result
socket.on('answer-submitted', (result) => {
  // Show if correct/incorrect
});

// Next question (host only)
socket.emit('next-question', { roomId });

// Listen for next question
socket.on('next-question', (data) => {
  // Display next question
});

// Game finished
socket.on('game-finished', (data) => {
  // Show final results
});
```

#### Player Events
```javascript
// Player joined
socket.on('player-joined', (data) => {
  // Update player list
});

// Player left
socket.on('player-left', (data) => {
  // Remove from player list
});

// Host changed
socket.on('host-changed', (data) => {
  // Update host indicator
});
```

---

## 📊 STATE MANAGEMENT

### 1. Auth Store (authStore.js)
```javascript
import authStore from './stores/authStore';

// Usage
const { user, login, logout, isAuthenticated } = authStore();

// Login
await login({ username, password });

// Logout
logout(navigate);

// Check auth
if (isAuthenticated()) {
  // User is logged in
}
```

### 2. Room Store (useRoomStore.js)
```javascript
import useRoomStore from './stores/useRoomStore';

// Usage
const {
  rooms,
  loading,
  loadRooms,
  joinRoom,
  subscribeToRoomList
} = useRoomStore();

// Load rooms
await loadRooms();

// Subscribe to real-time updates
subscribeToRoomList();

// Join room
const result = await joinRoom(roomCode);
```

### 3. Game Store (useGameStore.js)
```javascript
import useGameStore from './stores/useGameStore';

// Usage
const {
  isGameActive,
  currentQuestion,
  timeRemaining,
  startGame,
  submitAnswer,
  leaderboard
} = useGameStore();

// Start game (host)
startGame();

// Submit answer
submitAnswer(answerId);

// Get leaderboard
console.log(leaderboard);
```

---

## 🌐 API INTEGRATION

### REST API Endpoints

#### Authentication
```javascript
// Login
POST /api/v1/auth/login
{
  "username": "player",
  "password": "player123"
}

// Register
POST /api/v1/auth/register
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Room Management
```javascript
// Create room
POST /api/v1/rooms
Authorization: Bearer {token}
{
  "roomName": "My Quiz Room",
  "roomMode": "BATTLE_ROYAL",
  "topicId": 1,
  "isPrivate": false,
  "maxPlayers": 10,
  "questionCount": 10,
  "countdownTime": 30
}

// Get rooms
GET /api/v1/rooms?page=0&size=20&search=quiz
Authorization: Bearer {token}

// Join room by code
POST /api/v1/rooms/join
Authorization: Bearer {token}
{
  "roomCode": "ABC123"
}

// Get room players
GET /api/v1/rooms/{roomId}/players
Authorization: Bearer {token}
```

---

## 📖 HƯỚNG DẪN SỬ DỤNG

### 1. Đăng nhập
```
1. Truy cập http://localhost:5173
2. Click "Đăng nhập"
3. Nhập username: player / password: player123
4. Click "Đăng nhập"
```

### 2. Tạo phòng
```
1. Từ Dashboard, click "Tạo phòng mới"
2. Điền thông tin:
   - Tên phòng
   - Chế độ: ONE_VS_ONE hoặc BATTLE_ROYAL
   - Chủ đề
   - Số người chơi tối đa
   - Số câu hỏi
   - Thời gian mỗi câu
3. Click "Tạo phòng"
4. Tự động chuyển đến phòng chờ
```

### 3. Tham gia phòng
```
Cách 1: Join bằng mã
1. Click "Tham gia bằng mã"
2. Nhập mã phòng (8 ký tự)
3. Click "Tham gia"

Cách 2: Join phòng public
1. Xem danh sách phòng
2. Click "Tham gia" trên phòng muốn vào
```

### 4. Chơi game
```
Host:
1. Đợi người chơi join
2. Click "Bắt đầu game"
3. Điều khiển chuyển câu hỏi

Player:
1. Đợi host bắt đầu
2. Đọc câu hỏi
3. Click chọn đáp án
4. Xem kết quả
5. Đợi câu tiếp theo
```

### 5. Xem kết quả
```
1. Sau khi hết câu hỏi
2. Xem bảng xếp hạng
3. Xem điểm của mình
4. Click "Về trang chủ" hoặc "Chơi lại"
```

---

## 🔧 TROUBLESHOOTING

### Socket.IO không kết nối
```javascript
// Check console logs
// Ensure backend is running on port 9092
// Verify token is valid
// Check CORS settings
```

### Room list không cập nhật
```javascript
// Ensure subscribeToRoomList() is called
// Check socket connection status
// Verify backend is emitting events
```

### Game không bắt đầu
```javascript
// Ensure user is host
// Check minimum players requirement
// Verify socket connection
// Check backend logs
```

---

## 📝 NOTES

### Important Files
- `socketService.js` - Socket.IO connection & events
- `useRoomStore.js` - Room state management
- `useGameStore.js` - Game state management
- `WaitingRoom.jsx` - Pre-game lobby
- `GamePlay.jsx` - Main game component
- `GameResults.jsx` - Post-game results

### Key Concepts
1. **Real-time sync**: All players see updates instantly
2. **Host controls**: Only host can start/control game
3. **Timer sync**: Countdown synchronized across clients
4. **Auto-reconnect**: Socket reconnects on disconnect
5. **State persistence**: Game state maintained during reconnect

---

## 🚀 DEPLOYMENT

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
```env
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-socket-url.com
```

---

## 📞 SUPPORT

Nếu gặp vấn đề, kiểm tra:
1. Backend đang chạy (port 8080, 9092)
2. Database đang chạy (PostgreSQL, Redis)
3. Token hợp lệ
4. Socket.IO connection
5. Console logs

---

## ✅ CHECKLIST HOÀN THIỆN

### Core Features
- [x] Authentication (Login/Register)
- [x] Room Management (Create/Join/Leave)
- [x] Real-time Room List
- [x] Waiting Room
- [x] Game Flow (Start/Play/End)
- [x] Question Display
- [x] Answer Submission
- [x] Timer Countdown
- [x] Leaderboard
- [x] Game Results

### Real-time Features
- [x] Socket.IO Connection
- [x] Room List Updates
- [x] Player Join/Leave
- [x] Host Transfer
- [x] Game Synchronization
- [x] Live Scores

### UI/UX
- [x] Responsive Design
- [x] Loading States
- [x] Error Handling
- [x] Success Messages
- [x] Animations
- [x] Theme Support

---

## 🎉 FRONTEND 100% HOÀN THIỆN!

Frontend đã sẵn sàng để sử dụng với đầy đủ tính năng như Kahoot/Quizizz!

**Happy Coding! 🚀**
