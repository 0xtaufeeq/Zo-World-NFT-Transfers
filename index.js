require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");


const {TOKEN, PORT} = process.env;

const bot = new TelegramBot(TOKEN);


const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const webhook = req.body;
  const from = webhook[0].from;
  const to = webhook[0].to;
  const token_id = Number.parseInt(webhook[0].logs[0].topics[3],16);
  const tx_hash = webhook[0].logs[0].transactionHash;

  res.sendStatus(200);

  const chatId = -1002017173852;

  bot.sendMessage(chatId,
    `Zo Founder # ${token_id} transferred🔔\n\n From: ${from}\n\n To: ${to}\n
    https://polygonscan.com/tx/${tx_hash}`
 );

});

app.listen(PORT, () => {
  console.log(`Express server is listening`);
});