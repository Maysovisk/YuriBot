const db = require('../db');
const TwitchService = require('../services/twitch/twitchService');
const twitchService = new TwitchService();

module.exports.run = async (client, msg, args) => {
    const username = args[0];
    const phone_number = msg.from;

    try {
        const userResult = await db.query('SELECT user_id FROM users WHERE phone_number = $1', [phone_number]);
        const userExists = userResult.rowCount > 0;

        let userId;

        if (!userExists) {
            const newUserResult = await db.query('INSERT INTO users (phone_number) VALUES ($1) RETURNING user_id', [phone_number]);
            userId = newUserResult.rows[0].user_id; 
            
        } else {
            userId = userResult.rows[0].user_id; 
        }

        const streamerQuery = 'SELECT streamer_id FROM streamers WHERE username = $1';
        const streamerResult = await db.query(streamerQuery, [username]);

        if (streamerResult.rowCount === 0) {
            const info = await twitchService.getStreamerInfo(username);

            if (info.data.length === 0) {
                msg.reply('Streamer não encontrado.');
                return;
            }

            
            await db.query(
                `INSERT INTO streamers (twitch_user_id, username) VALUES ($1, $2)`, 
                [info.data[0].id, info.data[0].login]
            );

            const newStreamerResult = await db.query(streamerQuery, [info.data[0].login]);

            await db.query(
                `INSERT INTO notifications (user_id, streamer_id) VALUES ($1, $2)`, 
                [userId, newStreamerResult.rows[0].streamer_id] 
            );

            twitchService.listenToStreamerEvents(info.data[0].id);

            msg.reply(`Notificação ativada para o streamer ${info.data[0].login}.`);
        } else {
            console.log('Streamer encontrado:', streamerResult.rows[0]);

            const existingNotification = await db.query(
                `SELECT * FROM notifications WHERE user_id = $1 AND streamer_id = $2`,
                [userId, streamerResult.rows[0].streamer_id] // Use o userId
            );

            if (existingNotification.rowCount === 0) {
                await db.query(
                    `INSERT INTO notifications (user_id, streamer_id) VALUES ($1, $2)`, 
                    [userId, streamerResult.rows[0].streamer_id] // Use o userId
                );
                msg.reply(`Notificação ativada para o streamer ${username}.`);
            } else {
                msg.reply(`Você já está inscrito para notificações do streamer ${username}.`);
            }
        }

    } catch (error) {
        console.error('Erro:', error);
        msg.reply('Ocorreu um erro ao processar sua solicitação.');
    }
};
