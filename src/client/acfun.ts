const puppeteer = require('puppeteer');
import { browserJSON, errorDeal } from './config'

const config = {
  account: '17095739373',
  password: 'Gxx562606139',
  url: 'https://www.acfun.cn/login/',
  articleUrl: 'https://member.acfun.cn/post-article',
  channelUrl: 'https://member.acfun.cn/common/api/getChannelList',
  postArticleApi: 'https://member.acfun.cn/article/api/postArticle',
};

export const acfunlogin = async function (option: any = {}) {
  const { title = '', des = '', content = '', id = '', tag } = option;
  if (!id) return
  console.log('打开acfun网站');
  const browser = await puppeteer.launch(browserJSON);
  const page = await browser.newPage();
  errorDeal(page, browser);
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

  await page.keyboard.down('Control');
  await page.keyboard.down('A');
  await page.keyboard.up('Control');
  await page.keyboard.up('C');

  console.log('输入标题');
  const tit = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input',
  );
  await tit[0].focus();
  await page.keyboard.type(title);
  console.log('选择分区');
  console.log(tag)
  const fenqu = await page.$(
    '.article-select-container .el-cascader .el-input__inner',
  );
  await fenqu.click();
  let cascader1, cascader2
  if (tag === '单机' || tag === '网游' || tag.includes('游戏')) {
    cascader1 = await page.$x(
      '/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[3]',
    );
    await cascader1[0].hover();
    cascader2 = await page.$x(
      '/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[1]',
    );
  } else if (tag === '动画' || tag === '漫画') {
    cascader1 = await page.$x(
      '/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[5]',
    );
    await cascader1[0].hover();
    cascader2 = await page.$x(
      '/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[1]',
    );
  } else {
    cascader1 = await page.$x(
      '/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[2]',
    );
    await cascader1[0].hover();
    cascader2 = await page.$x(
      '/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[3]',
    );
  }

  await cascader2[0].click();
  console.log('选择标签');
  const tag1 = await page.$('.video-input-box-val');
  await tag1.focus();
  await tag1.type('搞笑');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type('福利');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type('正能量');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type(tag);
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  console.log('输入简介');
  const description = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[6]/div[2]/div/div/div/textarea',
  );
  await description[0].focus();
  await page.keyboard.type(des.slice(0, 50));
  console.log('输入正文');
  await page.evaluate((content) => {
    const editor = document.querySelector('.ql-editor')
    if (editor) {
      editor.innerHTML = content
    }
  }, content);
  const submit = await page.$('.article-post-confirm.ivu-btn.ivu-btn-primary');
  await submit.focus();
  await page.screenshot({
    path: '1.png',
    fullPage: true
  });
  await submit.click();
  console.log('发布');
  await page.screenshot({
    path: '2.png',
    fullPage: true
  });
  await page.on('response', response => {
    if (response.url() === config.postArticleApi) {
      response.json().then(function (textBody) {
        console.log(textBody)
      });
    }
  });
  await browser.close();
  console.log('关闭acfun网站');
  // debugger
};
