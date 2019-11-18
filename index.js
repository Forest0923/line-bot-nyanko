'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const cron = require('node-cron');
const http = require('http');

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

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

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
  switch(event.type){
  case 'message':
    let replyText = {
      type: 'text',
      text:  'Hi :)\n'
    }
    switch(event.message.type){
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
    
  case 'follow':
    return client.replyMessage(event.replyToken, {type: 'text', text: 'Got followed event'});
    
  case 'unfollow':
    return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

  case 'join':
    return client.replyMessage(event.replyToken, {type: 'text', text: `Joined ${event.source.type}`});
    
  case 'leave':
    return console.log(`Left: ${JSON.stringify(event)}`);
    
  case 'postback':
    let data = event.postback.data;
    if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
      data += `(${JSON.stringify(event.postback.params)})`;
    }
    return client.replyMessage(event.replyToken, {type: 'text', text: `Got postback: ${data}`});
    
  case 'beacon':
    return client.replyMessage(event.replyToken, {type: 'text', text: `Got beacon: ${event.beacon.hwid}`});
    
  default:
    throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function check_db(){
  push(Date.now + 'run check_db()');
  const options = {
    transform: (body) => {
      return cheerio.load(body);
    }
  };
  const url = 'https://battlecats-db.com/';
  rp.get(url, options)
    .then(($) => {
      return $('.news').text();
    }).then((news) => {
      news = news
              .replace('\n更新履歴\n', '[更新履歴]')
              .replace(/\n\n[\s\S]*?\n\n/, '\n');
      console.log(news);
      const path2log = 'news.log';
      fs.lstat(path2log, (err) => {
        if(err){
          fs.writeFileSync(path2log, '');
        }
        let log = fs.readFileSync(path2log, 'utf-8');
        if(log == news){
          return;
        }else{
          push(news + '\n' + url);
          fs.writeFileSync(path2log, news);
        }
      });
    }).catch((error) => {
      console.error('Error:', error);
    });
}

function push(message){
  return client.broadcast({
    type: "text",
    text: message
  }).then(data => console.log("push: " + data))
    .catch(e => console.log("push: " + e))
}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  // check_db();
  cron.schedule('0 */30 * * * *', () => {
    console.log('run check_db()\n');
    check_db();
  });
});

setInterval(() => {
  http.get(`${process.env.PROJECT_DOMAIN}`);
}, 120000);