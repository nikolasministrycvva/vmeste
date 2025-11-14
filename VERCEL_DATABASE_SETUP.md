# Настройка базы данных Vercel

## Что нужно сделать на Vercel:

### 1. Добавьте переменную DATABASE_URL

1. Откройте https://vercel.com/dashboard
2. Выберите проект `vmestevercel`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте новую переменную:
   - **Name:** `DATABASE_URL`
   - **Value:** скопируйте значение из переменной `POSTGRES_URL_NON_POOLING` (она уже должна быть там)
   - **Environment:** выберите все (Production, Preview, Development)
   - Нажмите **Save**

**Как скопировать значение:**
- Найдите переменную `POSTGRES_URL_NON_POOLING` в списке
- Нажмите на неё, чтобы увидеть значение
- Скопируйте значение
- Вставьте в новую переменную `DATABASE_URL`

### 2. Проверьте, что все переменные на месте

Должны быть:
- ✅ `POSTGRES_URL` (для общего использования)
- ✅ `POSTGRES_PRISMA_URL` (для Prisma runtime - connection pooling)
- ✅ `POSTGRES_URL_NON_POOLING` (для миграций - прямой connection)
- ✅ `POSTGRES_PASSWORD` (пароль базы данных)
- ✅ `DATABASE_URL` (новая - должна быть равна `POSTGRES_URL_NON_POOLING`)

### 3. После настройки переменных

1. Закоммитьте изменения (если еще не закоммитили)
2. Запушьте в репозиторий, к которому подключен Vercel
3. Vercel автоматически начнет деплой
4. При деплое миграции применятся автоматически

### 4. После успешного деплоя

Заполните базу данных тестовыми данными:
- Откройте: https://vmestevercel.vercel.app/api/seed
- Или выполните POST запрос к этому URL

## Как это работает:

- **Миграции:** используют `DATABASE_URL` (который равен `POSTGRES_URL_NON_POOLING`) - прямой connection
- **Runtime (приложение):** использует `POSTGRES_PRISMA_URL` - connection pooling (оптимизировано для Prisma)

Это оптимальная конфигурация для работы с PostgreSQL на Vercel!

