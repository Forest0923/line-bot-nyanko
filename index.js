'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

// create LINE SDK config from env variables
const config = {
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};
// create LINE SDK client
const client = new line.Client(config);
// create Express app
const app = express();

// app.get();
app.post('/', line.middleware(config), (req, res) => {
  Promise
  .all(req.body.events.map(handleEvent))
  .then((result) => res.json(result))
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});


function handleEvent(event){
  let replyText = {
    type: 'text',
    text:  'Hi :)\n'
  }
  switch (event.message.type){
  case 'text':
    replyText.text += 'I got TEXT'
    return client.replyMessage(event.replyToken, replyText);
    
  case 'image':
    replyText.text += 'I got IMAGE'
    return client.replyMessage(event.replyToken, replyText);
    
  case 'video':
    replyText.text += 'I got VIDEO'
    return client.replyMessage(event.replyToken, replyText);

  case 'audio':
    replyText.text += 'I got AUDIO'
    return client.replyMessage(event.replyToken, replyText);
    
  case 'file':
    replyText.text += 'I got FILE'
    return client.replyMessage(event.replyToken, replyText);
    
  case 'location':
    replyText.text += 'I got LOCATION'
    return client.replyMessage(event.replyToken, replyText);
    
  case 'sticker':
    replyText.text += 'I got STICKER'
    return client.replyMessage(event.replyToken, replyText);
  default:
    return Promise.resolve(null);
  }
}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
