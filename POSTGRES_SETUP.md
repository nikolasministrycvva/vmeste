# Настройка PostgreSQL - Пошаговая инструкция

## Шаг 1: Получите DATABASE_URL из Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Найдите переменную `DATABASE_URL`
5. Скопируйте её значение

## Шаг 2: Создайте файл .env.local

Создайте файл `.env.local` в корне проекта (рядом с `package.json`):

```env
DATABASE_URL="ваш_connection_string_из_vercel"
```

**Важно:** Файл `.env.local` уже в `.gitignore`, так что он не попадет в git.

## Шаг 3: Установите зависимости (если еще не установлены)

```bash
npm install
```

Если возникнет ошибка с Prisma Client - это нормально, продолжите дальше.

## Шаг 4: Создайте миграцию для PostgreSQL

```bash
npx prisma migrate dev --name init_postgres
```

Эта команда:
- Создаст новую миграцию для PostgreSQL
- Применит её к вашей базе данных на Vercel
- Сгенерирует Prisma Client

## Шаг 5: Заполните базу данных тестовыми данными

```bash
npx prisma db seed
```

Эта команда создаст:
- 1 администратора
- 1 клиента
- 3 тренеров (Anna, Max, Olga)
- 3 типа тренировок

## Шаг 6: Проверьте, что всё работает

1. Откройте https://vmestevercel.vercel.app/
2. Должны отображаться тестовые пользователи

## Альтернативный способ: Через Vercel CLI

Если у вас установлен Vercel CLI:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Получите переменные окружения
vercel env pull .env.local

# Создайте и примените миграцию
npx prisma migrate dev --name init_postgres

# Заполните базу данных
npx prisma db seed
```

## Если что-то пошло не так

### Ошибка подключения к базе данных
- Проверьте, что `DATABASE_URL` правильный
- Убедитесь, что база данных создана на Vercel
- Проверьте, что база данных не заблокирована

### Ошибка при создании миграции
- Убедитесь, что база данных пустая (или удалите старые таблицы)
- Или используйте `npx prisma migrate reset` (ОСТОРОЖНО: удалит все данные!)

### База данных уже содержит таблицы
Если база данных уже содержит таблицы от SQLite, нужно их удалить или использовать:

```bash
npx prisma migrate reset
```

Это удалит все данные и создаст схему заново.

## После успешной настройки

1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "Add PostgreSQL migration"
   git push
   ```

2. Vercel автоматически применит миграции при следующем деплое (благодаря скрипту build в package.json)

3. После деплоя проверьте, что приложение работает на https://vmestevercel.vercel.app/

