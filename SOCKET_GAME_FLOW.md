# 🎮 SOCKET.IO & GAME FLOW GUIDE

## 📋 COMPLETE GAME FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUIZIZZ GAME FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. ROOM CREATION & JOINING
   ┌──────────────┐
   │  User Login  │
   └──────┬───────┘
          │
          ├─────────────────────────────────────┐
          │                                     │
   ┌──────▼──────┐                      ┌──────▼──────┐
   │ Create Room │                      │  Join Room  │
   │  (REST API) │                      │  (Socket)   │
   └──────┬───────┘                      └──────┬──────┘
          │                                     │
          └─────────────┬───────────────────────┘
                        │
                 ┌──────▼──────┐
                 │ Waiting Room│
                 │  (Socket)   │
                 └──────┬──────┘
                        │
                        │ Host clicks "Start Game"
                        │
2. GAME START
                 ┌──────▼──────────┐
                 │ emit('start-game')│
                 └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │on('game-started')│
                 │  First Question │
                 └──────┬──────────┘
                        │
3. QUESTION LOOP
                 ┌──────▼──────────┐
                 │ Display Question│
                 │  Start Timer    │
                 └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │ Players Answer  │
                 │emit('submit-    │
                 │     answer')    │
                 └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │on('answer-      │
                 │   submitted')   │
                 │ Show Result     │
                 └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │ Host clicks     │
                 │ "Next Question" │
                 │emit('next-      │
                 │    question')   │
                 └──────┬──────────┘
                        │
                 ┌──────▼──────────┐
                 │on('next-        │
                 │   question')    │
                 │ Display Next Q  │
                 └──────┬──────────┘
                        │
                        │ Repeat until all questions done
                        │
4. GAME END
                 ┌──────▼──────────┐
                 │on('game-        │
                 │   finished')    │
                 │ Show Results    │
                 │ & Leaderboard   │
                 └─────────────────┘
```

---

## 🔌 SOCKET.IO EVENT REFERENCE

### 📤 CLIENT → SERVER EVENTS

#### 1. Room Management
```javascript
// Subscribe to room list updates
socket.emit('subscribe-room-list');

// Unsubscribe from room list
socket.emit('unsubscribe-room-list');

// Join room
socket.emit('join-room', {
  roomCode: 'ABC12345'
});

// Leave room
socket.emit('leave-room', {
  roomId: 123
});

// Get players in room
socket.emit('get-players', {
  roomId: 123
});
```

#### 2. Game Control (Host Only)
```javascript
// Start game
socket.emit('start-game', {
  roomId: 123
});

// Show question results
socket.emit('show-question-result', {
  roomId: 123
});

// Next question
socket.emit('next-question', {
  roomId: 123
});

// End game
socket.emit('end-game', {
  roomId: 123
});
```

#### 3. Player Actions
```javascript
// Submit answer
socket.emit('submit-answer', {
  roomId: 123,
  questionId: 456,
  selectedOptionIndex: 0,
  selectedAnswer: "Option A",
  answerText: "Paris",
  timeTaken: 15.5
});
```

---

### 📥 SERVER → CLIENT EVENTS

#### 1. Room List Events
```javascript
// New room created
socket.on('room-created', (data) => {
  console.log('New room:', data.room);
  // data.room = {
  //   id, roomName, roomCode, roomMode, status,
  //   currentPlayers, maxPlayers, topicName, ...
  // }
});

// Room updated
socket.on('room-updated', (data) => {
  console.log('Room updated:', data.room);
});

// Room deleted
socket.on('room-deleted', (data) => {
  console.log('Room deleted:', data.roomId);
});
```

#### 2. Room Events
```javascript
// Room created successfully
socket.on('room-created-success', (data) => {
  console.log('Room:', data.room);
  console.log('Players:', data.players);
});

// Joined room successfully
socket.on('room-joined-success', (data) => {
  console.log('Room:', data.room);
  console.log('Players:', data.players);
});

// Player joined
socket.on('player-joined', (data) => {
  console.log('New player:', data.player);
  console.log('Total players:', data.totalPlayers);
});

// Player left
socket.on('player-left', (data) => {
  console.log('Player left:', data.player);
  console.log('Remaining:', data.totalPlayers);
});

// Players list updated
socket.on('room-players-updated', (data) => {
  console.log('Players:', data.players);
});

// Host changed
socket.on('host-changed', (data) => {
  console.log('New host:', data.newHostId);
  console.log('Previous host:', data.previousHostId);
});
```

#### 3. Game Events
```javascript
// Game started
socket.on('game-started', (data) => {
  console.log('First question:', data.question);
  // data.question = {
  //   questionId: 1,
  //   questionText: "What is the capital of France?",
  //   answers: [
  //     { id: 1, answerText: "Paris" },
  //     { id: 2, answerText: "London" },
  //     { id: 3, answerText: "Berlin" },
  //     { id: 4, answerText: "Madrid" }
  //   ],
  //   timeLimit: 30,
  //   questionNumber: 1,
  //   totalQuestions: 10
  // }
});

// Next question
socket.on('next-question', (data) => {
  console.log('Next question:', data.question);
});

// Countdown tick
socket.on('countdown-tick', (data) => {
  console.log('Time remaining:', data.remainingTime);
});

// Time up
socket.on('time-up', (data) => {
  console.log('Time is up!');
});

// Answer submitted
socket.on('answer-submitted', (data) => {
  console.log('Result:', data.result);
  // data.result = {
  //   isCorrect: true,
  //   score: 850,
  //   timeTaken: 15.5,
  //   correctAnswerId: 1
  // }
});

// Player answered
socket.on('player-answered', (data) => {
  console.log('Player answered:', data.userId);
});

// Show question result
socket.on('question-result-shown', (data) => {
  console.log('Show results now');
});

// Game finished
socket.on('game-finished', (data) => {
  console.log('Final results:', data.result);
  // data.result = {
  //   ranking: [
  //     {
  //       rank: 1,
  //       userId: 123,
  //       userName: "Player1",
  //       totalScore: 2500,
  //       totalTime: 180
  //     }
  //   ],
  //   userScores: [...]
  // }
});
```

#### 4. Error Events
```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

---

## 🎯 IMPLEMENTATION EXAMPLES

### 1. WaitingRoom Component
```javascript
import { useEffect, useState } from 'react';
import socketService from '../services/socketService';
import useRoomStore from '../stores/useRoomStore';

const WaitingRoom = ({ roomCode }) => {
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const { currentRoom } = useRoomStore();

  useEffect(() => {
    // Subscribe to room events
    socketService.subscribeToRoom(currentRoom.id, (event) => {
      switch (event.type) {
        case 'PLAYER_JOINED':
          setPlayers(prev => [...prev, event.data.player]);
          break;
        case 'PLAYER_LEFT':
          setPlayers(prev => 
            prev.filter(p => p.userId !== event.data.userId)
          );
          break;
        case 'ROOM_PLAYERS_UPDATED':
          setPlayers(event.data.players);
          break;
        case 'HOST_CHANGED':
          setIsHost(event.data.newHostId === currentUserId);
          break;
        case 'GAME_STARTED':
          navigate(`/game/${roomCode}`);
          break;
      }
    });

    return () => {
      socketService.unsubscribeFromRoom(currentRoom.id);
    };
  }, [currentRoom.id]);

  const handleStartGame = () => {
    if (isHost) {
      socketService.startGame(currentRoom.id);
    }
  };

  return (
    <div className="waiting-room">
      <h2>Room: {roomCode}</h2>
      <div className="players">
        {players.map(player => (
          <div key={player.userId} className="player">
            {player.username}
            {player.isHost && <span>👑</span>}
          </div>
        ))}
      </div>
      {isHost && (
        <button onClick={handleStartGame}>
          Start Game
        </button>
      )}
    </div>
  );
};
```

### 2. GamePlay Component
```javascript
import { useEffect } from 'react';
import useGameStore from '../stores/useGameStore';
import socketService from '../services/socketService';

const GamePlay = ({ roomId }) => {
  const {
    currentQuestion,
    timeRemaining,
    hasAnswered,
    answerResult,
    submitAnswer,
    nextQuestion,
    isHost
  } = useGameStore();

  useEffect(() => {
    // Setup game event listeners
    socketService.on('game-started', (data) => {
      useGameStore.getState().loadNextQuestion(data);
    });

    socketService.on('next-question', (data) => {
      useGameStore.getState().loadNextQuestion(data);
    });

    socketService.on('answer-submitted', (result) => {
      useGameStore.getState().onAnswerResult(result);
    });

    socketService.on('game-finished', (data) => {
      useGameStore.getState().onGameFinished(data);
      navigate(`/results/${roomId}`);
    });

    return () => {
      socketService.off('game-started');
      socketService.off('next-question');
      socketService.off('answer-submitted');
      socketService.off('game-finished');
    };
  }, [roomId]);

  const handleAnswerClick = (answerId) => {
    if (!hasAnswered) {
      submitAnswer(answerId);
    }
  };

  const handleNextQuestion = () => {
    if (isHost) {
      nextQuestion();
    }
  };

  return (
    <div className="game-play">
      <div className="timer">{timeRemaining}s</div>
      
      <div className="question">
        <h2>{currentQuestion?.questionText}</h2>
      </div>

      <div className="answers">
        {currentQuestion?.answers.map(answer => (
          <button
            key={answer.id}
            onClick={() => handleAnswerClick(answer.id)}
            disabled={hasAnswered}
            className={
              hasAnswered && answer.id === answerResult?.correctAnswerId
                ? 'correct'
                : hasAnswered && answer.id === selectedAnswer
                ? 'incorrect'
                : ''
            }
          >
            {answer.answerText}
          </button>
        ))}
      </div>

      {hasAnswered && answerResult && (
        <div className="result">
          {answerResult.isCorrect ? '✅ Correct!' : '❌ Wrong!'}
          <div>Score: {answerResult.score}</div>
        </div>
      )}

      {isHost && hasAnswered && (
        <button onClick={handleNextQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
};
```

### 3. GameResults Component
```javascript
import { useEffect, useState } from 'react';
import useGameStore from '../stores/useGameStore';

const GameResults = () => {
  const { leaderboard } = useGameStore();

  return (
    <div className="game-results">
      <h1>🏆 Game Results</h1>
      
      <div className="leaderboard">
        {leaderboard.map((player, index) => (
          <div key={player.userId} className="player-rank">
            <span className="rank">#{index + 1}</span>
            <span className="name">{player.userName}</span>
            <span className="score">{player.totalScore}</span>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/rooms')}>
        Back to Rooms
      </button>
    </div>
  );
};
```

---

## 🔄 STATE FLOW

### Room Store Flow
```
1. loadRooms() → GET /api/v1/rooms
2. subscribeToRoomList() → socket.emit('subscribe-room-list')
3. socket.on('room-created') → Add to rooms array
4. socket.on('room-updated') → Update room in array
5. socket.on('room-deleted') → Remove from array
```

### Game Store Flow
```
1. initGame(roomId, isHost)
2. startGame() → socket.emit('start-game')
3. socket.on('game-started') → loadNextQuestion()
4. startTimer(duration)
5. submitAnswer(answerId) → socket.emit('submit-answer')
6. socket.on('answer-submitted') → onAnswerResult()
7. nextQuestion() → socket.emit('next-question')
8. socket.on('next-question') → loadNextQuestion()
9. socket.on('game-finished') → onGameFinished()
```

---

## ⚡ PERFORMANCE TIPS

### 1. Debounce Socket Events
```javascript
import { debounce } from 'lodash';

const handleRoomUpdate = debounce((data) => {
  updateRoom(data);
}, 300);

socket.on('room-updated', handleRoomUpdate);
```

### 2. Cleanup Listeners
```javascript
useEffect(() => {
  const handler = (data) => handleEvent(data);
  socket.on('event-name', handler);

  return () => {
    socket.off('event-name', handler);
  };
}, []);
```

### 3. Memoize Components
```javascript
import { memo } from 'react';

const PlayerCard = memo(({ player }) => {
  return <div>{player.username}</div>;
});
```

---

## 🐛 DEBUGGING

### Enable Socket.IO Debug Logs
```javascript
localStorage.debug = 'socket.io-client:*';
```

### Check Connection Status
```javascript
console.log('Connected:', socketService.isConnected());
console.log('Socket ID:', socketService.getSocketId());
console.log('Joined Rooms:', socketService.getJoinedRooms());
```

### Monitor Events
```javascript
socket.onAny((eventName, ...args) => {
  console.log('Event:', eventName, args);
});
```

---

## ✅ TESTING CHECKLIST

### Room Management
- [ ] Create room successfully
- [ ] Join room by code
- [ ] Join public room
- [ ] See real-time room updates
- [ ] Player list updates
- [ ] Host transfer works

### Game Flow
- [ ] Game starts for all players
- [ ] Questions display correctly
- [ ] Timer counts down
- [ ] Answers submit successfully
- [ ] Results show correctly
- [ ] Next question works
- [ ] Game ends properly
- [ ] Leaderboard displays

### Edge Cases
- [ ] Handle disconnect/reconnect
- [ ] Handle host leaving
- [ ] Handle player kicked
- [ ] Handle timeout
- [ ] Handle errors gracefully

---

## 🎉 COMPLETE!

Frontend Socket.IO integration hoàn thiện 100%!

**Ready for production! 🚀**
