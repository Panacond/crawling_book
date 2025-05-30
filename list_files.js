// Import the 'fs' module for file system operations
const fs = require('fs');
// Import 'node-fetch' to use fetch API in Node.js
// Make sure you've installed it: npm install node-fetch@2
const fetch = require('node-fetch');

const baseUrl = "https://s12.knigavuhe.org/1/audio/4960/";
const outputDir = "./audio_downloads/"; // Directory to save files

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadAudioSeries() {
    for (let i = 1; i <= 66; i++) {
        // Format the number with a leading zero if it's a single digit
        const fileNumber = String(i).padStart(2, '0'); // '1' becomes '01', '10' stays '10'
        const filename = `${fileNumber}.mp3`;
        const fileUrl = `${baseUrl}${filename}?1`; // Construct the full URL
        const outputPath = `${outputDir}${filename}`; // Full path for saving

        console.log(`Attempting to download: ${fileUrl} to ${outputPath}`);

        try {
            const response = await fetch(fileUrl, {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "ru-RU,ru;q=0.9",
                  "cookie": "dpr=1; xdomain_pass=1", // Keep these if they're essential
                  "Referer": "https://knigavuhe.org/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "method": "GET"
            });

            if (!response.ok) {
                // If a file is not found (e.g., 404), we log an error but continue the loop
                if (response.status === 404) {
                    console.warn(`File not found: ${fileUrl}. Skipping.`);
                } else {
                    throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText} for ${fileUrl}`);
                }
                continue; // Move to the next iteration
            }

            // Create a write stream to save the file
            const fileStream = fs.createWriteStream(outputPath);
            // Pipe the response body stream directly into the file stream
            response.body.pipe(fileStream);

            await new Promise((resolve, reject) => {
                fileStream.on('finish', () => {
                    console.log(`Successfully downloaded: ${filename}`);
                    resolve();
                });
                fileStream.on('error', err => {
                    console.error(`Error saving ${filename}:`, err);
                    fs.unlink(outputPath, () => {}); // Try to delete incomplete file
                    reject(err);
                });
            });

        } catch (error) {
            console.error(`Failed to download ${filename}:`, error);
        }
    }
    console.log("Download series finished.");
}

// Start the download process
downloadAudioSeries();