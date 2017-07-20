
import Koa from 'koa';
import Router from 'koa-router';
import querystring from 'querystring';
import fetch from 'node-fetch';
import url from 'url';
import crypto from 'crypto';
import cors from 'koa-cors';
import koaBody from 'koa-body';


const router = new Router();
const app = new Koa();
let ticket = '';


app.use(koaBody());
app.use(cors());

const OAPI_HOST = 'https://oapi.dingtalk.com';

// const { corpId, corpSecret } = require('./env');

import env from './env.js';
const { corpid, corpsecret } = env;


router.get('/token', async (ctx, next) => {
  const res = await getToken();
  ctx.body = res.access_token;
});


async function getToken() {
  //获得访问钥匙  
  let accessQs = querystring.stringify({
    corpid,
    corpsecret
  });
  let res = await fetch(`${OAPI_HOST}/gettoken?${accessQs}`, {
    mode: 'cors'
  });
  res = await res.json();
  return res;
}


async function getTicket(access_token) {
  //获得门票  
  let jsapiTicketQs = querystring.stringify({
    type: 'jsapi',
    'access_token': access_token
  })
  let res = await fetch(`${OAPI_HOST}/get_jsapi_ticket?${jsapiTicketQs}`, {
    mode: 'cors'
  });
  res = await res.json();
  return res;
}

router.get('/ticket', async (ctx, next) => {
  let res = await getToken();
  res = await getTicket(res.access_token);
  ticket = res;
  ctx.body = res;
});


router.get('/auth', async (ctx, next) => {

  let noceStr = 'abcdefg';
  let timeStamp = Date.now();
  //获得 请求url
  let singedUrl = decodeURIComponent(ctx.request.href);

  let initConfig = {
    method: 'GET',
  };


  let res = await getToken();

  res = await getTicket(res.access_token);
  const ticket = res.ticket.trim();

  let urlObj = url.parse(singedUrl);
  delete urlObj['hash'];

  let newUrl = url.format(urlObj);

  const str = `jsapi_ticket=${ticket}&noncestr=${noceStr}&timestamp=${timeStamp}&url=${newUrl}`;
 console.log(ticket);
 console.log(timeStamp);
 console.log(noceStr);
 console.log(newUrl);
 
  let sha1 = crypto.createHash('sha1');
  sha1.update(str, 'utf8');
  let signature = sha1.digest('hex');

  ctx.body = {
    signature,
    noceStr,
    timeStamp,
    corpid
  };
});

router.post('/signature', (ctx, next) => {



  let ticket = ctx.request.body.ticket.trim();

  let noceStr = 'abcdefg';
  // let timeStamp = Date.now();
  let timeStamp = 1500561141798;

  let newUrl = decodeURIComponent('http://localhost:3004/auth');
  // newUrl = url.parse(newUrl);
  // delete newUrl['hash'];
  newUrl = url.format(newUrl);
 
  const str = `jsapi_ticket=${ticket}&noncestr=${noceStr}&timestamp=${timeStamp}&url=${newUrl}`;  
  


  let sha1 = crypto.createHash('sha1');
  sha1.update(str);
  let signature = sha1.digest('hex');

   ctx.body = {
    signature,
    noceStr,
    timeStamp,
    corpid
  };

});



app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3004);