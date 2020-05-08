const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent } from '../client'
export const scheduleCronstyle = ()=>{
  getContent()
  // acfunlogin();
  //每分钟的第30秒定时执行一次:
    // schedule.scheduleJob('00 07 09 * * *',()=>{
    //   geekLogin();
    // }); 
}