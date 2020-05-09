const puppeteer = require('puppeteer');

const config = {
  url: 'https://www.gamersky.com/ent/xz/',
  url_news: 'https://www.gamersky.com/news/'
}


export const getContent = async function () {
  console.log('打开网站');
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true, 
    headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url_news);
  const link = await page.$x('/html/body/div[7]/div[2]/div[1]/div[3]/ul/li[1]/div[1]/a[2]');
  await link[0].click();

  const title = await page.$x('/html/body/div[10]/div/div[2]/div[1]/div[1]/div[3]')
  const Mid2L_tit = await page.evaluate((title) => {
    return title;
  }, title[0]);
  // console.log(title)
  // const Mid2L_des = await page.evaluate(() => {
  //   const html = document.querySelector('.Mid2L_con > p').innerHTML
  //   return html.replace('游民星空', 'Acfun');
  // });
  // const Mid2L_con = await page.evaluate(() => {
  //   const html = document.querySelector('.Mid2L_con').innerHTML
  //   return html.replace('游民星空', 'Acfun');
  // });
  // return {
  //   title: Mid2L_tit, des: Mid2L_des, con: Mid2L_con
  // }
  //   await page.on('response', async (response) => {    
  //     if (response.url() == "https://capuk.org/ajax_search/capmoneycourses"){
  //         console.log('XHR response received'); 
  //         console.log(await response.json()); 
  //     } 
  // });

  //   const accountswitchx = await page.$x('//*[@id="login-account-switch"]');
  //   await accountswitchx[0].click();
  //   const account = await page.$('#ipt-account-login');
  //   await account.focus();
  //   await page.keyboard.type('17621218285');
  //   const pwd = await page.$('#ipt-pwd-login');
  //   await pwd.focus();
  //   await page.keyboard.type('Gxx562606139');
  //   const btn = await page.$('.btn-login');
  //   await btn.click();
  //   console.log('登录');
  //   await page.waitFor(5000);
  //   //*[@id="header-guide"]/li[6]/div/ul/li[2]/a
  //   await page.goto('https://member.acfun.cn/post-article');
  //   // const title = await page.$x('/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input');
  //   // await title[0].focus();
  //   // await page.keyboard.type();
  //   console.log('开始选择分区');
  //   const fenqu = await page.$x(
  //     '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[4]/div[2]/div/div[1]/input',
  //   );
  //   await fenqu[0].click();
  //   const cascader1 = await page.$x(
  //     '/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[2]',
  //   );
  //   await cascader1[0].hover();
  //   const cascader2 = await page.$x(
  //     '/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[3]',
  //   );
  //   // debugger
};
