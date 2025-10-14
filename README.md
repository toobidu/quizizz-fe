# 🎮 Quizizz Clone - Ứng dụng Quiz Trực tuyến

Ứng dụng quiz trực tuyến tương tác với tính năng chơi theo phòng realtime, được xây dựng bằng React và Socket.IO.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Scripts](#scripts)
- [Đóng góp](#đóng-góp)

## 🎯 Giới thiệu

Quizizz Clone là một ứng dụng web cho phép người dùng tạo và tham gia các bài quiz trực tuyến theo thời gian thực. Ứng dụng hỗ trợ nhiều người chơi cùng lúc trong một phòng, với giao diện thân thiện và trải nghiệm mượt mà.

## ✨ Tính năng

### 🔐 Xác thực & Quản lý người dùng
- Đăng ký và đăng nhập tài khoản
- Quản lý thông tin cá nhân
- Upload và chỉnh sửa avatar
- Đổi mật khẩu
- Xác thực JWT với cookie

### 🎲 Hệ thống phòng chơi
- Tạo phòng chơi mới
- Tham gia phòng bằng mã code
- Quản lý phòng (host)
- Realtime cập nhật trạng thái phòng
- Hiển thị danh sách người chơi

### 🎮 Gameplay
- Chơi quiz theo thời gian thực
- Hiển thị câu hỏi và đáp án
- Tính điểm tự động
- Bảng xếp hạng realtime
- Hiệu ứng và animation

### 🎨 Giao diện
- Dark mode / Light mode
- Responsive design (mobile, tablet, desktop)
- UI/UX hiện đại với Poppins font
- Hiệu ứng chuyển động mượt mà
- Toast notifications

### 📊 Dashboard
- Xem lịch sử chơi
- Thống kê điểm số
- Quản lý chủ đề quiz
- Tìm kiếm và lọc

## 🛠️ Công nghệ sử dụng

### Frontend Framework & Libraries
- **React 19.1.0** - Thư viện UI
- **Vite 7.0.4** - Build tool & dev server
- **React Router DOM 7.7.1** - Routing
- **Zustand 5.0.6** - State management

### Realtime & API
- **Socket.IO Client 2.4.0** - WebSocket cho realtime
- **Axios 1.11.0** - HTTP client
- **Axios Retry 4.5.0** - Retry logic cho API

### UI & Styling
- **React Icons 5.5.0** - Icon library
- **React Toastify 11.0.5** - Toast notifications
- **React Image Crop 11.0.10** - Crop avatar
- **CSS Variables** - Theming system

### Authentication & Security
- **JWT Decode 4.0.0** - Decode JWT tokens
- **JS Cookie 3.0.5** - Cookie management

### Development Tools
- **ESLint 9.30.1** - Code linting
- **Vite Plugin React 4.6.0** - React support cho Vite

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/<your-username>/quizizz-fe.git
cd quizizz-fe
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**

Tạo file `.env` trong thư mục root:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. **Chạy ứng dụng**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📁 Cấu trúc dự án

```
quizizz-fe/
├── src/
│   ├── assets/              # Tài nguyên tĩnh
│   │   ├── fonts/          # Font chữ
│   │   └── images/         # Hình ảnh
│   │
│   ├── components/          # React components
│   │   ├── Profile/        # Components profile
│   │   ├── room/           # Components phòng chơi
│   │   ├── Decoration.jsx  # Trang trí UI
│   │   ├── Footer.jsx      # Footer
│   │   ├── Header.jsx      # Header
│   │   ├── Searchbar.jsx   # Thanh tìm kiếm
│   │   ├── SimpleBackground.jsx
│   │   └── ThemeToggle.jsx # Toggle dark/light mode
│   │
│   ├── contexts/            # React contexts
│   │   ├── data/           # Data contexts
│   │   └── ThemeContext.jsx # Theme context
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAvatarUpload.js
│   │   ├── useDocumentTitle.js
│   │   ├── usePasswordChange.js
│   │   ├── useProfileData.js
│   │   ├── useProfileEdit.js
│   │   ├── useTopics.js
│   │   └── useWebSocketCleanup.js
│   │
│   ├── pages/               # Các trang chính
│   │   ├── auth/           # Đăng nhập/Đăng ký
│   │   ├── dashboard/      # Dashboard
│   │   ├── footer/         # Footer pages
│   │   ├── game/           # Game pages
│   │   ├── room/           # Room pages
│   │   ├── Dashboard.jsx
│   │   ├── ErrorPage.jsx
│   │   ├── Profile.jsx
│   │   └── Welcome.jsx
│   │
│   ├── routers/             # Cấu hình routing
│   │   └── index.jsx
│   │
│   ├── services/            # API services
│   │   ├── apiInstance.js  # Axios instance
│   │   ├── authApi.js      # Auth API
│   │   ├── profileApi.js   # Profile API
│   │   ├── roomApi.js      # Room API
│   │   ├── socketService.js # Socket.IO service
│   │   └── topicApi.js     # Topic API
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.js
│   │   ├── useGameStore.js
│   │   ├── useRoomStore.js
│   │   └── useRoomStoreRealtime.js
│   │
│   ├── styles/              # CSS styles
│   │   ├── components/     # Component styles
│   │   ├── pages/          # Page styles
│   │   └── responsive.css  # Responsive styles
│   │
│   ├── utils/               # Utility functions
│   │   ├── profileUtils.js
│   │   ├── roomUtils.js
│   │   └── socketManager.js
│   │
│   ├── App.jsx              # Root component
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Hướng dẫn sử dụng

### Đăng ký tài khoản
1. Truy cập trang chủ
2. Click "Đăng ký"
3. Điền thông tin: username, email, password
4. Xác nhận đăng ký

### Tạo phòng chơi
1. Đăng nhập vào tài khoản
2. Vào Dashboard
3. Chọn "Tạo phòng mới"
4. Chọn chủ đề quiz
5. Chia sẻ mã phòng cho người chơi khác

### Tham gia phòng
1. Đăng nhập vào tài khoản
2. Click "Tham gia phòng"
3. Nhập mã phòng
4. Chờ host bắt đầu game

### Chơi game
1. Đọc câu hỏi
2. Chọn đáp án đúng
3. Xem điểm số realtime
4. Xem bảng xếp hạng sau mỗi câu

### Quản lý profile
1. Click vào avatar ở góc phải
2. Chọn "Profile"
3. Chỉnh sửa thông tin
4. Upload avatar mới
5. Đổi mật khẩu nếu cần

## 📜 Scripts

```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Theme System

Ứng dụng hỗ trợ 2 theme:

### Light Mode
- Background: #fafafa
- Primary: #4f46e5 (Indigo)
- Accent: #f59e0b (Amber)
- Text: #1f2937 (Gray-800)

### Dark Mode
- Background: #111827 (Gray-900)
- Primary: #a5b4fc (Indigo-300)
- Accent: #fbbf24 (Amber-400)
- Text: #e5e7eb (Gray-200)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

### Profile
- `GET /api/profile` - Lấy profile
- `PUT /api/profile` - Cập nhật profile
- `POST /api/profile/avatar` - Upload avatar
- `PUT /api/profile/password` - Đổi mật khẩu

### Room
- `POST /api/rooms` - Tạo phòng
- `GET /api/rooms/:code` - Lấy thông tin phòng
- `POST /api/rooms/:code/join` - Tham gia phòng
- `DELETE /api/rooms/:code` - Xóa phòng

### Topic
- `GET /api/topics` - Lấy danh sách chủ đề
- `GET /api/topics/:id` - Lấy chi tiết chủ đề

## 🔄 WebSocket Events

### Client → Server
- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `start-game` - Bắt đầu game
- `submit-answer` - Gửi câu trả lời

### Server → Client
- `room-updated` - Cập nhật trạng thái phòng
- `player-joined` - Người chơi mới tham gia
- `player-left` - Người chơi rời đi
- `game-started` - Game bắt đầu
- `question-data` - Dữ liệu câu hỏi
- `answer-result` - Kết quả câu trả lời
- `leaderboard` - Bảng xếp hạng

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được phát triển cho mục đích học tập.

## 👨‍💻 Tác giả

**Tên của bạn**
- GitHub: [@toobidu](https://github.com/your-username)
- Email: dungto0300567@gmail.com
---

⭐ Nếu bạn thấy dự án hữu ích, hãy cho một star nhé!
