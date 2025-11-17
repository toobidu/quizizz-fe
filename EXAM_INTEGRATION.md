# 🔄 Topic -> Exam Integration Update

## 📋 Tổng quan

Backend đã thay đổi cấu trúc: **Topic → Exam → Question → Answer**

Khi tạo phòng, người chơi phải:
1. Chọn **Topic** (Chủ đề)
2. Chọn **Exam** (Bộ đề) thuộc topic đó

## ✅ Đã thực hiện

### 1. **Tạo Exam API Service**
File: `src/services/examApi.js`

```javascript
examApi.getAllExams()
examApi.getExamsByTopicId(topicId)
examApi.getExamById(examId)
examApi.searchExams(keyword, topicId, page, size)
examApi.createExam(examData)  // Teacher only
examApi.updateExam(examId, examData)  // Teacher only
examApi.deleteExam(examId)  // Teacher only
```

### 2. **Custom Hook: useExams**
File: `src/hooks/useExams.js`

```javascript
const { exams, loading, error, loadExams, refreshExams } = useExams(topicId);
```

- Auto load exams khi topicId thay đổi
- Hỗ trợ search local
- Error handling

### 3. **Cập nhật CreateRoomModal**
File: `src/components/room/CreateRoomModal.jsx`

**Thay đổi:**
- ✅ Thêm dropdown chọn Exam
- ✅ Load exams tự động khi chọn Topic
- ✅ Validate cả topicId và examId
- ✅ Auto-select exam đầu tiên khi có
- ✅ Hiển thị warning nếu topic chưa có exam
- ✅ Disable exam dropdown nếu chưa chọn topic

**UI Flow:**
```
1. Chọn Topic → Load exams của topic đó
2. Auto-select exam đầu tiên (nếu có)
3. Có thể chọn exam khác
4. Submit cả topicId và examId
```

### 4. **Cập nhật Room Utils**
File: `src/utils/roomUtils.js`

**mapRoomFromBackend:**
```javascript
{
  examId: backendRoom.examId,
  examTitle: backendRoom.examTitle
}
```

**mapCreateRoomRequest:**
```javascript
{
  topicId: parseInt(frontendData.topicId),
  examId: parseInt(frontendData.examId),  // NEW
  // ...
}
```

### 5. **Cập nhật RoomCard**
File: `src/components/room/RoomCard.jsx`

- Hiển thị tên bộ đề (nếu có)
- Layout responsive với exam info

## 🔧 API Endpoints Backend

**Base URL:** `/api/v1/exams`

```
GET /exams                          - Lấy tất cả exams
GET /exams/{id}                     - Lấy exam theo ID
GET /exams/topic/{topicId}          - Lấy exams theo topic
GET /exams/search                   - Tìm kiếm exams (với pagination)
  ?keyword={keyword}                  - Filter by keyword (optional)
  &topicId={topicId}                  - Filter by topic (optional)
  &page={page}                        - Page number (default: 0)
  &size={size}                        - Page size (default: 10)
  &sort={sort}                        - Sort criteria (default: 'id,desc')

POST /exams                         - Tạo exam (Teacher - requires 'topic:manage')
PUT /exams/{id}                     - Cập nhật exam (Teacher - requires 'topic:manage')
DELETE /exams/{id}                  - Xóa exam (Teacher - requires 'topic:manage')
```

**ExamResponse Structure:**
```javascript
{
  id: Long,
  topicId: Long,
  topicName: String,
  title: String,
  description: String,
  questionCount: Integer,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

**CreateExamRequest:**
```javascript
{
  topicId: Long,        // Required
  title: String,        // Required
  description: String   // Optional
}
```

**UpdateExamRequest:**
```javascript
{
  title: String,        // Optional
  description: String   // Optional
}
```

## 📝 CreateRoomRequest Structure

**Backend expects:**
```java
{
  roomName: String,
  roomMode: RoomMode,
  topicId: Long,        // Required
  examId: Long,         // Required - NEW
  isPrivate: Boolean,
  maxPlayers: Integer,
  questionCount: Integer,
  countdownTime: Integer
}
```

## 🎯 User Flow

### Tạo phòng mới:

1. **Nhập tên phòng**
2. **Chọn Topic** 
   - Dropdown hiển thị danh sách topics
3. **Chọn Exam** 
   - Auto load exams của topic đã chọn
   - Nếu không có exam → Warning
   - Auto-select exam đầu tiên
4. **Cấu hình phòng**
   - Game mode
   - Max players
   - Time limit
   - Question count
5. **Tạo phòng**
   - Validate topicId và examId
   - Submit request

## 🔍 Validation

```javascript
// Frontend validation
if (!roomData.topicId) {
  setError('Vui lòng chọn chủ đề câu hỏi');
  return;
}

if (!roomData.examId) {
  setError('Vui lòng chọn bộ đề');
  return;
}
```

## 🎨 UI Components

### CreateRoomModal
- Topic dropdown (existing)
- **Exam dropdown (NEW)**
  - Disabled nếu chưa chọn topic
  - Loading state khi fetch exams
  - Warning nếu topic chưa có exam

### RoomCard
- Hiển thị topic name
- **Hiển thị exam title (NEW)**
- Game mode, players count

## 📦 Files Created

```
src/
├── services/
│   └── examApi.js              ✨ NEW
├── hooks/
│   └── useExams.js             ✨ NEW
└── EXAM_INTEGRATION.md         ✨ NEW (this file)
```

## 📝 Files Modified

```
src/
├── components/room/
│   ├── CreateRoomModal.jsx     ✏️ UPDATED
│   └── RoomCard.jsx            ✏️ UPDATED
└── utils/
    └── roomUtils.js            ✏️ UPDATED
```

## 🧪 Testing Checklist

- [ ] Chọn topic → Exam dropdown load đúng
- [ ] Topic không có exam → Warning hiển thị
- [ ] Auto-select exam đầu tiên
- [ ] Có thể chọn exam khác
- [ ] Validation: Không cho submit nếu thiếu examId
- [ ] Tạo phòng thành công với examId
- [ ] RoomCard hiển thị exam title
- [ ] Switch topic → Reset exam selection

## 🚀 Next Steps

### Player Features
- [x] Tích hợp exam vào create room
- [ ] Hiển thị exam info trong waiting room
- [ ] Hiển thị exam questions trong game

### Teacher Features  
- [ ] CRUD Exams UI
- [ ] Assign questions to exams
- [ ] Exam statistics
- [ ] Duplicate exam feature

### Admin Features
- [ ] Manage all exams
- [ ] Exam approval workflow (nếu cần)

## ⚠️ Breaking Changes

**CreateRoomRequest:**
- Bắt buộc phải có `examId` (trước đây chỉ cần `topicId`)

**Migration:**
- Tất cả topics phải có ít nhất 1 exam
- Nếu không có exam → User không thể tạo phòng với topic đó

## 💡 Tips

1. **Nếu topic chưa có exam:**
   - Hiển thị warning rõ ràng
   - Gợi ý chọn topic khác
   - Hoặc liên hệ teacher

2. **Performance:**
   - Exams được cache khi switch giữa các topics
   - Auto-load khi topic change

3. **UX:**
   - Auto-select giúp user không phải click thêm
   - Loading states rõ ràng
   - Validation messages cụ thể
