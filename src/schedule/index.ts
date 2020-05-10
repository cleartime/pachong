const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent } from '../client'
import { from } from 'rxjs';
export const scheduleCronstyle = async () => {
  const res = await getContent()
  acfunlogin(res);
  //每分钟的第30秒定时执行一次:
  // schedule.scheduleJob('00 07 09 * * *',()=>{
  //   geekLogin();
  // }); 
}