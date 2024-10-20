const axios = require('axios');
require('dotenv').config();

module.exports.run = async (client, msg, args) => {

    msg.reply("Processando sua solicitação..\nIsso pode demorar um pouco.  😅");

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/ai/run/${process.env.MODEL_TEXT}`, {
            method: "POST",
            body: JSON.stringify({
                "prompt": msg.body
            }),
            headers: {
                "Authorization": `Bearer ${process.env.API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
    
        const data = await response.json();

        const alert = "⚠️ *Atenção:* A resposta gerada pode ser imprecisa. Por favor, utilize as informações com cautela e, se necessário, verifique com fontes adicionais para garantir a precisão. Este sistema de IA é projetado para fornecer respostas com base em dados disponíveis, mas não substitui o aconselhamento profissional ou informações verificadas.";

        await client.sendMessage(msg.from, data.result.response);
        await client.sendMessage(msg.from, alert);

    } catch (error) {
        msg.reply('Erro ao processar sua solicitação. Tente novamente.')
    }
};
