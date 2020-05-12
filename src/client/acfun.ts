const puppeteer = require('puppeteer');
const config = {
  account: '17095739373',
  password: 'Gxx562606139',
  url: 'https://www.acfun.cn/login/',
  articleUrl: 'https://member.acfun.cn/post-article',
  channelUrl: 'https://member.acfun.cn/common/api/getChannelList',
};

export const acfunlogin = async function(option: any = {}) {
  const { title = '', des = '', content = '', id = '' } = option;
  if(!id) return
  console.log('打开acfun网站');
  // https://segmentfault.com/a/1190000022057409?utm_source=tag-newest
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security， -- disable -extensions'],
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    ignoreHTTPSErrors: true,
    headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url, { waitUntil: 'domcontentloaded' });

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
  await page.goto(config.articleUrl, { waitUntil: 'domcontentloaded' });
  page.on('response', response => {
    if (response.url() === config.channelUrl) {
      response.json().then(function(textBody) {
        console.log(textBody[0]);
      });
    }
  });
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
  const tag1 = await page.$(
    'body > div.main.admin > div.upload-container > div.upload-content-body.clearfix > div > div > div > form > div.video-info-container.clearfix.tag-container > div.video-select-container.fl > div:nth-child(4) > div > div > div.video-upload-tag-item.fl.video-upload-tag-active',
  );
  await tag1.click();

  const tag2 = await page.$(
    'body > div.main.admin > div.upload-container > div.upload-content-body.clearfix > div > div > div > form > div.video-info-container.clearfix.tag-container > div.video-select-container.fl > div:nth-child(4) > div > div > div:nth-child(7)',
  );
  await tag2.click();

  const tag3 = await page.$(
    'body > div.main.admin > div.upload-container > div.upload-content-body.clearfix > div > div > div > form > div.video-info-container.clearfix.tag-container > div.video-select-container.fl > div:nth-child(4) > div > div > div:nth-child(8)',
  );
  await tag3.click();

  const tag4 = await page.$(
    'body > div.main.admin > div.upload-container > div.upload-content-body.clearfix > div > div > div > form > div.video-info-container.clearfix.tag-container > div.video-select-container.fl > div:nth-child(4) > div > div > div:nth-child(9)',
  );
  await tag4.click();
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
  // await submit.click();
  // await page.waitFor(10000);
  // await browser.close();
  console.log('关闭acfun网站');
  // debugger
};
