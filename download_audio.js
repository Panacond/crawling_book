// Импортируем модуль 'fs' для работы с файловой системой
const fs = require('fs');
// Импортируем 'node-fetch' для имитации fetch API в Node.js.
// Вам нужно будет установить его: npm install node-fetch@2
// (Обратите внимание: для Node.js 18+ и ESM, node-fetch@3+ используется по-другому,
// но для простоты здесь используется старый синтаксис require)
const fetch = require('node-fetch');

const audioUrl = "https://s12.knigavuhe.org/1/audio/4960/01.mp3?1";
const fileName = 'knigavuhe_audio.mp3'; // Имя файла для сохранения на диск

fetch(audioUrl, {
    "headers": {
      "accept": "*/*",
      "accept-language": "ru-RU,ru;q=0.9",
      "cookie": "dpr=1; xdomain_pass=1",
      "Referer": "https://knigavuhe.org/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "method": "GET"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    // В Node.js мы получаем поток данных (stream)
    return response.body;
  })
  .then(body => {
    // Создаем поток для записи файла
    const fileStream = fs.createWriteStream(fileName);
    // Перенаправляем поток данных из ответа в файл
    body.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        console.log(`Файл '${fileName}' успешно сохранен.`);
        resolve();
      });
      fileStream.on('error', err => {
        console.error(`Ошибка при сохранении файла '${fileName}':`, err);
        fs.unlink(fileName, () => {}); // Попытка удалить неполный файл в случае ошибки
        reject(err);
      });
    });
  })
  .catch(e => {
    console.error("Произошла ошибка при скачивании файла:", e);
  });