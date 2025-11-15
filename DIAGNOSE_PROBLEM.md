# 🔍 Диагностика проблемы

## Шаг 1: Проверьте, выполнился ли seed скрипт

Откройте консоль браузера (F12 → Console) и выполните:

```javascript
fetch('/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => {
    console.log('Ответ seed:', data);
    if (data.message) {
      alert('✅ Seed выполнен! Обновляю страницу...');
      setTimeout(() => location.reload(), 1000);
    } else {
      alert('❌ Ошибка: ' + JSON.stringify(data));
    }
  })
  .catch(err => {
    console.error('Ошибка:', err);
    alert('❌ Ошибка при выполнении seed!');
  });
```

## Шаг 2: Проверьте API endpoint напрямую

Откройте в браузере (замените URL на ваш):
```
https://YOUR_PROJECT_URL/api/test-users
```

Должен вернуться JSON с пользователями или ошибкой.

## Шаг 3: Проверьте логи в Vercel

1. Откройте Vercel Dashboard
2. Перейдите в ваш проект
3. Откройте **Deployments** → последний деплой
4. Нажмите на **Functions** или **Logs**
5. Найдите ошибки, связанные с базой данных

## Шаг 4: Проверьте переменные окружения

В Vercel Dashboard → Settings → Environment Variables должны быть:
- ✅ `POSTGRES_URL`
- ✅ `POSTGRES_PRISMA_URL`
- ✅ `POSTGRES_URL_NON_POOLING`
- ✅ `POSTGRES_PASSWORD`
- ✅ `DATABASE_URL` (равна `POSTGRES_URL_NON_POOLING`)

## Шаг 5: Проверьте, применены ли миграции

В логах деплоя должна быть строка:
```
Running "prisma migrate deploy"
```

Если миграции не применились, перезапустите деплой.

