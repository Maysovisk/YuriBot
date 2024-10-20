const imageToAscii = require("image-to-ascii");
const { createCanvas } = require("canvas");
const fs = require("fs");
const { MessageMedia } = require("whatsapp-web.js");

module.exports.run = async (client, msg, args) => {
    try {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();

            if (media.mimetype && media.mimetype.startsWith('image/')) {
                const buffer = Buffer.from(media.data, 'base64');

                imageToAscii(buffer, {
                    bg: true,
                    fg: true,
                    colored: true,
                    concat: false,
                    pixel: '░',
                    size: { width: 200, height: 100 }
                }, async (err, converted) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    var snip = "YuriBot!";
                    let snipLength = snip.length;
                    var i = 0;

                    const ansiColorMap = {
                        '30': '#000000',
                        '31': '#FF0000',
                        '32': '#00FF00',
                        '33': '#FFFF00',
                        '34': '#0000FF',
                        '35': '#FF00FF',
                        '36': '#00FFFF',
                        '37': '#FFFFFF',
                        '90': '#7F7F7F',
                        '91': '#FF7F7F',
                        '92': '#7FFF7F',
                        '93': '#FFFF7F',
                        '94': '#7F7FFF',
                        '95': '#FF7FFF',
                        '96': '#7FFFFF',
                        '97': '#FFFFFF',
                        '40': '#000000',
                        '41': '#FF0000',
                        '42': '#00FF00',
                        '43': '#FFFF00',
                        '44': '#0000FF',
                        '45': '#FF00FF',
                        '46': '#00FFFF',
                        '47': '#FFFFFF',
                        '100': '#7F7F7F',
                        '101': '#FF7F7F',
                        '102': '#7FFF7F',
                        '103': '#FFFF7F',
                        '104': '#7F7FFF',
                        '105': '#FF7FFF',
                        '106': '#7FFFFF',
                        '107': '#FFFFFF',
                        '101': '#FFE0BD',
                        '102': '#FFCC99',
                        '103': '#FF9966',
                        '104': '#FEF5EC',
                        '0': '#000000',
                        '1': '#FF0000',
                        '2': '#00FF00',
                        '3': '#FFFF00',
                        '4': '#0000FF',
                        '5': '#FF00FF',
                        '6': '#00FFFF',
                        '7': '#FFFFFF',
                        '8': '#7F7F7F',
                        '9': '#FF7F7F',
                        '10': '#7FFF7F',
                        '11': '#FFFF7F',
                        '12': '#7F7FFF',
                        '13': '#FF7FFF',
                        '14': '#7FFFFF',
                        '15': '#FFFFFF',
                        '232': '#7F7F7F',
                        '233': '#7F7F7F',
                        '234': '#7F7F7F',
                        '235': '#7F7F7F',
                        '236': '#7F7F7F',
                        '237': '#7F7F7F',
                        '238': '#7F7F7F',
                        '239': '#7F7F7F',
                        '240': '#7F7F7F',
                        '241': '#7F7F7F',
                        '242': '#7F7F7F',
                        '243': '#7F7F7F',
                        '244': '#7F7F7F',
                        '245': '#7F7F7F',
                        '246': '#7F7F7F',
                        '247': '#7F7F7F',
                        '248': '#7F7F7F',
                        '249': '#7F7F7F',
                        '250': '#7F7F7F',
                        '251': '#7F7F7F',
                        '252': '#7F7F7F',
                        '253': '#7F7F7F',
                        '254': '#7F7F7F',
                        '255': '#7F7F7F',
                    };

                    let asciiArt = converted.map((crRow) => {
                        return crRow.map((px) => {
                            const colorCode = extractColorCode(px);

                            const visibleChar = replaceVisibleChar(px, snip[i++ % snipLength]);

                            let finalColor = ansiColorMap[colorCode] || '#FEF5EC';
                            return { char: visibleChar, color: finalColor };
                        });
                    });

                    const width = asciiArt[0].length * 10;
                    const height = asciiArt.length * 16;

                    const canvas = createCanvas(width, height);
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);

                    ctx.font = "16px monospace";
                    ctx.textBaseline = 'top';


                    asciiArt.forEach((row, rowIndex) => {
                        row.forEach(({ char, color }, colIndex) => {
                            ctx.fillStyle = color;
                            ctx.fillText(char, colIndex * 10, (rowIndex + 1) * 16);
                        });
                    });

                    const outputFileName = "ascii.jpg";
                    const bufferImage = canvas.toBuffer("image/jpeg");
                    fs.writeFileSync(outputFileName, bufferImage);
                    console.log(`Imagem salva como ${outputFileName}`);

                    const mediaBuffer = fs.readFileSync(outputFileName);
                    const mediaMessage = new MessageMedia('image/jpeg', mediaBuffer.toString('base64'), 'ascii.jpg');
                    await client.sendMessage(msg.from, mediaMessage, { caption: '' });
                });
            }
        } else {
            await msg.reply("Por favor, envie uma imagem.");
        }
    } catch (error) {
        await msg.reply("Ocorreu um erro ao processar sua imagem.");
    }
};

function replaceVisibleChar(ansiString, replacementChar) {
    return ansiString.replace(/(\x1B\[[0-9;]*m)[^a-zA-Z0-9\s](\x1B\[[0-9;]*m)/, `$1${replacementChar}$2`);
}

function extractColorCode(px) {
    const match = px.match(/\x1B\[(\d+)(;\d+)?m/);
    return match ? match[1] : null;
}
