const puppeteer = require('puppeteer');
import { browserJSON, errorDeal } from './config';
import { interceptedRequest } from '../until/index';
import { getChannelId } from '../until/acfun';

const config = {
  account: '17095739373',
  password: 'Gxx562606139',
  url: 'https://www.acfun.cn/login/',
  articleUrl: 'https://member.acfun.cn/post-article',
  channelUrl: 'https://member.acfun.cn/common/api/getChannelList',
  postArticleApi: 'https://member.acfun.cn/article/api/postArticle',
  getRecommTagApi: 'https://member.acfun.cn/video/api/getRecommTag',
};

export const acfunlogin = async function (option: any = {}) {
  const { title = '', des = '', content = '', id = '', tag } = option;
  if (!id) return;
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
  let channelList;
  await page.on('response', response => {
    if (response.url() === config.channelUrl) {
      response.json().then(function (textBody) {
        channelList = textBody;
      });
    }
  });
  console.log('输入标题');
  const tit = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[1]/div[2]/div[2]/div/div[1]/input',
  );
  await tit[0].focus();
  await page.keyboard.type('1');
  console.log('选择分区');
  console.log(tag);
  const fenqu = await page.$(
    '.article-select-container .el-cascader .el-input__inner',
  );
  await fenqu.click();
  let cascader1, cascader2;
  const { channelIdIndex, realmIdIndex } = getChannelId(channelList[0].children, title)
  cascader1 = await page.$x(
    `/html/body/div[4]/div[1]/div[1]/div[1]/ul/li[${channelIdIndex + 1}]`,
  );
  await cascader1[0].hover();
  cascader2 = await page.$x(
    `/html/body/div[4]/div[1]/div[2]/div[1]/ul/li[${realmIdIndex + 1}]`,
  );
  await cascader2[0].click();
  let getRecommTagApi;
  await page.on('response', async response => {
    if (response.url() === config.getRecommTagApi) {
      await response.json().then(function (textBody) {
        getRecommTagApi = textBody;
      });
    }
  });
  await page.waitFor(3000);
  console.log('选择标签');
  const tagName = getRecommTagApi && getRecommTagApi.recommend
  const tag1 = await page.$('.video-input-box-val');
  await tag1.focus();
  await tag1.type(tagName && tagName[tagName.length-1].tagName || '搞笑');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type(tagName && tagName[tagName.length-2].tagName || '搞笑');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type(tagName && tagName[tagName.length-3].tagName || '搞笑');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await tag1.type(tagName && tagName[tagName.length-4].tagName || tag);
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  console.log('输入简介');
  const description = await page.$x(
    '/html/body/div[1]/div[2]/div[2]/div/div/div/form/div[6]/div[2]/div/div/div/textarea',
  );
  await description[0].focus();
  await page.keyboard.type(des.slice(0, 50));
  console.log('输入正文');
  await page.evaluate(content => {
    const editor = document.querySelector('.ql-editor');
    if (editor) {
      editor.innerHTML = content;
    }
  }, content);
  const submit = await page.$('.article-post-confirm.ivu-btn.ivu-btn-primary');
  await submit.focus();
  // await page.screenshot({
  //   path: '1.png',
  //   fullPage: true,
  // });
  // await page.setRequestInterception(true);

  // interceptedRequest(page, config.postArticleApi, function(json) {
  //   const channel = setChannelId(channelList, tag);
  //   json.channelId = channel.channelId;
  //   json.realmId = channel.realmId;
  //   json.title = title;
  //   return json;
  // });
  await submit.click();
  console.log('发布');

  await browser.close();
  console.log('关闭acfun网站');
  // debugger
};
