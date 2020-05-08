const puppeteer = require('puppeteer');

const initialPage = 'https://statsregnskapet.dfo.no/departementer';
const selectors = [
  'div[id$="-bVMpYP"] article a',
  'div[id$="-KcazEUq"] article .dfo-widget-sm a',
];


export const acfunlogin = async function() {
  console.log('打开网站'); 
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto('https://www.acfun.cn/login/');

  await page.on('response', async (response) => {    
    if (response.url() == "https://capuk.org/ajax_search/capmoneycourses"){
        console.log('XHR response received'); 
        console.log(await response.json()); 
    } 
});

  const accountswitchx = await page.$x('//*[@id="login-account-switch"]');
  await accountswitchx[0].click();
  const account = await page.$('#ipt-account-login');
  await account.focus();
  await page.keyboard.type('17621218285');
  const pwd = await page.$('#ipt-pwd-login');
  await pwd.focus();
  await page.keyboard.type('Gxx562606139');
  const btn = await page.$('.btn-login');
  await btn.click();
  console.log('登录');
  await page.waitFor(5000);
  //*[@id="header-guide"]/li[6]/div/ul/li[2]/a
  await page.goto('https://member.acfun.cn/post-article');
  // const title = await page.$x('/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input');
  // await title[0].focus();
  // await page.keyboard.type();
  console.log('开始选择分区');
  const fenqu = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[4]/div[2]/div/div[1]/input',
  );
  await fenqu[0].click();
  const cascader1 = await page.$x(
    '/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[2]',
  );
  await cascader1[0].hover();
  const cascader2 = await page.$x(
    '/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[3]',
  );
  // debugger
};
