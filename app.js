
import Koa from 'koa';
import Router from 'koa-router';
import querystring from 'querystring';
import fetch from 'node-fetch';
import url from 'url';
import crypto  from 'crypto';
import cors from 'cors';

const router = new Router();
const app = new Koa();
app.use(cors());

const OAPI_HOST = 'https://oapi.dingtalk.com';

// const { corpId, corpSecret } = require('./env');

import env from './env.js';
const { corpid, corpsecret } = env;

router.get('/auth', async (ctx, next) => {

  let noceStr = 'abcdefg';
  let timeStamp = Date.now();
  //获得 请求url
  let singedUrl = decodeURIComponent(ctx.request.href);

  let initConfig = {
    method: 'GET',
  };

  //获得访问钥匙  
  let accessQs = querystring.stringify({
    corpid,
    corpsecret
  });
  let res = await fetch(`${OAPI_HOST}/gettoken?${accessQs}`);
  res = await res.json();
  
  const access_token = res.access_token;

  //获得门票  
  let jsapiTicketQs = querystring.stringify({
    type: 'jsapi',
    'access_token': access_token
  })
  res = await fetch(`${OAPI_HOST}/get_jsapi_ticket?${jsapiTicketQs}`);
  res = await res.json();

  const ticket = res.ticket;
  let urlObj = url.parse(singedUrl);
  delete urlObj['hash'];

  let newUrl = url.format(urlObj);


  const str = `jsapi_ticket=${ticket}&noncestr=${noceStr}&timestamp=${timeStamp}$url=${newUrl}`;

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

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3004);