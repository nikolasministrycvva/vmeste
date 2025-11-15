// Скопируйте этот код и вставьте в консоль браузера (F12 → Console)
// ЗАМЕНИТЕ YOUR_PROJECT_URL на URL вашего проекта на Vercel
// Например: https://your-project.vercel.app

fetch('https://YOUR_PROJECT_URL/api/seed', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json' 
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ Успех! База данных заполнена!');
    console.log('Ответ сервера:', data);
    alert('✅ База данных успешно заполнена! Обновляю страницу...');
    // Автоматически обновляем страницу через 1 секунду
    setTimeout(() => location.reload(), 1000);
  })
  .catch(error => {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    alert('❌ Ошибка! Проверьте консоль для деталей.');
  });

