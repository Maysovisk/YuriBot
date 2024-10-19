const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');

module.exports.run = async (client, msg, args) => {
    if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const data = await searchImage(media);

        if (data && data.result && data.result.length > 0) {
            const animeData = data.result[0];
            const caption = [
                `*Anime:* ${animeData.filename}`,
                `*Episódio:* ${animeData.episode}`,
                `*Similaridade:* ${(animeData.similarity * 100).toFixed(2)}%`,
                `*Link do vídeo:* ${animeData.video}`
            ].join('\n');
            
            await client.sendMessage(msg.from, media, { caption });
        }
    } else {
        await msg.reply("Por favor, envie uma imagem.");
    }
};

async function searchImage(media) {
    try {
        const imageBuffer = Buffer.from(media.data, 'base64');

        const response = await fetch("https://api.trace.moe/search", {
            method: "POST",
            body: imageBuffer,
            headers: { "Content-Type": "image/jpeg" },
        });

        if (!response.ok) {
            throw new Error(`error. status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
