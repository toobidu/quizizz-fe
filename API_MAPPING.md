# 📋 Backend API Mapping Reference

## ✅ Exam API - Đã đối chiếu với ExamController

### Backend Controller
**File:** `quizizz/src/main/java/org/example/quizizz/controller/api/ExamController.java`  
**Base Path:** `/api/v1/exams`

### API Endpoints

| Method | Endpoint | Frontend Function | Auth Required | Notes |
|--------|----------|------------------|---------------|-------|
| `GET` | `/exams` | `getAllExams()` | No | Lấy tất cả exams |
| `GET` | `/exams/{id}` | `getExamById(examId)` | No | Lấy exam theo ID |
| `GET` | `/exams/topic/{topicId}` | `getExamsByTopicId(topicId)` | No | Lấy exams theo topic |
| `GET` | `/exams/search` | `searchExams(keyword, topicId, page, size, sort)` | No | Tìm kiếm với pagination |
| `POST` | `/exams` | `createExam(examData)` | Yes (`topic:manage`) | Tạo exam mới |
| `PUT` | `/exams/{id}` | `updateExam(examId, examData)` | Yes (`topic:manage`) | Cập nhật exam |
| `DELETE` | `/exams/{id}` | `deleteExam(examId)` | Yes (`topic:manage`) | Xóa exam |

### Request/Response Structures

#### ExamResponse
```java
// Backend: ExamResponse.java
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

#### CreateExamRequest
```java
// Backend: CreateExamRequest.java
{
  topicId: Long,        // @NotNull
  title: String,        // @NotBlank
  description: String   // Optional
}
```

#### UpdateExamRequest
```java
// Backend: UpdateExamRequest.java
{
  title: String,        // Optional
  description: String   // Optional
}
```

### Frontend Usage Examples

```javascript
import examApi from '../services/examApi';

// 1. Get all exams
const { success, data } = await examApi.getAllExams();

// 2. Get exams by topic
const { success, data } = await examApi.getExamsByTopicId(topicId);

// 3. Get exam by ID
const { success, data } = await examApi.getExamById(examId);

// 4. Search exams
const { success, data } = await examApi.searchExams('Toán', 1, 0, 10, 'title,asc');

// 5. Create exam (Teacher only)
const { success, data, message } = await examApi.createExam({
  topicId: 1,
  title: "Đề thi Toán lớp 10",
  description: "Đề thi học kỳ 1"
});

// 6. Update exam (Teacher only)
const { success, data, message } = await examApi.updateExam(examId, {
  title: "Đề thi Toán lớp 10 - Cập nhật",
  description: "Đề thi học kỳ 1 - Phiên bản 2"
});

// 7. Delete exam (Teacher only)
const { success, message } = await examApi.deleteExam(examId);
```

## ✅ Room API - CreateRoomRequest

### Backend Structure
```java
// CreateRoomRequest.java
{
  roomName: String,         // @NotBlank
  roomMode: RoomMode,       // @NotNull (ONE_VS_ONE | BATTLE_ROYAL)
  topicId: Long,            // @NotNull
  examId: Long,             // @NotNull - REQUIRED
  isPrivate: Boolean,       // Default: false
  maxPlayers: Integer,      // Optional
  questionCount: Integer,   // Default: 10
  countdownTime: Integer    // Default: 30
}
```

### Frontend Mapping
```javascript
// roomUtils.js - mapCreateRoomRequest()
{
  roomName: frontendData.roomName,
  roomMode: frontendData.roomMode || frontendData.gameMode,
  topicId: parseInt(frontendData.topicId),
  examId: parseInt(frontendData.examId),    // REQUIRED
  isPrivate: frontendData.isPrivate || false,
  maxPlayers: parseInt(frontendData.maxPlayers),
  questionCount: parseInt(frontendData.questionCount),
  countdownTime: parseInt(frontendData.countdownTime || frontendData.timeLimit)
}
```

## 🔍 Validation Rules

### Backend Validation
- `topicId`: Must be `@NotNull`
- `examId`: Must be `@NotNull`
- `roomName`: Must be `@NotBlank`
- `roomMode`: Must be `@NotNull`

### Frontend Validation
```javascript
if (!roomData.topicId) {
  setError('Vui lòng chọn chủ đề câu hỏi');
  return;
}

if (!roomData.examId) {
  setError('Vui lòng chọn bộ đề');
  return;
}
```

## 📊 Response Format

### Standard ApiResponse
```java
{
  success: boolean,
  message: String,
  data: T,
  code: String
}
```

### PageResponse (for search)
```java
{
  content: List<T>,
  page: int,
  size: int,
  totalElements: long,
  totalPages: int,
  last: boolean
}
```

## ⚠️ Important Notes

1. **Authentication**: 
   - Read operations (GET): No auth required
   - Write operations (POST/PUT/DELETE): Requires `topic:manage` authority

2. **Exam Selection**:
   - User must select Topic first
   - Then load Exams for that Topic
   - Must select an Exam before creating room

3. **Error Handling**:
   - All API calls return `{ success, data, error }` format
   - Check `success` before using `data`
   - Display `error` message to user if `success === false`

4. **Data Consistency**:
   - Backend uses `Long` for IDs → Frontend uses `parseInt()`
   - Backend uses `LocalDateTime` → Frontend gets ISO string
   - Backend uses enums (e.g., `RoomMode`) → Frontend uses strings

## ✅ Checklist

- [x] ExamController endpoints mapped correctly
- [x] Request/Response structures match backend
- [x] Validation rules consistent
- [x] Error handling implemented
- [x] CreateRoomRequest includes examId
- [x] RoomUtils mapping includes examId
- [x] Documentation updated
