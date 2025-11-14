# Настройка базы данных для Vercel

## Проблема
SQLite не работает на Vercel, так как файловая система read-only. Нужно использовать PostgreSQL.

## Решение

### 1. Создайте базу данных PostgreSQL на Vercel

1. Зайдите в ваш проект на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в раздел **Storage**
3. Нажмите **Create Database**
4. Выберите **Postgres**
5. Создайте базу данных (можно использовать бесплатный план)
6. После создания, Vercel автоматически добавит переменную окружения `DATABASE_URL` в ваш проект

### 2. Настройте переменные окружения

Vercel автоматически добавит `DATABASE_URL` после создания базы данных. Проверьте в настройках проекта:
- Settings → Environment Variables
- Должна быть переменная `DATABASE_URL`

### 3. Создайте миграцию для PostgreSQL

Выполните локально (если у вас установлен PostgreSQL) или используйте Vercel CLI:

```bash
# Установите зависимости
npm install

# Создайте миграцию (если нужно)
npx prisma migrate dev --name init_postgres

# Или примените существующие миграции
npx prisma migrate deploy
```

### 4. Заполните базу данных тестовыми данными

После деплоя на Vercel, выполните seed через Vercel CLI или создайте API endpoint для seed:

```bash
# Через Vercel CLI
vercel env pull .env.local
npx prisma db seed
```

### 5. Деплой на Vercel

После настройки базы данных:

```bash
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push
```

Vercel автоматически:
1. Установит зависимости
2. Выполнит `prisma generate`
3. Выполнит `prisma migrate deploy` (в build скрипте)
4. Соберет приложение

### 6. Заполнение базы данных на продакшене

После первого деплоя, нужно заполнить базу данных. Есть два варианта:

#### Вариант A: Через Vercel CLI
```bash
vercel env pull .env.local
npx prisma db seed
```

#### Вариант B: Создать API endpoint для seed (только для первого запуска)
Создайте файл `app/api/seed/route.ts` (только для первого запуска, потом удалите):

```typescript
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  // Добавьте проверку секретного ключа для безопасности
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await execAsync('npx prisma db seed')
    return NextResponse.json({ message: 'Database seeded successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
```

## Локальная разработка

Для локальной разработки у вас есть два варианта:

### Вариант 1: Использовать локальный PostgreSQL
1. Установите PostgreSQL локально
2. Создайте базу данных
3. Создайте файл `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

### Вариант 2: Использовать облачный PostgreSQL (Neon, Supabase)
1. Создайте бесплатную базу данных на [Neon](https://neon.tech) или [Supabase](https://supabase.com)
2. Скопируйте connection string
3. Создайте файл `.env.local`:
   ```
   DATABASE_URL="your-connection-string"
   ```

## Проверка

После настройки:
1. Откройте https://vmestevercel.vercel.app/
2. Должны отображаться тестовые пользователи
3. Если нет - проверьте логи на Vercel Dashboard

