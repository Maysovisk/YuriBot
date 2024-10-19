const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');

module.exports.run = async (client, msg, args) => {
    try {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            const imageBuffer = Buffer.from(media.data, 'base64');

            const stickerBuffer = await sharp(imageBuffer)
                .resize(512, 512) 
                .toFormat('webp')
                .toBuffer();

            const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));
            await client.sendMessage(msg.from, stickerMedia, { sendMediaAsSticker: true });
        } else {
            await msg.reply("Por favor, envie uma imagem.");
        }
    } catch (error) {
        await msg.reply("Ocorreu um erro ao processar sua imagem. Tente novamente.");
    }
};
