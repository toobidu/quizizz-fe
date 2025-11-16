# Role-Based Routing Structure

## 📂 Cấu trúc Features

```
features/
├── player/
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Leaderboard.jsx
│       ├── room/
│       │   └── RoomPage.jsx
│       └── index.js
├── teacher/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
└── admin/
    └── pages/
        ├── AdminDashboard.jsx
        └── index.js
```

## 🛣️ Routes

### PLAYER
- `/dashboard` - Dashboard người chơi
- `/rooms` - Danh sách phòng
- `/waiting-room/:code` - Phòng chờ
- `/game/:code` - Phòng game
- `/leaderboard` - Bảng xếp hạng

### TEACHER
- `/teacher/dashboard` - Dashboard giáo viên
- `/teacher/topics` - Quản lý chủ đề
- `/teacher/questions` - Quản lý câu hỏi
- `/teacher/ai-generator` - Tạo câu hỏi AI

### ADMIN
- `/admin/dashboard` - Dashboard admin

### COMMON (All roles)
- `/profile` - Trang cá nhân

## 🔐 Guards

- **ProtectedRoute** - Yêu cầu đăng nhập
- **RoleBasedRoute** - Yêu cầu role cụ thể
- **RoleBasedRedirect** - Auto redirect theo role

## 🎯 Token Structure

```javascript
{
  userId: 123,
  typeAccount: "TEACHER",  // PLAYER | TEACHER | ADMIN
  rank: "BRONZE",
  sub: "123",
  iat: 1234567890,
  exp: 1234654290
}
```

## 📝 Thêm Route Mới

### Player Route
```jsx
// src/routers/routes/playerRoutes.jsx
{
  path: "new-feature",
  element: (
    <RoleBasedRoute allowedRoles={["PLAYER"]}>
      <NewFeature />
    </RoleBasedRoute>
  ),
}
```

### Admin Route
```jsx
// src/routers/routes/adminRoutes.jsx
{
  path: "admin/users",
  element: (
    <RoleBasedRoute allowedRoles={["ADMIN"]}>
      <UserManagement />
    </RoleBasedRoute>
  ),
}
```

## ✅ Đã Sửa

1. ✅ Duplicate export trong router - Fixed
2. ✅ Di chuyển player pages vào features/player/pages
3. ✅ Xóa các file example/documentation không cần thiết
4. ✅ Tạo index.js exports cho cleaner imports
5. ✅ Cập nhật tất cả import paths
