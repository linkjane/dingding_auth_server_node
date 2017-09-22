
import Koa from 'koa';
import Router from 'koa-router';
import querystring from 'querystring';
import fetch from 'node-fetch';
import url from 'url';
import crypto from 'crypto';
import cors from 'koa-cors';
import koaBody from 'koa-body';

import Token from './token.js';

const router = new Router();
const app = new Koa();
let ticket = '';


app.use(koaBody());
app.use(cors());

const OAPI_HOST = 'https://oapi.dingtalk.com';

// const { corpId, corpSecret } = require('./env');

import env from './env.js';
const { corpid, corpsecret } = env;


router.get('/accesstoken',  async (ctx, next) => {
 
  let res = await getAccessToken();
  ctx.body = res;
});


router.get('/ticket', async (ctx, next) => {
    let res = await getTicket();
  
    ctx.body = res;
});


router.post('/signature',async (ctx, next) => {


  let res = await getTicket();
  let ticket = res.ticket;
  console.log('ticket: ' + ticket);

 
  let noceStr = Math.random().toString(36).substr(2);
  let timeStamp = Date.now();

  let reqBody = ctx.request.body;
  if ( typeof reqBody == 'string' ) {
    reqBody = JSON.parse(reqBody);
  } 
  let bodyUrl = reqBody.url;
  let newUrl = decodeURIComponent(bodyUrl);
  newUrl = url.parse(newUrl);
  delete newUrl['hash']; //必须删除url的hash部分
  newUrl = url.format(newUrl);

  const str = `jsapi_ticket=${ticket}&noncestr=${noceStr}&timestamp=${timeStamp}&url=${newUrl}`;  
  
  let sha1 = crypto.createHash('sha1');
  sha1.update(str);
  let signature = sha1.digest('hex');

  console.log(newUrl);

  ctx.body = {
      data: {
          signature,
          noceStr,
          timeStamp,
          corpid
      },
      error: false,
      success: true
  };
});


//获得accesskey
async function getAccessToken() {
 let accessQs = querystring.stringify({
    corpid,
    corpsecret
  });
  const url = `${OAPI_HOST}/gettoken?${accessQs}`;

  let res =  await Token.getInstance('accessToken').getToken(url);
  // console.log('accessToken:  ' +  res.access_token);  
  return res;
}

//获得ticket
async function getTicket() {

  let res = await getAccessToken();
  let jsapiTicketQs = querystring.stringify({
    type: 'jsapi',
    'access_token': res.access_token
  });
  const url = `${OAPI_HOST}/get_jsapi_ticket?${jsapiTicketQs}`;
  res =  await Token.getInstance('ticket').getToken(url);
  // console.log('ticket:  ' + res.ticket);
  return res;  
}

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3004);