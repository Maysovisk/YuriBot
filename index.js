const { Client, LocalAuth } = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const config = require('./config.json');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan the QR code on your WhatsApp to get started:');
    qrCode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (!msg.body.startsWith(config.prefix)) return;

    const args = msg.body
        .trim().slice(config.prefix.length)
        .split(/ +/g);

    const command = args.shift().toLowerCase();

    try {
        const commandFile = require(`./commands/${command}.js`);
        commandFile.run(client, msg, args);
    } catch (err) {
        console.log(err);
    }
});

client.initialize();
