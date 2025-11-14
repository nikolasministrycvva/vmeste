# Проверка подключения к Supabase

## Проблема: Не удается подключиться к базе данных

### Решение 1: Проверьте настройки базы данных в Supabase

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **Database**
4. Убедитесь, что база данных **активна** (Status: Active)

### Решение 2: Используйте правильный Connection String

В Supabase есть два типа connection strings:

#### Вариант A: Direct Connection (для миграций)
```
postgresql://postgres:[PASSWORD]@db.jpuysnakxddrctcerzhc.supabase.co:5432/postgres
```

#### Вариант B: Connection Pooling (для приложения)
```
postgresql://postgres.jpuysnakxddrctcerzhc:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Для миграций Prisma используйте Direct Connection (порт 5432)**

### Решение 3: Проверьте формат в .env.local

Убедитесь, что файл `.env.local` содержит:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@db.jpuysnakxddrctcerzhc.supabase.co:5432/postgres"
```

**Важно:**
- Пароль должен быть в кавычках, если содержит специальные символы
- Не должно быть пробелов вокруг `=`
- Используйте прямые кавычки `"`, не кавычки-елочки

### Решение 4: Получите Connection String из Supabase

1. Откройте https://supabase.com/dashboard
2. Выберите проект
3. **Settings** → **Database**
4. Прокрутите до раздела **Connection string**
5. Выберите вкладку **URI**
6. Скопируйте строку (она уже содержит пароль)
7. Вставьте в `.env.local` как:
   ```env
   DATABASE_URL="скопированная_строка"
   ```

### Решение 5: Проверьте пароль

Если пароль содержит специальные символы, их нужно URL-encode:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- и т.д.

Или просто скопируйте готовый connection string из Supabase - он уже правильно закодирован.

### Тест подключения

После обновления `.env.local`, попробуйте снова:

```bash
npx prisma migrate dev --name init_postgres
```

Если все еще не работает, проверьте логи в Supabase Dashboard → Logs → Database.

