# Деплой на Vercel с автоматическими миграциями

## Что будет происходить при деплое:

1. Vercel установит зависимости (`npm install`)
2. Выполнит `prisma generate` (генерирует Prisma Client)
3. Выполнит `prisma migrate deploy` (применит миграции к базе данных)
4. Соберет Next.js приложение (`next build`)
5. Задеплоит приложение

## Шаги для деплоя:

### 1. Убедитесь, что DATABASE_URL настроен на Vercel

1. Откройте https://vercel.com/dashboard
2. Выберите проект `vmestevercel`
3. Перейдите в **Settings** → **Environment Variables**
4. Проверьте, что есть переменная `DATABASE_URL`
5. Если её нет, добавьте:
   - **Name:** `DATABASE_URL`
   - **Value:** ваш connection string из Supabase (из вкладки "URI")
   - **Environment:** Production, Preview, Development (выберите все)
   - Нажмите **Save**

### 2. Закоммитьте и запушьте изменения

```bash
git add .
git commit -m "Switch to PostgreSQL and add automatic migrations"
git push
```

### 3. Дождитесь деплоя

Vercel автоматически начнет деплой после push. Вы можете следить за процессом в Vercel Dashboard.

### 4. После успешного деплоя - заполните базу данных

После того, как деплой завершится успешно, нужно заполнить базу данных тестовыми данными.

**Вариант A: Через API endpoint (проще)**

1. Откройте https://vmestevercel.vercel.app/api/seed
2. Или выполните POST запрос:
   ```bash
   curl -X POST https://vmestevercel.vercel.app/api/seed
   ```

**Вариант B: Через Vercel CLI**

```bash
vercel env pull .env.local
npx prisma db seed
```

### 5. Проверьте результат

1. Откройте https://vmestevercel.vercel.app/
2. Должны отображаться тестовые пользователи
3. Если нет - проверьте логи в Vercel Dashboard

## Если что-то пошло не так:

### Ошибка при деплое:
- Проверьте логи в Vercel Dashboard → Deployments → выберите деплой → Logs
- Убедитесь, что DATABASE_URL правильно настроен
- Проверьте, что база данных активна в Supabase

### Миграции не применились:
- Проверьте логи деплоя
- Убедитесь, что DATABASE_URL доступен из Vercel
- Попробуйте выполнить миграции вручную через Vercel CLI

### База данных не заполнена:
- Используйте API endpoint `/api/seed` для заполнения
- Или выполните seed через Vercel CLI

