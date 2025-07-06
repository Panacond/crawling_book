const fetch = require('node-fetch'); // Для Node.js
const { JSDOM } = require('jsdom'); // Импортируем JSDOM

async function getTextContentFromUrl(url) {
    try {
        // 1. Запрашиваем HTML-содержимое страницы
        const response = await fetch(url);

        // Проверяем, что запрос прошел успешно
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: статус ${response.status}`);
        }

        // Получаем текст страницы
        const htmlText = await response.text();

        // 2. Создаем виртуальный DOM с помощью JSDOM
        // Это и есть замена DOMParser. JSDOM парсит HTMLText и возвращает объект JSDOM.
        const dom = new JSDOM(htmlText);
        // Теперь вы можете получить доступ к 'document' через 'dom.window.document'
        const doc = dom.window.document;

        // 3. Получаем все элементы с нужным классом
        const elements = doc.querySelectorAll('.book_playlist_item_name.--text-overflow');

        // 4. Собираем текстовое содержимое всех найденных элементов в массив
        const textContents = [];
        elements.forEach(element => {
            textContents.push(element.textContent.trim()); // .trim() убирает лишние пробелы
        });

        return textContents; // Возвращаем массив текстовых содержимых

    } catch (error) {
        console.error('Произошла ошибка при получении или обработке страницы:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

// --- Как использовать эту функцию ---

// Пример 1: Получаем и выводим содержимое
// Убедитесь, что URL верный и содержит элементы с этим классом
getTextContentFromUrl('https://knigavuhe.org/book/rasskazy-152/')
    .then(data => {
        if (data.length > 0) {
            console.log('Найденные элементы:');
            data.forEach(item => console.log(item));
        } else {
            console.log('Элементы с указанным классом не найдены или произошла ошибка.');
        }
    });