const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = {
  account: '17095739373',
  password: 'Gxx562606139',
  url: 'https://www.acfun.cn/login/',
  article_url: 'https://member.acfun.cn/post-article',
  channel_url: 'https://member.acfun.cn/common/api/getChannelList',
  capmoneycourses_Api: 'https://capuk.org/ajax_search/capmoneycourses',
};

export const acfunlogin = async function(option: any = {}) {
  const { title = '', des = '', content = '', id = '' } = option;
  // if(!id) return
  console.log('打开acfun网站');
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url);
  await page.on('response', async response => {
    if (response.url() !== config.article_url) return;
    const res = await response.json()
    const re2 = await res
    console.log(re2);
  });
  // function getResponseBody(resolve, reject){
  //   page.on('response', async function(response){
  //        if(response.url().includes(config.article_url)){
  //             resolve(await response.text())
  //        }
  //   })
  // }
  // const res = await new Promise(getResponseBody)
  // console.log(res)
  const accountswitchx = await page.$x('//*[@id="login-account-switch"]');
  await accountswitchx[0].click();
  const account = await page.$('#ipt-account-login');
  await account.focus();
  await page.keyboard.type(config.account);
  const pwd = await page.$('#ipt-pwd-login');
  await pwd.focus();
  await page.keyboard.type(config.password);
  const btn = await page.$('.btn-login');
  await btn.click();
  console.log('登录');
  await page.waitFor(5000);
  await page.goto(config.article_url);
  console.log('输入标题');
  const tit = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input',
  );
  await tit[0].focus();
  await page.keyboard.type(title);
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

  const description = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[6]/div[2]/div/div/div/textarea',
  );
  await description[0].focus();
  await page.keyboard.type(des.slice(0, 50));
  console.log('输入正文');
  const editor = await page.$('.ql-editor.ql-blank');
  await editor.focus();
  await page.keyboard.down('Control');
  await page.keyboard.down('v');
  await page.keyboard.up('Control');
  await page.keyboard.up('v');
  // await page.keyboard.type(content);
  // const link = await page.evaluate((editor, content) => {
  //   editor.innerHtml = content
  // }, editor, content);
  const submit = await page.$('.article-post-confirm.ivu-btn.ivu-btn-primary');
  await submit.focus();
  await submit.click();
  await page.waitFor(10000);
  await browser.close();
  console.log('关闭acfun网站');
  // debugger
};
