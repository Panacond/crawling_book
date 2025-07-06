const { Downloader } = require('ytdl-mp3');

async function main() {
  const downloader = new Downloader({
    getTags: true
  });
  await downloader.downloadSong('https://www.youtube.com/watch?v=NwuV3W4oFVU');
}

main();