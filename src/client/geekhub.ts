import { getCode } from '../ocr/getCode';
const puppeteer = require('puppeteer');

const config = {
  urlLogin: 'https://geekhub.com/users/sign_in',
  account: '1047105447@qq.com',
  pwd: 'mmwybzd555',
};

const init = async function(page) {
  console.log('输入帐号');
  const account = await page.$x('//*[@id="new_user"]/div[1]/input[1]');
  await account[0].focus();
  await page.keyboard.type(config.account);
  const user = await page.$('.h-8');
  console.log('输入密码');
  const pwd = await page.$x('//*[@id="new_user"]/div[1]/input[2]');
  await pwd[0].focus();
  await page.keyboard.type(config.pwd);
  const png = await user.screenshot();
  const code = await getCode(png);
  console.log('输入图形验证码' + code);
  const codeInput = await page.$x('//*[@id="new_user"]/div[2]/input');
  await codeInput[0].focus();
  await page.keyboard.type(code);
  console.log('登录');
  const btn = await page.$x('//*[@id="new_user"]/div[4]/div[1]/button');
  await btn[0].click();
  await page.waitForNavigation();
};
export const geekLogin = async function() {
  // debugger
  console.log('打开网站');
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    // headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto(config.urlLogin);
  await init(page);
  const location = await page.evaluate(() => {
    return window.location.href;
  });
  if (location === config.urlLogin) {
    await init(page);
    return;
  }
  console.log('登录成功');
  const center = await page.$x('/html/body/div/header/div[1]/div[2]/div/a[2]');
  await center[0].click();
  await page.waitForNavigation();
  console.log('进入个人中心');
  const checkins = await page.$x('/html/body/div/div[2]/sidebar/div[1]/div[2]/div/div[3]/a[2]/div/span[2]');
  await checkins[0].click();
  await page.waitForNavigation();
  console.log('签到');
  const signLn = await page.$x('/html/body/div/div[2]/main/div[2]/a');
  await signLn[0].click();
  await page.waitForNavigation();
  
  
  // await browser.close();
  // console.log('关闭网站');
};
