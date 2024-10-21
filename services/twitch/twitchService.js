require('dotenv').config();

const db = require('../../db');
const { getClient } = require('../../whatsappClient');

class TwitchService {
    async getStreamerInfo(username) {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID
            }
        });
        const info = await response.json();
        return info;
    }

    async getStreamInfo(streamerId) {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.TWITCH_TOKEN}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Content-Type': 'application/json'
            },
        });
        return await response.json();
    }

    async listenToStreamerEvents(streamerId) {
        const subscriptionPayload = {
            type: 'stream.online',
            version: '1',
            condition: {
                broadcaster_user_id: streamerId
            },
            transport: {
                method: 'webhook',
                callback: 'https://b05e-190-89-113-225.ngrok-free.app/eventsub/',
                secret: process.env.CALLBACK_SECRET_KEY
            }
        };

        const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.TWITCH_TOKEN}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionPayload)
        });

        const result = await response.json();
    }

    sendNotificationUsers = async (event) => {
        const client = getClient();
        const result = await this.getStreamInfo(event.broadcaster_user_id);

        if (result.data == 0) return;

        const formattedDate = new Date(event.started_at)
            .toLocaleString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
                timeZoneName: 'short'
            })
            .replace(',', ' às');

        const alert = `🌟 ${event.broadcaster_user_name} está ao vivo!🌟\n\n🎮 Jogando: ${result.data[0].game_name}\n\n🕒 Começou em: ${formattedDate}\n\n👥 Contagem de espectadores: ${result.data[0].viewer_count}`;

        try {
            const streamerResult = await db.query('SELECT streamer_id FROM streamers WHERE LOWER(username) = LOWER($1)', [event.broadcaster_user_name]);

            if (streamerResult.rowCount === 0) {
                return;
            }

            const streamerId = streamerResult.rows[0].streamer_id;

            const usersResult = await db.query(`
                SELECT u.phone_number 
                FROM users u
                JOIN notifications n ON u.user_id = n.user_id
                WHERE n.streamer_id = $1
            `, [streamerId]);

            if (usersResult.rowCount > 0) {
                const phoneNumbers = usersResult.rows.map(row => row.phone_number);
                await Promise.all(phoneNumbers.map(phone => this.sendNotification(client, phone, alert)));
            }
        } catch (error) {
            
        }
    };

    sendNotification = async (client, number, alert) => {
        await client.sendMessage(number, alert);
    };
}

module.exports = TwitchService;
