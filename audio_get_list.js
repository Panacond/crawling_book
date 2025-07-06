const fetch = require("node-fetch"); // Для Node.js
const { JSDOM } = require("jsdom"); // Импортируем JSDOM
const fs = require("fs"); // Импортируем модуль fs для работы с файловой системой
const path = require("path"); // Импортируем модуль path для работы с путями файлов

// --- Глобальные настройки (вам нужно будет их настроить) ---
// Базовый URL для аудиофайлов.
// Внимание: Этот URL должен быть правильным для загрузки аудио.
// Если на сайте knigavuhe.org аудиофайлы находятся по другому пути,
// вам нужно будет его выяснить (например, через инструменты разработчика в браузере).
const pageUrl = "https://knigavuhe.org/book/zhanna-d039ark/"; // URL страницы с названиями
const audioBaseUrl = "https://s12.knigavuhe.org/1/audio/2500/"; // ПРИМЕР! ЗАМЕНИТЕ НА РЕАЛЬНЫЙ URL АУДИОФАЙЛОВ!

// Директория для сохранения загруженных аудиофайлов
const outputDir = "./downloaded_audio/";

// --- Функция для получения текстового содержимого с URL ---
async function getTextContentFromUrl(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: статус ${response.status}`);
    }

    const htmlText = await response.text();

    const dom = new JSDOM(htmlText);
    const doc = dom.window.document;

    const elements = doc.querySelectorAll(
      ".book_playlist_item_name.--text-overflow"
    );

    const textContents = [];
    elements.forEach((element) => {
      element = element.textContent.trim();
      element = element.toLowerCase();
      element = element.replace(/_/g, "-");
      textContents.push(element);
    });

    return textContents;
  } catch (error) {
    console.error(
      "Произошла ошибка при получении или обработке страницы:",
      error
    );
    return [];
  }
}

// --- Функция для загрузки аудиофайла ---
async function load_audio(audioFilenameBase) {
  // Убедимся, что директория для сохранения существует
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filename = `${audioFilenameBase}.mp3`;
  const fileUrl = `${audioBaseUrl}${filename}?1`; // Конструируем полный URL
  const outputPath = path.join(outputDir, filename); // Полный путь для сохранения

  console.log(`Попытка загрузить: ${fileUrl} в ${outputPath}`);

  try {
    const response = await fetch(fileUrl, {
      headers: {
        accept: "*/*",
        "accept-language": "ru-RU,ru;q=0.9",
        cookie: "dpr=1; xdomain_pass=1", // Сохраняйте эти заголовки, если они необходимы
        Referer: "https://knigavuhe.org/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Файл не найден: ${fileUrl}. Пропускаем.`);
        return; // Просто выходим из функции, если файл не найден
      } else {
        throw new Error(
          `Ошибка HTTP! Статус: ${response.status} - ${response.statusText} для ${fileUrl}`
        );
      }
    }

    // Создаем поток для записи файла
    const fileStream = fs.createWriteStream(outputPath);
    // Перенаправляем тело ответа (поток) напрямую в файловый поток
    response.body.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on("finish", () => {
        console.log(`Успешно загружено: ${filename}`);
        resolve();
      });
      fileStream.on("error", (err) => {
        console.error(`Ошибка при сохранении ${filename}:`, err);
        fs.unlink(outputPath, () => {}); // Пытаемся удалить неполный файл
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Не удалось загрузить ${filename}:`, error);
  }
}

// --- Основная логика выполнения ---
async function main() {
  const titles = await getTextContentFromUrl(pageUrl);

  if (titles.length > 0) {
    console.log("Найденные названия:");
    // Используем цикл for...of для последовательной загрузки
    for (const title of titles) {
      console.log(`Обрабатывается название: ${title}`);
      // Передаем название как основу для имени файла
      await load_audio(title);
    }
    console.log("Download series finished.");
  } else {
    console.log(
      "Элементы с указанным классом не найдены или произошла ошибка при получении страницы."
    );
  }
}

// Запускаем основную функцию
main();
