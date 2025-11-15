# Подключение базы данных Vercel Postgres

## Пошаговая инструкция

### Шаг 1: Создайте базу данных PostgreSQL на Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект (или создайте новый, если его нет)
3. В левом меню найдите раздел **Storage** (или **Databases**)
4. Нажмите **Create Database** или **Add Database**
5. Выберите **Postgres**
6. Выберите регион (ближайший к вам, например, `Frankfurt` или `Washington, D.C.`)
7. Выберите план (можно начать с бесплатного **Hobby** плана)
8. Нажмите **Create**

### Шаг 2: Проверьте автоматически созданные переменные окружения

После создания базы данных, Vercel автоматически добавит следующие переменные окружения:

- ✅ `POSTGRES_URL` - для общего использования
- ✅ `POSTGRES_PRISMA_URL` - для Prisma runtime (connection pooling)
- ✅ `POSTGRES_URL_NON_POOLING` - для миграций (прямой connection)
- ✅ `POSTGRES_PASSWORD` - пароль базы данных

**Проверьте:**
1. В настройках проекта перейдите в **Settings** → **Environment Variables**
2. Убедитесь, что все переменные выше присутствуют
3. Проверьте, что они доступны для всех окружений (Production, Preview, Development)

### Шаг 3: Добавьте переменную DATABASE_URL (если её нет)

Для миграций Prisma нужна переменная `DATABASE_URL`:

1. В **Settings** → **Environment Variables**
2. Нажмите **Add New**
3. Добавьте:
   - **Name:** `DATABASE_URL`
   - **Value:** скопируйте значение из `POSTGRES_URL_NON_POOLING`
   - **Environment:** выберите все (Production, Preview, Development)
   - Нажмите **Save**

**Как скопировать значение:**
- Найдите переменную `POSTGRES_URL_NON_POOLING` в списке
- Нажмите на неё, чтобы увидеть значение
- Скопируйте значение (оно будет выглядеть как `postgresql://...`)
- Вставьте в новую переменную `DATABASE_URL`

### Шаг 4: Примените миграции к базе данных

После настройки переменных окружения, миграции применятся автоматически при следующем деплое.

**Вариант A: Через деплой (рекомендуется)**

1. Закоммитьте и запушьте изменения:
   ```bash
   git add .
   git commit -m "Configure Vercel Postgres database"
   git push
   ```

2. Vercel автоматически начнет деплой
3. При деплое выполнится команда `prisma migrate deploy` (из `package.json`)

**Вариант B: Через Vercel CLI (если установлен)**

1. Установите Vercel CLI (если еще не установлен):
   ```bash
   npm install -g vercel
   ```

2. Войдите в Vercel:
   ```bash
   vercel login
   ```

3. Подключите проект:
   ```bash
   vercel link
   ```

4. Скачайте переменные окружения:
   ```bash
   vercel env pull .env.local
   ```

5. Примените миграции:
   ```bash
   npm run prisma:migrate:deploy
   ```

### Шаг 5: Заполните базу данных тестовыми данными

После успешного деплоя и применения миграций:

1. Откройте ваш сайт на Vercel (например, `https://your-project.vercel.app`)
2. Перейдите на страницу: `https://your-project.vercel.app/api/seed`
3. Или выполните POST запрос к этому URL

**Через браузер:**
- Просто откройте URL в браузере (GET запрос тоже работает)

**Через curl (если установлен):**
```bash
curl -X POST https://your-project.vercel.app/api/seed
```

### Шаг 6: Проверьте подключение

1. Откройте главную страницу вашего приложения
2. Должны отображаться тестовые пользователи
3. Попробуйте войти как клиент или тренер
4. Проверьте, что данные сохраняются

## Проверка переменных окружения

Убедитесь, что в Vercel Dashboard → Settings → Environment Variables есть:

- ✅ `POSTGRES_URL`
- ✅ `POSTGRES_PRISMA_URL`
- ✅ `POSTGRES_URL_NON_POOLING`
- ✅ `POSTGRES_PASSWORD`
- ✅ `DATABASE_URL` (равна `POSTGRES_URL_NON_POOLING`)

## Как это работает

- **Миграции:** используют `DATABASE_URL` (который равен `POSTGRES_URL_NON_POOLING`) - прямой connection
- **Runtime (приложение):** использует `POSTGRES_PRISMA_URL` - connection pooling (оптимизировано для Prisma)

Это оптимальная конфигурация для работы с PostgreSQL на Vercel!

## Устранение проблем

### Проблема: Миграции не применяются

**Решение:**
1. Проверьте, что `DATABASE_URL` установлена и равна `POSTGRES_URL_NON_POOLING`
2. Проверьте логи деплоя в Vercel Dashboard
3. Убедитесь, что в `package.json` в скрипте `build` есть `prisma migrate deploy`

### Проблема: Ошибка подключения к базе данных

**Решение:**
1. Проверьте, что все переменные окружения установлены
2. Убедитесь, что база данных создана и активна
3. Проверьте, что переменные доступны для нужного окружения (Production/Preview/Development)

### Проблема: База данных пустая после деплоя

**Решение:**
1. Выполните seed через API endpoint: `https://your-project.vercel.app/api/seed`
2. Или используйте Vercel CLI для локального seed

## Полезные ссылки

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

