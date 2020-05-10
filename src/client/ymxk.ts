const puppeteer = require('puppeteer');
import { creatIndexHtml, openIndexHtml } from '../file'

const config = {
  url: 'https://www.gamersky.com/ent/xz/',
  url_news: 'https://www.gamersky.com/news/',
  tag: '综合',
}


export const getContent = async function () {
  console.log('打开ymxk网站');
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--disable-extensions'],
    ignoreHTTPSErrors: true,
    headless: false,
    slowMo: 250,
    timeout: 0,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000)
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url_news);
  const link = await page.evaluate(() => {
    // const href = 'https://www.gamersky.com/ent/202005/1286899.shtml'
    const href = document.querySelector('div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.tt').getAttribute('href')
    const tag = document.querySelector('div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.dh').innerHTML
    const id = href.match(/\d+/g).join()
    return {
      tag,
      href,
      id,
    };
  });
  let end = true;
  const html = await mapPage(page, link, true, end)
  console.log(html)
  if (!end) return
  openIndexHtml(page)
  // await browser.close();
  console.log('关闭ymxk网站');
  return { ...config, ...link, ...html }
};

const mapPage = async function (page, link, frist, end) {
  if (!link.href) return;
  await page.goto(link.href);
  const html = await page.evaluate(() => {
    let href = ''
    const title = 'div.Mid2L_ctt.block > div.Mid2L_tit > h1';
    const des = 'div.Mid2L_ctt.block > div.Mid2L_con > p:nth-child(1)';
    const content = 'div.Mid2L_ctt.block > div.Mid2L_con'
    const nextPage = Array.from(document.querySelectorAll('.page_css b + a')).find(item => item);
    const hasnextPage = Array.from(document.querySelectorAll('.page_css a')).find(item => item.innerHTML === '下一页')
    if (hasnextPage) {
      href = (nextPage as any).href
    }
    return {
      title: document.querySelector(title).innerHTML.replace(/游民星空/g, 'Acfun'),
      des: document.querySelector(des).innerHTML.replace(/游民星空/g, 'Acfun'),
      content: document.querySelector(content).innerHTML.replace(/游民星空/g, 'Acfun'),
      href,
      hasnextPage
    };
  });
  creatIndexHtml(html.content, frist)
  if (html.hasnextPage) {
    end = false;
    await mapPage(page, html, false, end)
    return false
  }
  end = true;
  return html
}