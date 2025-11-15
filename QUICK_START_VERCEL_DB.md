# Быстрый старт: Подключение Vercel Postgres

## 🚀 Что нужно сделать (5 шагов)

### 1️⃣ Создайте базу данных на Vercel

1. Откройте https://vercel.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Storage** (в левом меню)
4. Нажмите **Create Database** → выберите **Postgres**
5. Выберите регион и план (можно бесплатный Hobby)
6. Нажмите **Create**

### 2️⃣ Проверьте переменные окружения

После создания базы Vercel автоматически добавит:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_PASSWORD`

**Проверьте:** Settings → Environment Variables

### 3️⃣ Добавьте DATABASE_URL

1. В **Settings** → **Environment Variables**
2. Нажмите **Add New**
3. **Name:** `DATABASE_URL`
4. **Value:** скопируйте значение из `POSTGRES_URL_NON_POOLING`
5. **Environment:** выберите все (Production, Preview, Development)
6. Нажмите **Save**

### 4️⃣ Задеплойте проект

```bash
git add .
git commit -m "Connect Vercel Postgres database"
git push
```

Vercel автоматически:
- Применит миграции (`prisma migrate deploy`)
- Соберет приложение
- Задеплоит

### 5️⃣ Заполните базу данных

После успешного деплоя откройте в браузере:
```
https://your-project.vercel.app/api/seed
```

Готово! ✅

## 📋 Чек-лист

- [ ] База данных создана на Vercel
- [ ] Переменные окружения автоматически добавлены
- [ ] `DATABASE_URL` добавлена вручную (равна `POSTGRES_URL_NON_POOLING`)
- [ ] Проект задеплоен
- [ ] База данных заполнена через `/api/seed`

## ❓ Проблемы?

Смотрите подробную инструкцию в `VERCEL_DB_CONNECTION.md`

