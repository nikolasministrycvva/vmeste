# ⚡ Быстрая настройка Supabase (5 минут)

## 🎯 Что нужно сделать

### 1️⃣ Получите Connection String

1. Откройте https://supabase.com/dashboard
2. Ваш проект → **Settings** → **Database**
3. Прокрутите до **Connection string** → вкладка **URI**
4. Скопируйте строку (замените `[YOUR-PASSWORD]` на реальный пароль)

### 2️⃣ Добавьте в Vercel

1. https://vercel.com/dashboard → ваш проект
2. **Settings** → **Environment Variables**
3. Найдите или создайте `DATABASE_URL`
4. Вставьте connection string из Supabase
5. Выберите все окружения → **Save**

### 3️⃣ Перезапустите деплой

Vercel Dashboard → Deployments → последний деплой → **Redeploy**

### 4️⃣ Создайте таблицы

Откройте в браузере:
```
https://vmestevercel.vercel.app/api/setup-database
```

### 5️⃣ Заполните базу данных

Откройте в браузере:
```
https://vmestevercel.vercel.app/api/seed
```

### 6️⃣ Готово! ✅

Обновите главную страницу - должны появиться пользователи!

---

## 📝 Формат Connection String

```
DATABASE_URL=postgresql://postgres:ПАРОЛЬ@db.xxxxx.supabase.co:5432/postgres
```

---

## ❓ Проблемы?

Смотрите подробную инструкцию в `SUPABASE_SETUP.md`

