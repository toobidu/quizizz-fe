# ⚡ QUICK START GUIDE

## 🚀 5 PHÚT ĐỂ CHẠY QUIZIZZ

### 1️⃣ Start Backend (Terminal 1)
```bash
cd quizizz
docker-compose up -d
./mvnw spring-boot:run
```
✅ Backend: http://localhost:8080
✅ Socket.IO: ws://localhost:9092
✅ Swagger: http://localhost:8080/swagger-ui.html

### 2️⃣ Start Frontend (Terminal 2)
```bash
cd quizizz-fe
npm install
npm run dev
```
✅ Frontend: http://localhost:5173

---

## 🎮 DEMO FLOW (2 PHÚT)

### Bước 1: Đăng nhập
```
URL: http://localhost:5173
Username: player
Password: player123
```

### Bước 2: Tạo phòng
```
1. Click "Tạo phòng mới"
2. Điền:
   - Tên: "Test Room"
   - Chế độ: BATTLE_ROYAL
   - Chủ đề: Chọn bất kỳ
   - Max players: 10
   - Số câu: 5
   - Thời gian: 30s
3. Click "Tạo phòng"
```

### Bước 3: Mời bạn bè (Tab mới)
```
1. Mở tab mới: http://localhost:5173
2. Đăng nhập user khác (hoặc đăng ký mới)
3. Click "Tham gia bằng mã"
4. Nhập mã phòng (8 ký tự)
5. Click "Tham gia"
```

### Bước 4: Bắt đầu game
```
Host (Tab 1):
1. Đợi player join
2. Click "Bắt đầu game"

Players (Tất cả tabs):
1. Đọc câu hỏi
2. Click chọn đáp án
3. Xem kết quả
4. Đợi câu tiếp theo
```

### Bước 5: Xem kết quả
```
1. Sau khi hết câu hỏi
2. Xem bảng xếp hạng
3. Xem điểm số
```

---

## 🔑 DEFAULT ACCOUNTS

```
Admin:
- Username: admin
- Password: admin123

Player:
- Username: player
- Password: player123
```

---

## 📊 SYSTEM REQUIREMENTS

```
✅ Node.js >= 18.0.0
✅ Java 21
✅ PostgreSQL (via Docker)
✅ Redis (via Docker)
✅ MinIO (via Docker)
```

---

## 🐛 TROUBLESHOOTING

### Backend không chạy?
```bash
# Check Docker
docker ps

# Restart Docker
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs
```

### Frontend không kết nối Socket.IO?
```javascript
// Check console
// Ensure backend is running
// Verify token in localStorage
// Check CORS settings
```

### Database error?
```bash
# Reset database
docker-compose down -v
docker-compose up -d
./mvnw spring-boot:run
```

---

## 📁 PROJECT STRUCTURE

```
Doan/
├── quizizz/              # Backend (Spring Boot)
│   ├── src/
│   ├── docker-compose.yml
│   └── pom.xml
│
└── quizizz-fe/           # Frontend (React + Vite)
    ├── src/
    ├── package.json
    └── vite.config.js
```

---

## 🔗 USEFUL LINKS

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Socket.IO**: ws://localhost:9092
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5436
- **Redis**: localhost:6384

---

## 📖 FULL DOCUMENTATION

- `FRONTEND_GUIDE.md` - Complete frontend guide
- `SOCKET_GAME_FLOW.md` - Socket.IO & game flow
- `API_DOCUMENTATION.md` - Backend API reference

---

## ✅ CHECKLIST

### Before Starting
- [ ] Docker installed & running
- [ ] Node.js >= 18 installed
- [ ] Java 21 installed
- [ ] Ports 5173, 8080, 9092 available

### After Starting
- [ ] Backend running (check http://localhost:8080/api/health)
- [ ] Frontend running (check http://localhost:5173)
- [ ] Socket.IO connected (check browser console)
- [ ] Can login
- [ ] Can create room
- [ ] Can join room
- [ ] Can play game

---

## 🎯 NEXT STEPS

1. ✅ Read `FRONTEND_GUIDE.md` for detailed setup
2. ✅ Read `SOCKET_GAME_FLOW.md` for game mechanics
3. ✅ Check `API_DOCUMENTATION.md` for API reference
4. ✅ Explore Swagger UI for API testing
5. ✅ Start building your own features!

---

## 🎉 YOU'RE READY!

**Happy Gaming! 🚀**

---

## 💡 TIPS

### Development
```bash
# Hot reload enabled
# Changes auto-refresh
# Check console for errors
```

### Testing
```bash
# Open multiple tabs
# Test with different users
# Check real-time updates
```

### Production
```bash
# Build frontend
npm run build

# Deploy backend
./mvnw clean package
java -jar target/quizizz-0.0.1-SNAPSHOT.jar
```

---

## 📞 NEED HELP?

1. Check console logs
2. Check backend logs
3. Check Docker logs
4. Read documentation
5. Check Swagger UI

---

**Made with ❤️ by Quizizz Team**
