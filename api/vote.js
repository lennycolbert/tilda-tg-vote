import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // Разрешаем запросы с любого источника (для простоты)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests allowed' });
    }

    try {
        const { userId, voteOption } = request.body;

        if (!userId || !voteOption) {
            return response.status(400).json({ error: 'Missing userId or voteOption' });
        }

        // --- ГЛАВНАЯ ЛОГИКА ЗАЩИТЫ ОТ НАКРУТОК ---
        // Пытаемся получить запись о голосе по ID пользователя
        const hasVoted = await kv.get(`vote:${userId}`);

        if (hasVoted) {
            // Если запись есть - пользователь уже голосовал
            return response.status(409).json({ message: 'Вы уже голосовали!' });
        }

        // Если не голосовал - сохраняем его голос в базу (ключ - ID, значение - его выбор)
        await kv.set(`vote:${userId}`, voteOption);
        // Также увеличиваем общий счетчик для варианта, за который проголосовали
        await kv.incr(`count:${voteOption}`);

        return response.status(200).json({ success: true, message: 'Голос успешно засчитан!' });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Server error' });
    }
}
