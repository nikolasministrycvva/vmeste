# 🚀 Подключение Supabase к проекту

## Пошаговая инструкция

### Шаг 1: Получите Connection String из Supabase

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект (или создайте новый)
3. Перейдите в **Settings** → **Database**
4. Прокрутите до раздела **Connection string**
5. Выберите вкладку **URI**
6. Скопируйте connection string (он будет выглядеть так):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

**Важно:** Если вы видите `[YOUR-PASSWORD]`:
- Найдите раздел "Database password" выше на странице
- Если пароля нет, нажмите "Reset database password"
- Скопируйте пароль
- Замените `[YOUR-PASSWORD]` в connection string на реальный пароль

### Шаг 2: Добавьте DATABASE_URL в Vercel

1. Откройте https://vercel.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Найдите переменную `DATABASE_URL` (или создайте новую)
5. Вставьте connection string из Supabase
6. Выберите все окружения (Production, Preview, Development)
7. Нажмите **Save**

**Формат:**
```
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@db.xxxxx.supabase.co:5432/postgres
```

### Шаг 3: Задеплойте проект

После добавления переменной окружения:

1. Перезапустите деплой:
   - Vercel Dashboard → Deployments
   - Найдите последний деплой
   - Нажмите на три точки (⋯) → **Redeploy**

Или закоммитьте и запушьте изменения:

```bash
git add .
git commit -m "Configure Supabase database"
git push
```

### Шаг 4: Создайте таблицы в базе данных

После деплоя откройте в браузере:

```
https://vmestevercel.vercel.app/api/setup-database
```

Или выполните в консоли браузера (F12 → Console):

```javascript
fetch('/api/setup-database')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Результат:', data);
    alert(data.message || '✅ Таблицы созданы!');
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    alert('❌ Ошибка!');
  });
```

### Шаг 5: Заполните базу данных

После успешного создания таблиц откройте:

```
https://vmestevercel.vercel.app/api/seed
```

Или выполните в консоли:

```javascript
fetch('/api/seed')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Результат:', data);
    if (data.message) {
      alert('✅ База данных заполнена! Обновляю страницу...');
      setTimeout(() => location.reload(), 1000);
    }
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
  });
```

### Шаг 6: Проверьте результат

Обновите главную страницу - должны появиться тестовые пользователи!

---

## Локальная разработка

Для локальной разработки создайте файл `.env.local`:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@db.xxxxx.supabase.co:5432/postgres"
```

Затем выполните:

```bash
# Генерация Prisma Client
npm run prisma:generate

# Применение миграций (если нужно)
npm run prisma:migrate:deploy

# Заполнение базы данных
npm run prisma:seed

# Запуск приложения
npm run dev
```

---

## Преимущества Supabase

✅ **Бесплатный план** - 500MB базы данных, 2GB bandwidth  
✅ **Веб-интерфейс** - удобный SQL Editor и Table Editor  
✅ **Автоматические бэкапы** - ежедневные бэкапы базы данных  
✅ **Realtime** - можно добавить realtime подписки (если нужно)  
✅ **Auth** - встроенная аутентификация (можно использовать позже)  

---

## Проверка подключения

После настройки проверьте:

1. **В Supabase Dashboard:**
   - Database → Tables - должны появиться таблицы
   - Database → Editor - можно выполнять SQL запросы

2. **В приложении:**
   - Главная страница должна показывать тестовых пользователей
   - Можно войти как клиент/тренер/админ

---

## Устранение проблем

### Проблема: Не могу подключиться к базе данных

**Решение:**
1. Проверьте, что база данных активна в Supabase Dashboard
2. Проверьте правильность connection string
3. Убедитесь, что пароль правильный
4. Проверьте, что переменная `DATABASE_URL` установлена в Vercel

### Проблема: Таблицы не создаются

**Решение:**
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что endpoint `/api/setup-database` доступен
3. Проверьте права доступа к базе данных в Supabase

### Проблема: Ошибка "connection refused"

**Решение:**
1. Убедитесь, что база данных не приостановлена в Supabase
2. Проверьте, что используете правильный порт (5432 для direct connection)
3. Проверьте firewall настройки в Supabase (Settings → Database → Connection pooling)

---

## Полезные ссылки

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)

