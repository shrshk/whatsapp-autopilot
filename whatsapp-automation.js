const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});


client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, {small: true});
    // console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
    client.getChats().then((chats) => {
        chats.forEach((chat) => {
            if (chat.name.includes('Soccer Monkeys'))  {
                console.log('chat id is: ' + JSON.stringify(chat.id));
                console.log(chat.participants);
                if (chat.isGroup) {
                    chat.getContact().then(contact => {
                        contact.getFormattedNumber().then(
                            num => {
                                console.log("num is " + num);
                            }
                        );
                        contact.getAbout().then(info => console.log('About info' + info));
                    })
                }
            }
        })
    });
});

client.on('message', msg => {
    console.log(msg.body);
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();