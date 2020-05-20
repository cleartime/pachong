const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent, getYxwContent } from '../client'
import { getIndexHtml, getYXWIndexHtml } from '../file'

const init = async function () {
  const res = await getContent()
  const content = await getIndexHtml();
  if (content) {
    res.content = content;
  }
  acfunlogin(res);
}


const initYxw = async function () {
  const res = await getContent()
  const content = await getYXWIndexHtml();
  if (content) {
    res.content = content;
  }
  acfunlogin(res);
}

export const scheduleCronstyle = async () => {
  initYxw();
  // 每分钟的第30秒定时执行一次:
  // schedule.scheduleJob('60 * * * * *',()=>{
  // console.log(222)
  // init();
  // }); 
  // init()
  // const num = 60000 * 5
  // setInterval(() => {
  //   init();
  // }, num)
}

