# 🚀 Быстрая настройка базы данных

## Простое решение (3 шага)

### Шаг 1: Задеплойте изменения

Закоммитьте и запушьте изменения:

```bash
git add .
git commit -m "Add database setup endpoint"
git push
```

### Шаг 2: Создайте таблицы в базе данных

После деплоя откройте в браузере (замените URL на ваш):

```
https://vmestevercel.vercel.app/api/setup-database
```

Или выполните в консоли браузера (F12 → Console):

```javascript
fetch('/api/setup-database')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Результат:', data);
    if (data.message) {
      alert('✅ Таблицы созданы! Теперь заполните базу данных.');
    } else {
      alert('❌ Ошибка: ' + JSON.stringify(data));
    }
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    alert('❌ Ошибка при создании таблиц!');
  });
```

### Шаг 3: Заполните базу данных

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
    } else {
      alert('❌ Ошибка: ' + JSON.stringify(data));
    }
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    alert('❌ Ошибка при заполнении базы данных!');
  });
```

### Шаг 4: Проверьте результат

Обновите главную страницу - должны появиться тестовые пользователи!

---

## Что делает setup-database endpoint?

1. Создает все необходимые таблицы в PostgreSQL базе данных
2. Настраивает связи между таблицами (foreign keys)
3. Создает индексы для оптимизации

## Что делает seed endpoint?

1. Создает тестовых пользователей (Admin, Client, Trainers)
2. Создает типы тренировок
3. Готовит базу данных для работы приложения

---

## Если что-то не работает

1. **Проверьте логи в Vercel Dashboard**:
   - Deployments → последний деплой → Functions
   - Найдите ошибки

2. **Проверьте переменные окружения**:
   - Settings → Environment Variables
   - Должны быть все переменные для PostgreSQL

3. **Попробуйте выполнить команды по очереди**:
   - Сначала `/api/setup-database`
   - Потом `/api/seed`

---

## После успешной настройки

После того, как всё заработает, можно удалить endpoint `/api/setup-database` для безопасности (или защитить его паролем).

