const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7031904200:AAGkpHUVBmP_qgp6dNifzlD-sgGOAl4RzO8';
const apiKey = 'DDB9PFHRN8XHCCCDNNAXCP8K7N6MFZZCHJ';

const contractAddress = '0xF9e631014Ce1759d9B76Ce074D496c3da633BA12';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Zo World Bot! Send /txn to get the last 10 events of the contract.');
});

bot.onText(/\/txn/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const events = await getContractEvents();
        events.forEach((event, index) => {
            const formattedEvent = formatEvent(index + 1, event);
            bot.sendMessage(chatId, formattedEvent, { parse_mode: 'Markdown' });
        });
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Error fetching contract events. Please try again later.');
    }
});

function formatEvent(eventNumber, event) {
    let formattedEvent = `*Event ${eventNumber}*\n`;
    formattedEvent += `- Event Name: ${event.topics[0].replace('0x', '').substring(0, 10)}...\n`;
    formattedEvent += `- Address: ${event.address}\n`;
    formattedEvent += `- Topics: ${event.topics.slice(1).join(', ')}\n`;
    formattedEvent += `- Timestamp: ${new Date(event.timeStamp * 1000).toLocaleString()}\n\n`;
    return formattedEvent;
}

async function getContractEvents() {
    try {
        const url = `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=latest&toBlock=latest&address=${contractAddress}&apikey=${apiKey}`;
        const response = await axios.get(url);
        const events = response.data.result;
        return events;
    } catch (error) {
        console.error('Error fetching contract events:', error);
        throw error;
    }
}

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `*Available Commands:*\n\n` +
        `*/start* - Start the bot\n` +
        `*/txn* - Get the last 10 events of the contract\n` +
        `*/help* - Display this help message\n` +
        `*/balance* - Get the balance of the contract\n` +
        `*/transaction* - Get the details of a specific transaction\n` +
        `*/block* - Get the details of a specific block\n` +
        `*/uncle* - Get the details of a specific uncle block\n` +
        `*/token* - Get the details of a specific ERC20 token\n` +
        `*/price* - Get the current price of Ether in USD\n\n` +
        `*Example Usage:*\n` +
        `/txn - Get the last 10 events of the contract`;
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const balance = await getContractBalance();
        const formattedBalance = `*Contract Balance:*\n\n` +
            `- Balance: ${balance} ETH\n`;
        bot.sendMessage(chatId, formattedBalance, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error fetching contract balance:', error);
        bot.sendMessage(chatId, 'Error fetching contract balance. Please try again later.');
    }
});

async function getContractBalance() {
    try {
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${contractAddress}&tag=latest&apikey=${apiKey}`;
        const response = await axios.get(url);
        const balance = response.data.result / 1e18;
        return balance;
    } catch (error) {
        console.error('Error fetching contract balance:', error);
        throw error;
    }
}

bot.onText(/\/transaction (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const transactionHash = match[1];
    try {
        const transaction = await getTransaction(transactionHash);
        const formattedTransaction = `*Transaction Details:*\n\n` +
            `- Hash: ${transaction.hash}\n` +
            `- From: ${transaction.from}\n` +
            `- To: ${transaction.to}\n` +
            `- Value: ${transaction.value / 1e18} ETH\n` +
            `- Gas Price: ${transaction.gasPrice / 1e9} Gwei\n` +
            `- Gas Used: ${transaction.gasUsed}\n` +
            `- Block Number: ${transaction.blockNumber}\n` +
            `- Timestamp: ${new Date(transaction.timeStamp * 1000).toLocaleString()}\n`;
        bot.sendMessage(chatId, formattedTransaction, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        bot.sendMessage(chatId, 'Error fetching transaction details. Please try again later.');
    }
});

async function getTransaction(transactionHash) {
    try {
        const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${apiKey}`;
        const response = await axios.get(url);
        const transaction = response.data.result;
        return transaction;
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}
