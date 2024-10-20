const { MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();

module.exports.run = async (client, msg, args) => {
    msg.reply("Processando sua solicitação..\nIsso pode demorar um pouco. 😅");

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/ai/run/@cf/lykon/dreamshaper-8-lcm`, {
            method: "POST",
            body: JSON.stringify({
                "prompt": msg.body
            }),
            headers: {
                "Authorization": `Bearer ${process.env.API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const media = new MessageMedia('image/png', buffer.toString('base64'), 'image.png');
            await client.sendMessage(msg.from, media, { caption:''});
        }
        
    } catch (error) {
        msg.reply('Erro ao processar sua solicitação. Tente novamente.');
    }
};
