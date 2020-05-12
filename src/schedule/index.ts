const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent } from '../client'

const init = async function () {
  const res = await getContent()
  acfunlogin(res);
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
    init();
  }, num)
}

