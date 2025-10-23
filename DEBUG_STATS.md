# Debug Stats Issue

## Vấn đề
- Dashboard và Profile hiển thị N/A cho tất cả thống kê
- Đã chơi 15 game nhưng không có dữ liệu

## Đã thêm console.log để debug

### Cách kiểm tra:
1. Mở DevTools Console (F12)
2. Vào trang Dashboard hoặc Profile
3. Tìm các log bắt đầu bằng:
   - `[statsApi]` - Xem API call và response
   - `[useStats]` - Xem kết quả xử lý
   - `[Dashboard]` hoặc `[ProfileStats]` - Xem dữ liệu cuối cùng

### Các trường hợp có thể:

**1. API không tồn tại (404)**
```
[statsApi] Dashboard stats error: Error: Request failed with status code 404
```
→ Backend chưa có endpoint `/profile/stats`

**2. API trả về nhưng format sai**
```
[statsApi] Response data: { status: 200, message: "Success", data: {...} }
[useStats] Setting stats data: {...}
```
→ Kiểm tra cấu trúc data.data có đúng không

**3. API trả về null/empty**
```
[statsApi] Response data.data: null
```
→ Backend chưa tính toán stats

**4. Field names không khớp**
```
[ProfileStats] displayStats: { highest_score: 100, ... }
```
→ Backend dùng snake_case, frontend expect camelCase

## Cần kiểm tra backend

Endpoints cần có:
- `GET /api/v1/profile/stats` - Cho Dashboard
- `GET /api/v1/profile/stats/detailed` - Cho Profile
- `GET /api/v1/profile/achievements` - Cho thành tích

Format response mong đợi:
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "gamesPlayed": 15,
    "highScore": 850,
    "highestScore": 850,
    "rank": 5,
    "highestRank": 1,
    "fastestTime": 120,
    "bestTopic": "Toán học"
  }
}
```
