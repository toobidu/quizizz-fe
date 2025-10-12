# 🎮 QUIZIZZ FRONTEND

> Real-time multiplayer quiz game platform like Kahoot/Quizizz

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-purple.svg)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-green.svg)](https://socket.io/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.6-orange.svg)](https://zustand-demo.pmnd.rs/)

---

## ✨ FEATURES

### 🎯 Core Features
- ✅ **Real-time Multiplayer** - Play with friends in real-time
- ✅ **Live Room Updates** - See players join/leave instantly
- ✅ **Countdown Timer** - Synchronized timer across all players
- ✅ **Live Leaderboard** - Real-time score updates
- ✅ **Host Controls** - Host can control game flow
- ✅ **Auto Reconnect** - Seamless reconnection on disconnect

### 🎨 UI/UX
- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark/Light Theme** - Theme toggle support
- ✅ **Smooth Animations** - Beautiful transitions
- ✅ **Loading States** - Clear loading indicators
- ✅ **Error Handling** - User-friendly error messages

### 🔐 Authentication
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Auto Refresh Token** - Seamless token refresh
- ✅ **Protected Routes** - Route guards
- ✅ **Profile Management** - User profile & avatar

---

## 🚀 QUICK START

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd quizizz-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access
```
Frontend: http://localhost:5173
Backend API: http://localhost:8080
Socket.IO: ws://localhost:9092
```

### Default Login
```
Username: player
Password: player123
```

---

## 📚 DOCUMENTATION

### 📖 Guides
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Complete frontend documentation
- **[SOCKET_GAME_FLOW.md](./SOCKET_GAME_FLOW.md)** - Socket.IO & game flow guide

### 🔗 Backend
- **[API_DOCUMENTATION.md](../quizizz/API_DOCUMENTATION.md)** - Backend API reference
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## 🏗️ TECH STACK

### Core
- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **React Router 7** - Client-side routing

### State Management
- **Zustand 5** - Lightweight state management
- **React Hooks** - Built-in state management

### Real-time
- **Socket.IO Client 4.8** - WebSocket communication
- **Custom Socket Service** - Socket.IO wrapper

### HTTP Client
- **Axios 1.11** - HTTP requests
- **Axios Retry** - Auto retry failed requests

### UI/UX
- **React Icons 5.5** - Icon library
- **React Image Crop** - Avatar cropping
- **React Toastify** - Toast notifications
- **Custom CSS** - Responsive styling

### Utils
- **JWT Decode** - Token decoding
- **JS Cookie** - Cookie management

---

## 📁 PROJECT STRUCTURE

```
quizizz-fe/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Reusable components
│   │   ├── room/           # Room components
│   │   │   ├── CreateRoomModal.jsx
│   │   │   ├── JoinByCodeModal.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   ├── GamePlay.jsx
│   │   │   └── GameResults.jsx
│   │   ├── Profile/        # Profile components
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── pages/              # Page components
│   │   ├── auth/          # Auth pages
│   │   ├── room/          # Room pages
│   │   ├── game/          # Game pages
│   │   └── Dashboard.jsx
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
│   ├── styles/            # CSS files
│   ├── routers/           # Route config
│   ├── App.jsx
│   └── main.jsx
├── public/                # Public assets
├── .env                   # Environment variables
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎮 GAME FLOW

```
1. Login → Dashboard
2. Create/Join Room → Waiting Room
3. Host starts game → Game Play
4. Answer questions → Live scoring
5. Game ends → Results & Leaderboard
```

### Detailed Flow
```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
┌──────▼──────┐
│  Dashboard  │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│ Create Room │   │  Join Room  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                │
         ┌──────▼──────┐
         │Waiting Room │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │  Game Play  │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │   Results   │
         └─────────────┘
```

---

## 🔌 SOCKET.IO EVENTS

### Client → Server
```javascript
// Room management
socket.emit('subscribe-room-list');
socket.emit('join-room', { roomCode });
socket.emit('leave-room', { roomId });

// Game control (host only)
socket.emit('start-game', { roomId });
socket.emit('next-question', { roomId });

// Player actions
socket.emit('submit-answer', {
  roomId, questionId, answerId, timeTaken
});
```

### Server → Client
```javascript
// Room events
socket.on('room-created', (data) => {});
socket.on('player-joined', (data) => {});
socket.on('player-left', (data) => {});

// Game events
socket.on('game-started', (data) => {});
socket.on('next-question', (data) => {});
socket.on('answer-submitted', (data) => {});
socket.on('game-finished', (data) => {});
```

---

## 🛠️ DEVELOPMENT

### Available Scripts
```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Lint
npm run lint         # Run ESLint
```

### Environment Variables
```env
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:9092
```

### Code Style
- ESLint configuration included
- React hooks rules enforced
- Consistent code formatting

---

## 🧪 TESTING

### Manual Testing
```bash
# Open multiple browser tabs
# Login with different users
# Create/join rooms
# Play game together
# Check real-time updates
```

### Test Accounts
```
Admin:  admin / admin123
Player: player / player123
```

---

## 📦 BUILD & DEPLOY

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Environment Variables (Production)
```env
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-socket-url.com
```

---

## 🐛 TROUBLESHOOTING

### Socket.IO not connecting?
```javascript
// Check console logs
// Ensure backend is running
// Verify token is valid
// Check CORS settings
```

### Room list not updating?
```javascript
// Ensure subscribeToRoomList() is called
// Check socket connection status
// Verify backend is emitting events
```

### Game not starting?
```javascript
// Ensure user is host
// Check minimum players requirement
// Verify socket connection
// Check backend logs
```

---

## 📊 PERFORMANCE

### Optimizations
- ✅ Code splitting with React.lazy()
- ✅ Memoization with React.memo()
- ✅ Debounced socket events
- ✅ Efficient state updates
- ✅ Lazy loading images

### Bundle Size
```
Production build: ~500KB (gzipped)
Initial load: ~200KB
```

---

## 🔒 SECURITY

### Implemented
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ Input validation
- ✅ Secure WebSocket connection

---

## 🌐 BROWSER SUPPORT

```
✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)
✅ Mobile browsers
```

---

## 📈 ROADMAP

### Completed ✅
- [x] Authentication system
- [x] Room management
- [x] Real-time game play
- [x] Leaderboard
- [x] Profile management
- [x] Socket.IO integration

### Future Features 🚀
- [ ] Voice chat
- [ ] Video chat
- [ ] Custom question sets
- [ ] Game history
- [ ] Achievements
- [ ] Social features

---

## 🤝 CONTRIBUTING

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 LICENSE

This project is licensed under the MIT License.

---

## 👥 TEAM

- **Frontend Developer** - React, Socket.IO, UI/UX
- **Backend Developer** - Spring Boot, WebSocket, Database

---

## 📞 SUPPORT

### Documentation
- [Quick Start Guide](./QUICK_START.md)
- [Frontend Guide](./FRONTEND_GUIDE.md)
- [Socket.IO Guide](./SOCKET_GAME_FLOW.md)

### Links
- **GitHub**: [Repository URL]
- **Demo**: [Demo URL]
- **API Docs**: http://localhost:8080/swagger-ui.html

---

## 🎉 ACKNOWLEDGMENTS

- React team for amazing framework
- Socket.IO team for real-time library
- Zustand team for state management
- Vite team for blazing fast build tool

---

## ⭐ SHOW YOUR SUPPORT

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by Quizizz Team**

**Frontend 100% Complete! 🚀**
