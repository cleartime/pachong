const schedule = require('node-schedule');
import { geekLogin } from '../client'
export const scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('30 00 09 * * *',()=>{
      geekLogin();
    }); 
}