// Скопируйте и вставьте этот код в консоль браузера (F12 → Console)
// Замените YOUR_PROJECT_URL на URL вашего проекта на Vercel

fetch('https://YOUR_PROJECT_URL/api/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ Успех!', data);
    alert('База данных успешно заполнена!');
  })
  .catch(error => {
    console.error('❌ Ошибка:', error);
    alert('Ошибка при заполнении базы данных. Проверьте консоль.');
  });

