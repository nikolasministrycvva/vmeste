# Как заполнить базу данных после деплоя

## 🚀 Самый простой способ (через браузер)

### Вариант A: Если SEED_SECRET не установлен

1. Откройте ваш сайт на Vercel (например: `https://your-project.vercel.app`)
2. Нажмите **F12** для открытия DevTools
3. Перейдите на вкладку **Console**
4. Вставьте и выполните этот код (замените `YOUR_PROJECT_URL` на ваш URL):

```javascript
fetch('https://YOUR_PROJECT_URL/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Успех!', data);
    alert('База данных заполнена!');
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    alert('Ошибка! Проверьте консоль.');
  });
```

### Вариант B: Если SEED_SECRET установлен

1. Узнайте значение `SEED_SECRET` из Vercel Dashboard → Settings → Environment Variables
2. Выполните код выше, но добавьте заголовок авторизации:

```javascript
fetch('https://YOUR_PROJECT_URL/api/seed', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SEED_SECRET'
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Успех!', data);
    alert('База данных заполнена!');
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    alert('Ошибка! Проверьте консоль.');
  });
```

## 💻 Через PowerShell (Windows)

1. Откройте PowerShell в папке проекта
2. Отредактируйте файл `seed-database.ps1` (замените `YOUR_PROJECT_URL`)
3. Выполните:

```powershell
.\seed-database.ps1
```

Или выполните команду напрямую:

```powershell
$url = "https://YOUR_PROJECT_URL/api/seed"
Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json"
```

## 🌐 Через онлайн-инструменты

Можно использовать онлайн-сервисы для отправки POST запросов:
- https://reqbin.com/
- https://www.postman.com/ (требует установки)

**Настройки запроса:**
- Method: `POST`
- URL: `https://YOUR_PROJECT_URL/api/seed`
- Headers: `Content-Type: application/json`
- Если есть SEED_SECRET, добавьте: `Authorization: Bearer YOUR_SEED_SECRET`

## ✅ Что будет создано

После успешного выполнения seed скрипта в базе данных будут:

- **1 администратор** (Admin)
- **1 клиент** (Client 1)
- **3 тренера** (Anna, Max, Olga)
- **3 типа тренировок** (Functional, Strength, Stretching)

## 🔍 Проверка результата

После заполнения базы данных:

1. Откройте главную страницу вашего сайта
2. Должны отображаться тестовые пользователи
3. Попробуйте войти как клиент или тренер

## ❓ Проблемы?

### Ошибка 401 (Unauthorized)
- Установлен `SEED_SECRET`, но вы не передали заголовок авторизации
- Решение: добавьте заголовок `Authorization: Bearer YOUR_SEED_SECRET`

### Ошибка 500 (Internal Server Error)
- Проверьте логи в Vercel Dashboard → Deployments → последний деплой → Functions
- Убедитесь, что миграции применены успешно
- Проверьте, что переменные окружения настроены правильно

### База данных пустая после seed
- Проверьте, что seed скрипт выполнился успешно
- Проверьте логи в консоли браузера или ответ сервера
- Убедитесь, что подключение к базе данных работает

