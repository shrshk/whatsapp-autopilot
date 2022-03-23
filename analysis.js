const fs = require('fs');
const MESSAGES_BY_NUMBER_FILE_PATH = './messagesByNumber.json';
const CONTACTS_FILE_PATH='./soccerMonkeysContacts.json';

let messagesByNumMap = new Map();
let allGroupContacts = [];
let allMessages = [];
let allUsers = [];
let allActiveUsersInLastYear = new Set();
let allUsersWithInOrGameToday = new Set();
let gameOnInLastYear = 0;

const init = async () => {
    await getAllContacts();
    const messagesByNumber = await fs.promises.readFile(MESSAGES_BY_NUMBER_FILE_PATH, 'utf-8');
    const data = JSON.parse(messagesByNumber);
    Object.keys(data).forEach((key) => {
        messagesByNumMap.set(key, data[key]);
    });
    for (const [key, value] of messagesByNumMap) {
        value.forEach(obj => {
            const { date, message } = obj;
            allMessages.push({author: key, date, message});
        });
    }
    await mostActiveUsers();
    await activeUsersLastYear();
    await inActiveUsersLastYear();
    await noGameTodayOrIn();
}

const mostActiveUsers = async () => {
    allUsers = [...messagesByNumMap.keys()];
    allUsers.sort((u1, u2) => messagesByNumMap.get(u2).length-messagesByNumMap.get(u1).length);
    await fs.promises.writeFile('./top20ActiveUsers.json', JSON.stringify({ title: 'Top 20 Active Users of All Time', list: allUsers.slice(0, 20)}, null, 2));
};

const activeUsersLastYear = async () => {
    const today = new Date().toISOString();
    allMessages.forEach((messageObj) => {
        const { date, message, author } = messageObj;
        if (daysBetween(date, today)>365) {
            return;
        }
        allActiveUsersInLastYear.add(author);
        if (matchGameOrIn(message)) {
            allUsersWithInOrGameToday.add(author);
        }
        if (gameON(message)) {
            gameOnInLastYear++;
        }
    });
};

const inActiveUsersLastYear = async () => {
    let inActiveUsersInLastYear = new Set();
    allGroupContacts.forEach(c => {
        if (!allActiveUsersInLastYear.has(c)) {
            inActiveUsersInLastYear.add(c);
        }
    });
    console.log("inActiveUsersInLastYear " + inActiveUsersInLastYear.size);
    await fs.promises.writeFile('./inActiveUsersLastYear.json', JSON.stringify({title: `Users who didn't type a single message: ${inActiveUsersInLastYear.size}`, list: [...inActiveUsersInLastYear]}, null, 2));
}

const noGameTodayOrIn = async () => {
    let noGameTodayOrInUsers = new Set();
    allGroupContacts.forEach(c => {
        if (!allUsersWithInOrGameToday.has(c)) {
            noGameTodayOrInUsers.add(c);
        }
    });
    await fs.promises.writeFile('./noGameTodayOrInUsers.json', JSON.stringify({ title: `Users who didn't say In or Game today/tomorrow in Last year: ${noGameTodayOrInUsers.size}`, list:[...noGameTodayOrInUsers]}, null, 2));
    console.log("nogame " + noGameTodayOrInUsers.size);
    console.log("gameOn " + gameOnInLastYear);
}

const getAllContacts = async () => {
    try {
        const jsonString = await fs.promises.readFile(CONTACTS_FILE_PATH, "utf-8");
        const data = JSON.parse(jsonString);
        data.forEach(obj => {
            allGroupContacts.push(obj.id.user);
        });
    } catch (e) {
        console.log(e);
    }
}

const daysBetween = (date1String, date2String) => {
    const d1 = new Date(date1String);
    const d2 = new Date(date2String);
    return (d2-d1)/(1000*3600*24);
};


const matchGameOrIn = (message) => {
    return message.toLowerCase().includes('game today') || message.toLowerCase().includes('game tomorrow') || message.toLowerCase().startsWith('in');
};

const gameON = (message) => {
    return message.toLowerCase().includes('game on');
}

console.log(init());