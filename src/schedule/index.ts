const schedule = require('node-schedule');
import { acfunlogin, geekLogin, getContent, getYxwContent } from '../client';
import { getIndexHtml, getYXWIndexHtml } from '../file';
const exec = require('child_process').exec;

function execute(cmd) {
  exec(cmd, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.log(`${cmd} success`);
    }
  });
}

const initYMXK = async function(option) {
  const res = await getContent(option);
  try {
    const content = await getIndexHtml(option);
    if (content) {
      res.content = content.toString();
    }
  } catch (error) {}
  acfunlogin(res);
};

const initYxw = async function() {
  const res = await getYxwContent();
  try {
    const content = await getYXWIndexHtml();
    if (content) {
      res.content = content.toString();
    }
  } catch (error) {}
  acfunlogin(res);
};

const init = async function() {
  initYMXK(false);
  // initYxw();
};

export const scheduleCronstyle = async () => {
  // 每分钟的第30秒定时执行一次:
  // schedule.scheduleJob('60 * * * * *',()=>{
  init();
  const num1 = 60000 * 2;
  const num2 = 60000 * 15;
  setInterval(() => {
    init();
  }, num1);

  // setInterval(() => {
  //   initYMXK(true)
  // }, num2)

  // setInterval(() => {
  //   initYMXK(true)
  // }, num2)
  // acfunlogin({
  //   id: '213',
  //   content: '32432',
  //   title: '324324',
  //   des: '324324',
  //   tag: 'dsfdsf',
  // });
};
