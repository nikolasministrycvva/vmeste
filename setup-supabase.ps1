# Скрипт для настройки Supabase базы данных
# Запустите: .\setup-supabase.ps1

Write-Host "🔧 Настройка базы данных Supabase..." -ForegroundColor Cyan

# Проверка наличия .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Файл .env.local не найден!" -ForegroundColor Red
    Write-Host "Создайте файл .env.local с DATABASE_URL из Supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Файл .env.local найден" -ForegroundColor Green

# Генерация Prisma Client
Write-Host "`n📦 Генерация Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Создание и применение миграции
Write-Host "`n🗄️  Создание миграции для PostgreSQL..." -ForegroundColor Cyan
npx prisma migrate dev --name init_postgres

# Заполнение базы данных
Write-Host "`n🌱 Заполнение базы данных тестовыми данными..." -ForegroundColor Cyan
npx prisma db seed

Write-Host "`n✅ Готово! База данных настроена." -ForegroundColor Green
Write-Host "Теперь можно запустить: npm run dev" -ForegroundColor Yellow

