const imageToAscii = require("image-to-ascii");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const { MessageMedia } = require("whatsapp-web.js");

function adjustContrast(ctx, width, height, contrast) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        data[i] = truncate(factor * (data[i] - 128) + 128);
        data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128);
        data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128);
    }

    ctx.putImageData(imageData, 0, 0);
}

function truncate(value) {
    return Math.min(255, Math.max(0, value));
}

module.exports.run = async (client, msg, args) => {
    try {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();

            if (media.mimetype && media.mimetype.startsWith('image/')) {
                const buffer = Buffer.from(media.data, 'base64');
                const image = await loadImage(buffer);
                const canvas = createCanvas(image.width, image.height);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                adjustContrast(ctx, image.width, image.height, 50);
                const asciiWidth = Math.floor(image.width / 5);

                imageToAscii(buffer, {
                    size: { width: asciiWidth },
                    colored: false,
                }, async (err, converted) => {
                    if (err) {
                        return;
                    }

                    await msg.reply(converted);

                    // const colorCanvas = createCanvas(asciiWidth * 10, Math.floor(asciiWidth * (image.height / image.width) * 16));
                    // const colorCtx = colorCanvas.getContext("2d");
                    // colorCtx.fillStyle = "#FFFFFF";
                    // colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
                    // colorCtx.font = "16px monospace";
                    // colorCtx.textBaseline = 'top';

                    // const convertedLines = Array.isArray(converted) ? converted : converted.split('\n');
                    // const stepX = image.width / asciiWidth;
                    // const stepY = image.height / (asciiWidth * (image.height / image.width));

                    // convertedLines.forEach((row, rowIndex) => {
                    //     row.split('').forEach((char, colIndex) => {
                    //         const imgX = Math.floor(colIndex * stepX);
                    //         const imgY = Math.floor(rowIndex * stepY);
                    //         const pixelData = ctx.getImageData(imgX, imgY, 1, 1).data;
                    //         const [r, g, b] = pixelData;
                    //         const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                    //         let color;
                    //         if (brightness > 220) {
                    //             color = "#FFFFFF";
                    //         } else {
                    //             color = `rgba(${r}, ${g}, ${b}, 1)`;
                    //         }

                    //         colorCtx.fillStyle = color;
                    //         colorCtx.fillText(char, colIndex * 10, rowIndex * 16);
                    //     });
                    // });

                    // const outputFileNameColor = "ascii_color.jpg";
                    // const bufferColorImage = colorCanvas.toBuffer("image/jpeg");
                    // fs.writeFileSync(outputFileNameColor, bufferColorImage);

                    // const mediaBufferColor = fs.readFileSync(outputFileNameColor);
                    // const mediaMessageColor = new MessageMedia('image/jpeg', mediaBufferColor.toString('base64'), 'ascii_color.jpg');
                    //TODO: verificar inconsistência das cores ao gerar imagem colorida a partir do ASCII
                    // await client.sendMessage(msg.from, mediaMessageColor, { caption: ''}); 
                });
            } else {
                await msg.reply("Por favor, envie uma imagem.");
            }
        } else {
            await msg.reply("Por favor, envie uma imagem.");
        }
    } catch (error) {
        await msg.reply("Ocorreu um erro ao processar sua imagem.");
    }
};
