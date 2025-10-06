# Frontend API & Events Specification

## 📋 Tổng quan
Tài liệu này mô tả tất cả các API endpoints và Socket.IO events mà Frontend đang sử dụng. Backend cần implement đúng các endpoints và events này.

---

## 🔗 REST API Endpoints

### 1. Topics Management
```http
GET /topics
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "name": string,
      "description": string
    }
  ]
}
```

### 2. Room Management

#### 2.1 Get Rooms (with pagination)
```http
GET /rooms?page={page}&size={size}&search={search}
```
**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 6)
- `search`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [RoomObject],
    "totalPages": number,
    "totalElements": number,
    "page": number,
    "size": number
  }
}
```

#### 2.2 Create Room
```http
POST /rooms
```
**Request Body:**
```json
{
  "roomName": string,
  "roomMode": "ONE_VS_ONE" | "BATTLE_ROYAL",
  "topicId": number,
  "isPrivate": boolean,
  "maxPlayers": number,
  "questionCount": number,
  "countdownTime": number
}
```
**Response:**
```json
{
  "success": true,
  "data": RoomObject,
  "message": string
}
```

#### 2.3 Get Room by ID
```http
GET /rooms/{roomId}
```
**Response:**
```json
{
  "success": true,
  "data": RoomObject
}
```

#### 2.4 Get Room by Code
```http
GET /rooms/code/{roomCode}
```
**Response:**
```json
{
  "success": true,
  "data": RoomObject
}
```

#### 2.5 Join Room by Code
```http
POST /rooms/join
```
**Request Body:**
```json
{
  "roomCode": string
}
```
**Response:**
```json
{
  "success": true,
  "data": RoomObject,
  "message": string
}
```

#### 2.6 Join Room Direct
```http
POST /rooms/{roomId}/join-direct
```
**Response:**
```json
{
  "success": true,
  "data": RoomObject,
  "message": string
}
```

#### 2.7 Leave Room
```http
DELETE /rooms/{roomId}/leave
```
**Response:**
```json
{
  "success": true,
  "message": string
}
```

#### 2.8 Get Room Players
```http
GET /rooms/{roomId}/players
```
**Response:**
```json
{
  "success": true,
  "data": [PlayerObject]
}
```

#### 2.9 Kick Player
```http
DELETE /rooms/{roomId}/kick
```
**Request Body:**
```json
{
  "playerId": number,
  "reason": string
}
```
**Response:**
```json
{
  "success": true,
  "message": string
}
```

#### 2.10 Transfer Host
```http
POST /rooms/{roomId}/transfer-host?newHostId={newHostId}
```
**Response:**
```json
{
  "success": true,
  "message": string
}
```

#### 2.11 Start Game
```http
POST /rooms/{roomId}/start
```
**Response:**
```json
{
  "success": true,
  "data": GameStateObject,
  "message": string
}
```

#### 2.12 Delete Room
```http
DELETE /rooms/{roomId}
```
**Response:**
```json
{
  "success": true,
  "message": string
}
```

---

## 🔌 Socket.IO Events

### Connection Setup
```javascript
// Frontend connects with:
{
  auth: { token: string },
  query: { token: string },
  transports: ['websocket', 'polling']
}
```

### 1. Client → Server Events (Frontend gửi)

#### Connection & Testing
```javascript
'test-connection'     // Test connection
'ping'               // Ping server
```

#### Room Management
```javascript
'subscribe-room-list' // Subscribe to room list updates
'join-room'          // Join room via Socket.IO
'leave-room'         // Leave room via Socket.IO
```
**Data format:**
```json
{
  "roomId": number
}
```

#### Game Management
```javascript
'start-game'         // Start game
'getGameState'       // Get current game state
'submitAnswer'       // Submit answer
```

**start-game data:**
```json
{
  "roomId": number
}
```

**getGameState data:**
```json
{
  "roomCode": string
}
```

**submitAnswer data:**
```json
{
  "roomCode": string,
  "questionId": number,
  "selectedAnswer": string,
  "selectedOptionIndex": number,
  "submissionTime": number,
  "answerText": string
}
```

### 2. Server → Client Events (Backend gửi)

#### Connection Events
```javascript
'connect'                // Connection successful
'disconnect'             // Connection lost
'connect_error'          // Connection error
'reconnect'              // Reconnected
'reconnect_failed'       // Reconnection failed
'connection-confirmed'   // Backend confirms connection
'subscription-confirmed' // Backend confirms subscription
```

#### Global Room Events (Broadcast to all clients)
```javascript
'roomCreated'           // New room created
'roomDeleted'           // Room deleted
'roomUpdated'           // Room updated
```
**Data format:**
```json
{
  "room": RoomObject,     // For created/updated
  "roomId": number        // For deleted
}
```

#### Room-Specific Events
```javascript
'player-joined'         // Player joined room
'player-left'           // Player left room
'player-kicked'         // Player was kicked
'room-players'          // Room players updated
'host-changed'          // Host changed
```
**Data format:**
```json
{
  "roomId": number,
  "userId": number,
  "username": string,
  "playerId": number,     // For kicked event
  "reason": string,       // For kicked event
  "newHostId": number,    // For host changed
  "room": RoomObject,     // Optional
  "players": [PlayerObject] // For room-players event
}
```

#### Game Events
```javascript
'game-started'          // Game started
'game-ended'            // Game ended
'next-question'         // Next question
'question-started'      // Question started
'question-result'       // Question result
'answer-submitted'      // Answer submitted
'game-state'            // Game state
'game-update'           // Game update
```

**game-started/game-ended data:**
```json
{
  "roomId": number,
  "gameState": GameStateObject
}
```

**next-question data:**
```json
{
  "roomId": number,
  "questionId": number,
  "questionText": string,
  "options": [string],
  "imageUrl": string,
  "timeLimit": number,
  "currentQuestionNumber": number,
  "totalQuestions": number
}
```

**question-result data:**
```json
{
  "roomId": number,
  "userId": number,
  "isCorrect": boolean,
  "pointsEarned": number,
  "correctAnswer": string,
  "leaderboard": [LeaderboardItem]
}
```

#### Response Events
```javascript
'join-room-success'     // Join room successful
'join-room-error'       // Join room failed
'start-game-success'    // Start game successful
'start-game-error'      // Start game failed
'test-response'         // Test response
```

---

## 📊 Data Models

### RoomObject
```json
{
  "id": number,
  "roomCode": string,
  "roomName": string,
  "topicId": number,
  "topicName": string,
  "ownerId": number,
  "hostId": number,
  "ownerUsername": string,
  "maxPlayers": number,
  "currentPlayers": number,
  "isPrivate": boolean,
  "roomMode": "ONE_VS_ONE" | "BATTLE_ROYAL",
  "questionCount": number,
  "countdownTime": number,
  "status": "WAITING" | "PLAYING" | "FINISHED",
  "createdAt": string
}
```

### PlayerObject
```json
{
  "id": number,
  "userId": number,
  "username": string,
  "isHost": boolean,
  "avatarUrl": string,
  "status": string
}
```

### GameStateObject
```json
{
  "roomId": number,
  "gameStatus": string,
  "totalQuestions": number,
  "currentQuestionNumber": number,
  "timeRemaining": number,
  "players": [GamePlayerObject],
  "isHost": boolean,
  "currentQuestion": QuestionObject
}
```

### GamePlayerObject
```json
{
  "userId": number,
  "displayName": string,
  "avatarUrl": string,
  "score": number,
  "hasAnswered": boolean,
  "status": string,
  "correctAnswers": number,
  "totalAnswers": number
}
```

### LeaderboardItem
```json
{
  "userId": number,
  "displayName": string,
  "score": number,
  "correctAnswers": number,
  "totalAnswers": number,
  "rank": number
}
```

---

## ⚠️ Error Codes

### HTTP Error Codes
```javascript
'ROOM_NOT_FOUND'        // Room not found
'ROOM_ALREADY_JOINED'   // Already joined room
'UNAUTHORIZED'          // Not authorized
'FORBIDDEN'             // Forbidden action
'VALIDATION_ERROR'      // Invalid input
'UNKNOWN_ERROR'         // Unknown error
```

### Socket.IO Error Responses
```json
{
  "success": false,
  "error": string,
  "code": string
}
```

---

## 🔐 Authentication

### REST API
```http
Authorization: Bearer <JWT_TOKEN>
```

### Socket.IO
```javascript
{
  auth: { token: "<JWT_TOKEN>" },
  query: { token: "<JWT_TOKEN>" }
}
```

---

## 📝 Notes

1. **Room Code Format**: 8 ký tự chữ cái hoặc số (A-Z, 0-9)
2. **Pagination**: Sử dụng 0-based indexing
3. **Real-time Updates**: Tất cả room events đều được broadcast qua Socket.IO
4. **Error Handling**: Luôn trả về `success: boolean` trong response
5. **Reconnection**: Frontend tự động rejoin rooms khi reconnect
6. **Timeout**: Join room có timeout 5 giây

---

## ✅ Checklist cho Backend

- [ ] Implement tất cả REST API endpoints
- [ ] Implement tất cả Socket.IO events
- [ ] Đảm bảo data models khớp với frontend
- [ ] Test authentication cho cả REST và Socket.IO
- [ ] Test pagination và search
- [ ] Test real-time room updates
- [ ] Test game flow events
- [ ] Implement proper error codes
- [ ] Test reconnection handling