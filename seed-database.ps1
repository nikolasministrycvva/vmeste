# Скрипт для заполнения базы данных через API
# Замените YOUR_PROJECT_URL на URL вашего проекта на Vercel

$url = "https://YOUR_PROJECT_URL/api/seed"

Write-Host "🌱 Заполнение базы данных..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json"
    
    Write-Host "✅ База данных успешно заполнена!" -ForegroundColor Green
    Write-Host "Ответ сервера:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Ошибка при заполнении базы данных:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

