# 🔄 Socket.IO Migration Script
# Tự động chuyển đổi từ STOMP/WebSocket sang Socket.IO

Write-Host "🚀 Bắt đầu migration sang Socket.IO..." -ForegroundColor Green
Write-Host ""

# Kiểm tra working directory
$projectRoot = "d:\Code\Doan\quizizz-fe-main"
if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Không tìm thấy thư mục project: $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot
Write-Host "📁 Working directory: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Backup
Write-Host "📦 Bước 1: Tạo backup..." -ForegroundColor Yellow
git add . 2>$null
git commit -m "Backup before Socket.IO migration" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup thành công" -ForegroundColor Green
} else {
    Write-Host "⚠️ Không có thay đổi để backup hoặc git chưa khởi tạo" -ForegroundColor Yellow
}
Write-Host ""

# Bước 2: Xóa files cũ (STOMP/WebSocket)
Write-Host "🗑️ Bước 2: Xóa files WebSocket/STOMP cũ..." -ForegroundColor Yellow

$filesToRemove = @(
    "src\services\websocketService.js",
    "src\utils\webSocketManager.js"
)

foreach ($file in $filesToRemove) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  ✅ Đã xóa: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Không tìm thấy: $file" -ForegroundColor Yellow
    }
}
Write-Host ""

# Bước 3: Đổi tên files mới
Write-Host "📝 Bước 3: Kích hoạt files Socket.IO mới..." -ForegroundColor Yellow

$fileRenames = @{
    "src\services\socketService.NEW.js" = "src\services\socketService.js"
    "src\utils\socketManager.NEW.js" = "src\utils\socketManager.js"
    "src\stores\useRoomStore.NEW.js" = "src\stores\useRoomStoreRealtime.js"
}

foreach ($rename in $fileRenames.GetEnumerator()) {
    $sourcePath = Join-Path $projectRoot $rename.Key
    $destPath = Join-Path $projectRoot $rename.Value
    
    if (Test-Path $sourcePath) {
        # Xóa file đích nếu tồn tại
        if (Test-Path $destPath) {
            Remove-Item $destPath -Force
        }
        
        Move-Item $sourcePath $destPath -Force
        Write-Host "  ✅ $($rename.Key) → $($rename.Value)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Không tìm thấy: $($rename.Key)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Bước 4: Cập nhật package.json
Write-Host "📦 Bước 4: Cập nhật package.json..." -ForegroundColor Yellow

$packageJsonPath = Join-Path $projectRoot "package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    
    # Xóa dependencies không cần thiết
    $removedDeps = @()
    if ($packageJson.dependencies.'@stomp/stompjs') {
        $packageJson.dependencies.PSObject.Properties.Remove('@stomp/stompjs')
        $removedDeps += '@stomp/stompjs'
    }
    if ($packageJson.dependencies.'sockjs-client') {
        $packageJson.dependencies.PSObject.Properties.Remove('sockjs-client')
        $removedDeps += 'sockjs-client'
    }
    
    if ($removedDeps.Count -gt 0) {
        # Save updated package.json
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
        Write-Host "  ✅ Đã xóa dependencies: $($removedDeps -join ', ')" -ForegroundColor Green
        
        # Run npm install
        Write-Host "  🔄 Đang chạy npm install..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ npm install thành công" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ npm install gặp lỗi" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ℹ️ Không cần cập nhật package.json" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ❌ Không tìm thấy package.json" -ForegroundColor Red
}
Write-Host ""

# Bước 5: Cập nhật imports trong các files
Write-Host "🔍 Bước 5: Cập nhật imports trong components..." -ForegroundColor Yellow

$filesToUpdate = @(
    "src\hooks\useWebSocketCleanup.js",
    "src\components\room\GameRoom.jsx"
)

$importReplacements = @{
    "import websocketService from" = "import socketService from"
    "import webSocketManager from" = "import socketManager from"
    "websocketService\." = "socketService."
    "webSocketManager\." = "socketManager."
}

$updatedFiles = 0
foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        foreach ($replacement in $importReplacements.GetEnumerator()) {
            $content = $content -replace $replacement.Key, $replacement.Value
        }
        
        if ($content -ne $originalContent) {
            Set-Content $fullPath $content -NoNewline
            Write-Host "  ✅ Đã cập nhật: $file" -ForegroundColor Green
            $updatedFiles++
        }
    }
}

if ($updatedFiles -eq 0) {
    Write-Host "  ℹ️ Không có file nào cần cập nhật" -ForegroundColor Cyan
}
Write-Host ""

# Bước 6: Commit changes
Write-Host "💾 Bước 6: Commit thay đổi..." -ForegroundColor Yellow
git add . 2>$null
git commit -m "Migrate to Socket.IO - Remove STOMP/WebSocket conflicts" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit thành công" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Không có thay đổi để commit hoặc đã commit rồi" -ForegroundColor Yellow
}
Write-Host ""

# Tổng kết
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 MIGRATION HOÀN TẤT!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Checklist tiếp theo:" -ForegroundColor Yellow
Write-Host "  1. ✅ Kiểm tra backend Socket.IO đang chạy (port 9092)"
Write-Host "  2. ✅ Chạy 'npm run dev' để start frontend"
Write-Host "  3. ✅ Mở browser console và kiểm tra kết nối Socket.IO"
Write-Host "  4. ✅ Test các chức năng: tạo phòng, join, real-time updates"
Write-Host ""
Write-Host "🔗 Xem chi tiết: MIGRATION_TO_SOCKETIO.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🐛 Nếu gặp lỗi, rollback bằng:" -ForegroundColor Yellow
Write-Host "  git reset --hard HEAD~1" -ForegroundColor Red
Write-Host ""
