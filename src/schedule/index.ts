const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent, getYxwContent } from '../client'
import { getIndexHtml, getYXWIndexHtml } from '../file'

const initYMXK = async function () {
  const res = await getContent()
  try {
    await getIndexHtml()
    const content = await getIndexHtml()
    if (content) {
      res.content = content.toString();
    }
  } catch (error) {
  }
  acfunlogin(res);
}


const initYxw = async function () {
  const res = await getYxwContent()
  try {
    const content = await getYXWIndexHtml()
    if (content) {
      res.content = content.toString();
    }
  } catch (error) {
  }
  acfunlogin(res);
}

const init = async function () {
  initYMXK();
  initYxw()
}
 

export const scheduleCronstyle = async () => {
  // 每分钟的第30秒定时执行一次:
  // schedule.scheduleJob('60 * * * * *',()=>{
  // console.log(222)
  // init();
  // }); 
  init()
  const num = 60000 * 5
  setInterval(() => {
    init()
  }, num)
}

