document.addEventListener('DOMContentLoaded', function() {
    // 1. Инициализируем Web App
    let tg = window.Telegram.WebApp;
    tg.expand(); // Растягиваем приложение на весь экран

    const voteForm = document.getElementById('vote-form');
    const successMessage = document.getElementById('success-message');

    // 2. Находим все наши кнопки для голосования
    const buttons = document.querySelectorAll('.vote-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Получаем ID пользователя из Telegram. Это ключ к защите от накруток.
            const user = tg.initDataUnsafe?.user;
            if (!user) {
                alert('Не удалось получить данные пользователя. Попробуйте открыть со смартфона.');
                return;
            }

            const voteOption = this.id; // id кнопки (например, "option1")
            const userId = user.id;

            console.log('User ID:', userId, 'Voted for:', voteOption);
            
            // --- СЮДА МЫ ПОЗЖЕ ДОБАВИМ ОТПРАВКУ ДАННЫХ НА СЕРВЕР ---
            // Пока что просто показываем сообщение об успехе
            
            voteForm.style.display = 'none';
            successMessage.style.display = 'block';

            // Говорим Telegram, что можно показать кнопку "Закрыть"
            tg.MainButton.setText('Голос учтён!');
            tg.MainButton.show();
            
            // Через 3 секунды закрываем Web App
            setTimeout(() => {
                tg.close();
            }, 3000);
        });
    });
});