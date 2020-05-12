const puppeteer = require('puppeteer');
import { creatIndexHtml, openIndexHtml } from '../file'

const config = {
  url: 'https://www.gamersky.com/ent/xz/',
  urlNews: 'https://www.gamersky.com/news/',
  urlEnt: 'https://www.gamersky.com/ent/',
  tag: '综合',
  prev: ''
}


const mapPage = async function (page, link, frist, end) {
  if (!link.href) return;
  await page.goto(link.href, {waitUntil: 'domcontentloaded'});
  const html = await page.evaluate(() => {
    let href = ''
    const des = 'div.Mid2L_ctt.block > div.Mid2L_con > p:nth-child(1)';
    const content = 'div.Mid2L_ctt.block > div.Mid2L_con'
    const nextPage = Array.from(document.querySelectorAll('.page_css b + a')).find(item => item);
    const hasnextPage = Array.from(document.querySelectorAll('.page_css a')).find(item => item.innerHTML === '下一页')
    if (hasnextPage) {
      href = (nextPage as any).href
    }
    return {
      des: document.querySelector(des).innerHTML.replace(/游民星空/g, 'Acfun'),
      content: document.querySelector(content).innerHTML.replace(/游民星空/g, 'Acfun'),
      href,
      hasnextPage
    };
  });
  if (!html.hasnextPage) {
    html.content += '<p><img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040894630third_party_b35465986.png">欢迎关注，收藏，香蕉<img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040895082third_party_b35465992.png"></p>'
  }
  creatIndexHtml(html.content, frist)
  if (html.hasnextPage) {
    end = false;
    await mapPage(page, html, false, end)
    return false
  }
  end = true;
  return html
}
export const getContent = async function () {
  console.log('打开ymxk网站');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    ignoreHTTPSErrors: true,
    headless: true,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000)
  await page.setJavaScriptEnabled(true);
  await page.goto(config.urlEnt, {waitUntil: 'domcontentloaded'});
  const link = await page.evaluate(() => {
    const title = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.tt').innerHTML.replace(/游民星空/g, 'Acfun')
    const href = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.tt').getAttribute('href')
    const tag = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.dh').innerHTML
    const id = href.match(/\d+/g).join()
    return {
      title,
      tag,
      href,
      id,
    };
  });
  if (config.prev === link.href) {
    await browser.close();
    console.log('关闭ymxk网站');
    return
  };
  config.prev = link.href;
  const end = true;
  const html = await mapPage(page, link, true, end)
  if (!end) return
  await openIndexHtml(page)
  await browser.close();
  console.log('关闭ymxk网站');
  return { ...config, ...link, ...html }
};
