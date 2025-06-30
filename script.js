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
            
            // ================================================================ //
            //      ↓↓↓  ЭТО НОВЫЙ КОД, КОТОРЫЙ ОТПРАВЛЯЕТ ДАННЫЕ  ↓↓↓         //
            //                                                                  //
            const voteData = { userId, voteOption };

            // Отправляем данные на наш серверный обработчик
            fetch('/api/vote', { // Vercel поймет, что это нужно отправить на вашу serverless-функцию
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(voteData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Успех! Показываем сообщение и закрываемся
                    voteForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    tg.MainButton.setText('Голос учтён!');
                    tg.MainButton.show();
                    setTimeout(() => tg.close(), 3000);
                } else {
                    // Ошибка (например, уже голосовал)
                    alert(data.message || 'Произошла ошибка');
                    tg.close(); // Закрываем в любом случае
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert('Не удалось отправить голос. Проверьте интернет-соединение.');
                tg.close();
            });
            //                                                                  //
            //      ↑↑↑               КОНЕЦ НОВОГО КОДА                ↑↑↑    //
            // ================================================================ //
        });
    });
});
