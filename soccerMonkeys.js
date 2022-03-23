const fs = require('fs');
const whatsapp = require('whatsapp-chat-parser');
const CHAT_TEXT_FILE_PATH='./soccerMonkeysChat.txt';
const SAVED_CONTACTS_MAP_PATH = './savedContactsMap.json';
let savedContactsMap = new Map();

const getAllMessages = async () => {
    const fileContents = fs.readFileSync(CHAT_TEXT_FILE_PATH, 'utf8');
    try {
        return await whatsapp.parseString(fileContents);
    } catch (e) {
        console.log(e);
    }

    return [];
}

const writeMessagesToFile = async () => {
    try {
        const jsonString = await fs.promises.readFile(SAVED_CONTACTS_MAP_PATH, "utf-8");
        const data = JSON.parse(jsonString);
        savedContactsMap = new Map(Object.entries(data));
        const allMessages = await getAllMessages();
        const messageNumberOrNameMap = buildMessageMapAndWriteToFileForPhoneNumber(allMessages);
        await fs.promises.writeFile('./allMessages.json', JSON.stringify(allMessages, null, 2));
        await fs.promises.writeFile('./messagesByNumber.json', JSON.stringify(Object.fromEntries(messageNumberOrNameMap), null, 2));
        // await fs.promises.writeFile('./savedContacts.json', JSON.stringify([...savedContacts], null));
    } catch (e) {
        console.log(e);
    }
}

const buildMessageMapAndWriteToFileForPhoneNumber = (allMessages) => {
    let messageNumberMap = new Map();
    allMessages.forEach(messageObj => {
        const { date, author, message } = messageObj;
        let key='';
        if (/[a-zA-Z]/g.test(author)) {
            if (!savedContactsMap.has(author)) {
                return;
            }
            key = savedContactsMap.get(author);
        } else {
            key = getNumberForPhoneNumber(author);
        }
        if (messageNumberMap.has(key)) {
            messageNumberMap.get(key).push({date, message});
        } else {
            messageNumberMap.set(key, [{date, message}]);
        }
    });
    return messageNumberMap;
}

const getNumberForPhoneNumber = (phoneNumber) => {
    let phoneNumberNoSpaces = phoneNumber.replace(/\s/g, '');
    let num='';
    for (let i=0; i<phoneNumberNoSpaces.length; i++) {
        if (phoneNumberNoSpaces.charAt(i)>=0 || phoneNumberNoSpaces.charAt(i)<=9) {
            num+=phoneNumberNoSpaces.charAt(i);
        }
    }
    return num;
}

console.log(writeMessagesToFile());