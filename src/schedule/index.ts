const schedule = require('node-schedule');

export const scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('30 49 15 * * *',()=>{
        console.log('scheduleCronstyle:' + new Date());
    }); 
}