const puppeteer = require('puppeteer');

const config = {
  url: 'https://www.acfun.cn/login/',
  article_url: 'https://member.acfun.cn/post-article',
  capmoneycourses_Api: 'https://capuk.org/ajax_search/capmoneycourses'
}

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
  await page.goto(config.url);
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
  await page.goto(config.article_url);
  console.log('输入标题');
  const title = await page.$x('/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input');
  await title[0].focus();
  await page.keyboard.type();
  console.log('选择分区');
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
  await cascader2[0].click();
  console.log('选择标签');
  const tag1 = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[5]/div[2]/div[3]/div/div/div[6]',
  );
  await tag1[0].click();

  const tag2 = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[5]/div[2]/div[3]/div/div/div[7]',
  );
  await tag2[0].click();

  const tag3 = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[5]/div[2]/div[3]/div/div/div[8]',
  );
  await tag3[0].click();

  const tag4 = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[5]/div[2]/div[3]/div/div/div[9]',
  );
  await tag4[0].click();
  console.log('输入简介');
  
  const description  = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[6]/div[2]/div/div/div/textarea',
  );
   await description[0].focus();
  await page.keyboard.type();
  console.log('输入正文')
  const editor = await page.$('.ql-editor.ql-blank');
  await editor.focus();
  await page.keyboard.type();

  // debugger
};
