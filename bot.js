const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const token = '7877300862:AAE-OojmrmnTQP-OU8H1-MOrxYz0ZhCWgu0';
const removeBgApiKey = 'drJ1HfzTLhAMDYrBk8E8V49e';


const bot = new TelegramBot(token, { polling: true });

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.photo[msg.photo.length - 1].file_id;

    // Получаем URL изображения
    const fileLink = await bot.getFileLink(fileId);

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.remove.bg/v1.0/removebg',
            headers: {
                'X-Api-Key': removeBgApiKey,
            },
            responseType: 'arraybuffer', // Получаем изображение как массив байтов
            data: {
                image_url: fileLink,
                size: 'auto',
            },
        });

        // Сохраняем изображение без фона
        const outputPath = `output_${chatId}.png`;
        fs.writeFileSync(outputPath, response.data);

        // Отправляем пользователю изображение без фона
        await bot.sendPhoto(chatId, outputPath);

        // Удаляем временный файл
        fs.unlinkSync(outputPath);
    } catch (error) {
        console.error('Ошибка при обработке изображения:', error.message);
        await bot.sendMessage(chatId, 'Не удалось удалить фон с изображения.');
    }
});

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = "Привет! Отправь мне любое изображение, и я удалю его фон!";
    bot.sendMessage(chatId, welcomeMessage);
});
bot.on('polling_error', (error) => {
    console.error('Ошибка опроса:', error.code, error.message); // Логируем ошибку
});
