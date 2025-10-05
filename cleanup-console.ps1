# PowerShell Script to Remove Console Statements
# Usage: Run from d:\Code\Doan\quizizz-fe-main

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Console Cleanup Script v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcPath = Join-Path $scriptPath "src"

if (-not (Test-Path $srcPath)) {
    Write-Host "❌ Error: src folder not found at $srcPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Scanning: $srcPath" -ForegroundColor Yellow
Write-Host ""

$totalFiles = 0
$cleanedFiles = 0
$totalRemoved = 0

# Get all JS/JSX files
$files = Get-ChildItem -Path $srcPath -Include *.js,*.jsx -Recurse

foreach ($file in $files) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $removedCount = 0

    # Count console statements before removal
    $consoleMatches = [regex]::Matches($content, 'console\.(log|error|warn|info|debug)\([^)]*\);?')
    if ($consoleMatches.Count -eq 0) {
        continue
    }

    # Remove console.log
    $content = $content -replace "console\.log\([^)]*\);?\s*[\r\n]*", ""
    
    # Remove console.error
    $content = $content -replace "console\.error\([^)]*\);?\s*[\r\n]*", ""
    
    # Remove console.warn
    $content = $content -replace "console\.warn\([^)]*\);?\s*[\r\n]*", ""
    
    # Remove console.info
    $content = $content -replace "console\.info\([^)]*\);?\s*[\r\n]*", ""
    
    # Remove console.debug
    $content = $content -replace "console\.debug\([^)]*\);?\s*[\r\n]*", ""

    # Calculate removed count
    $removedCount = $consoleMatches.Count

    # Only save if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        $cleanedFiles++
        $totalRemoved += $removedCount
        
        $relativePath = $file.FullName.Replace($srcPath, "").TrimStart('\')
        Write-Host "✅ $relativePath" -ForegroundColor Green
        Write-Host "   Removed $removedCount console statement(s)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Cleanup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "   Files cleaned: $cleanedFiles" -ForegroundColor Green
Write-Host "   Total console statements removed: $totalRemoved" -ForegroundColor Green
Write-Host ""

if ($cleanedFiles -eq 0) {
    Write-Host "✨ No console statements found. Code is clean!" -ForegroundColor Green
} else {
    Write-Host "✨ Console cleanup successful!" -ForegroundColor Green
}
