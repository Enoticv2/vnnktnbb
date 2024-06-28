const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const token = '7138156661:AAFoF_TnYibNtPJ8Aot_2JDfO4Ja2w0B-Lo';
const bot = new TelegramBot(token, { polling: true });

mongoose.connect('mongodb+srv://ilyade3004:3004@cluster0.qitroet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  balance: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  events: { type: [String], default: [] }
});

const User = mongoose.model('User', userSchema);

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/enter', async (req, res) => {
  const { user_id } = req.body;

  console.log(`User ${user_id} has entered the application`);

  try {
    const user = await User.findOneAndUpdate(
      { user_id: user_id },
      { $setOnInsert: { balance: 0, energy: 100 } },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'User entered', user: user });
  } catch (err) {
    console.error('Error updating user data:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/update', async (req, res) => {
  const { user_id, balance, energy, event } = req.body;

  console.log(`Received update request for user ${user_id} with balance ${balance} and energy ${energy}, event: ${event}`);

  try {
    const user = await User.findOneAndUpdate(
      { user_id: user_id },
      { $set: { balance: balance, energy: energy }, $push: { events: event } },
      { new: true, upsert: true }
    );
    console.log(`User ${user_id} updated successfully.`);
    res.json({ success: true, message: 'User data updated', user: user });
  } catch (err) {
    console.error('Error updating user data:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/user', async (req, res) => {
  const { user_id } = req.query;

  console.log(`Fetching user data for ${user_id}`);

  try {
    const user = await User.findOne({ user_id: user_id });
    if (user) {
      console.log(`User data for ${user_id} found: balance=${user.balance}, energy=${user.energy}`);
      res.json({ success: true, user: user });
    } else {
      console.log(`User data for ${user_id} not found`);
      res.json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user data:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

async function addUserOrUpdate(userId, text) {
  try {
    const user = await User.findOneAndUpdate(
      { user_id: userId },
      { $push: { events: text }, $setOnInsert: { balance: 0, energy: 100 } },
      { new: true, upsert: true }
    );
    console.log(`User with user_id ${userId} has been added/updated.`);
  } catch (err) {
    console.error(err.message);
  }
}

async function sendMessage(chatId, text) {
  const fetch = (await import('node-fetch')).default;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
  return response.json();
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  addUserOrUpdate(userId, 'Started the bot');

  const menu = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Играть', callback_data: 'play' }],
        [{ text: 'Баланс', callback_data: 'balance' }, { text: 'Энергия', callback_data: 'energy' }]
      ]
    }
  };

  bot.sendMessage(chatId, 'Привет! Я ваш бот. Выберите команду из меню.', menu);
});

bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data === 'play') {
    const playUrl = 'https://t.me/FanHockeyBot/FanHockey';
    bot.sendMessage(chatId, `Играть можно по следующей ссылке: ${playUrl}`);
  } else if (data === 'balance') {
    const user = await User.findOne({ user_id: userId });
    if (user) {
      bot.sendMessage(chatId, `Ваш текущий баланс: ${user.balance}`);
    } else {
      bot.sendMessage(chatId, 'Ваш аккаунт не найден.');
    }
  } else if (data === 'energy') {
    const user = await User.findOne({ user_id: userId });
    if (user) {
      bot.sendMessage(chatId, `Ваш текущий уровень энергии: ${user.energy}`);
    } else {
      bot.sendMessage(chatId, 'Ваш аккаунт не найден.');
    }
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Список команд:\n/start - Начало\n/help - Помощь\n/play - Играть\n/balance - Проверить баланс\n/energy - Проверить энергию');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  addUserOrUpdate(userId, msg.text);

  if (msg.text.startsWith('/')) return;
  bot.sendMessage(chatId, msg.text);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});