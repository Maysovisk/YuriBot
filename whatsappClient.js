let whatsappClient;

const setClient = (client) => {
    whatsappClient = client;
};

const getClient = () => {
    if (!whatsappClient) {
        throw new Error('WhatsApp client is not initialized.');
    }
    return whatsappClient;
};

module.exports = { setClient, getClient };
