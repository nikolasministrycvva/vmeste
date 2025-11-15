# 🚨 СРОЧНО: Заполните базу данных!

Ошибка 500 возникает потому, что база данных пустая. Нужно заполнить её тестовыми данными.

## ✅ Быстрое решение (2 минуты):

### Шаг 1: Узнайте URL вашего проекта

Откройте Vercel Dashboard → ваш проект → посмотрите URL (например: `https://your-project.vercel.app`)

### Шаг 2: Откройте консоль браузера

1. Откройте ваш сайт на Vercel
2. Нажмите **F12**
3. Перейдите на вкладку **Console**
4. Если появится предупреждение, введите `allow pasting` и нажмите Enter

### Шаг 3: Вставьте и выполните код

**ЗАМЕНИТЕ `YOUR_PROJECT_URL` на реальный URL вашего проекта!**

```javascript
fetch('https://YOUR_PROJECT_URL/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ Успех!', data);
    alert('✅ База данных заполнена! Обновите страницу.');
    location.reload();
  })
  .catch(error => {
    console.error('❌ Ошибка:', error);
    alert('❌ Ошибка! Проверьте консоль.');
  });
```

### Шаг 4: Обновите страницу

После успешного выполнения обновите страницу (F5), и тестовые пользователи должны появиться!

---

## 📝 Пример с реальным URL:

Если ваш проект: `https://vmeste-fitness.vercel.app`, то код будет:

```javascript
fetch('https://vmeste-fitness.vercel.app/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ Успех!', data);
    alert('✅ База данных заполнена! Обновите страницу.');
    location.reload();
  })
  .catch(error => {
    console.error('❌ Ошибка:', error);
    alert('❌ Ошибка! Проверьте консоль.');
  });
```

---

## ❓ Если не работает:

1. **Проверьте URL** - он должен быть правильным
2. **Проверьте логи в Vercel** - Dashboard → Deployments → последний деплой → Functions
3. **Убедитесь, что миграции применены** - проверьте логи деплоя
4. **Проверьте переменные окружения** - должны быть все переменные для базы данных

