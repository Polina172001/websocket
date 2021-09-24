/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
/* eslint-disable padded-blocks */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-shadow */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable array-callback-return */
/* eslint-disable semi */
/* eslint-disable no-use-before-define */
/* eslint-disable comma-dangle */
/* eslint-disable prefer-const */
/* eslint-disable arrow-parens */
/* eslint-disable prefer-template */
/* eslint-disable linebreak-style */
const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const WS = require('ws');

const app = new Koa();

app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({
  server
});

const messages = [{
  userID: 1,
  nicName: 'Misha',
  text: 'Some text',
  time: getCurrentTime()
}];
const users = new Map();

users.set('1', 'Misha');


wsServer.on('connection', (ws) => {
  let id = 0;
  const errCallback = (e) => {
    console.log(e);
  }

  ws.on('messange', (e) => {
    if (e === 'allData') {
      let arrayMap = Array.from(users.entries());

      ws.send(JSON.stringify({
        message: messages,
        userList: arrayMap
      }), errCallback);
      return;
    }

    if (JSON.parse(e).hasOwnProperty('checkUser')) {
      const user = (JSON.parse(e)).checkUser;
      const userID = (JSON.parse(e)).userID;

      if (messages.some((e) => {
          e.nicName === user
        })) {
        ws.send(JSON.stringify({
          hasUser: 'exist'
        }));
      } else {
        messages.push({
          userID,
          nicName: user,
          text: `${user} присоединиться к чату `,
          time: getCurrentTime()
        });
        users.set(userID, user);
        id = userID;

        ws.send(JSON.stringify({
          hasUser: 'not-exist'
        }));

        let arrayMap = Array.from(users.entries());

        Array.from(wsSerever.clients)
          .filter(client => client.readyState === WS.OPEN)
          .forEach(client => client.send(JSON.stringify({
            message: [{
              userID,
              nicName: user,
              text: `${user} присоединиться к чату `,
              time: getCurrentTime()
            }],
            userList: arrayMap
          }), errCallback));

      }
      return;
    }

    messages.push(JSON.parse(e));

    let arrayMap = Array.from(users.entries());

    Array.from(wsSerever.clients)
      .filter(client => client.readyState === WS.OPEN)
      .forEach(client => client.send(JSON.stringify({
        message: e,
        userList: arrayMap
      }), errCallback));
  })

  ws.on('close', e => {
    users.delete(id);
    let arrayMap = Array.from(users.entries());
    Array.from(wsSerever.clients)
      .filter(client => client.readyState === WS.OPEN)
      .forEach(client => client.send(JSON.stringify({
        subject: 'Пользователь ушел',
        userList: arrayMap
      })));
  })


});

server.listen(port);

function getCurrentTime() {
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (month < 10) {
    month = 0 + '' + month;
  }
  let day = now.getDate();
  let hour = now.getHours();
  if (hour < 10) {
    hour = 0 + '' + hour;
  }
  let minutes = now.getMinutes();
  if (minutes < 10) {
    minutes = 0 + '' + minutes;
  }

  return day + '.' + month + '.' + year + '' + hour + ':' + minutes;
}
