const botCommandsDescription = `
Lista de comandos 📝

*/ascii*
Com o comando \`/ascii\`, você pode converter uma imagem em arte ASCII. Basta enviar a imagem, e o bot fará a mágica. Uma maneira interessante de transformar suas fotos em algo diferente e divertido.

*/imagine*
Se você tem uma ideia em mente, o comando \`/imagine\` permite que você gere imagens a partir de um prompt. Digite o que você deseja, e a IA fará o resto. Uma ótima forma de explorar sua criatividade sem limites.

*/ping*
O comando \`/ping\` é simples e eficaz: ao digitá-lo, o bot responde com "pong". Uma maneira prática de verificar se o bot está ativo e pronto para ajudar.

*/search*
Se você viu uma cena de anime e não sabe de onde é, o comando \`/search\` é a solução. Envie uma foto da cena, e o bot buscará informações sobre o anime e o episódio correspondente. Uma ferramenta útil para os amantes de animes.

*/sticker*
Com o comando \`/sticker\`, você pode converter uma imagem em um sticker. Basta enviar a imagem, e o bot a transformará em um sticker que você pode usar nas suas conversas.

*/twitch*
Fique por dentro das streams dos seus jogadores favoritos com o comando \`/twitch\`. Ao digitar o nome do canal, você receberá notificações sempre que o streamer iniciar uma live. Assim, você nunca perde a ação.

*/commands*
Por último, temos o comando \`/commands\`, que lista todos esses comandos que você leu aqui. Um recurso útil para consultar rapidamente o que o bot pode fazer... mas você já sabe disso, né?
`;

module.exports.run = async (client, msg, args) => {
    msg.reply(botCommandsDescription);
};

