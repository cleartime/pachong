const puppeteer = require('puppeteer');
import { creatIndexHtml, openIndexHtml, getHrefText, setHrefText } from '../file'
import { browserJSON, errorDeal } from './config'


const config = {
  url: '',
  urlXz: 'https://www.gamersky.com/ent/xz/',
  urlNews: 'https://www.gamersky.com/news/',
  urlEnt: 'https://www.gamersky.com/ent/',
  tag: '综合',
  prev: ''
}


const mapPage = async function (page, link, frist) {
  if (!link.href) return;
  await page.goto(link.href, { waitUntil: 'domcontentloaded' });
  const html = await page.evaluate(() => {
    let href = ''
    let hasnextPage = false
    let totalPage = ''
    const des = 'div.Mid2L_ctt.block > div.Mid2L_con > p:nth-child(1)';
    const contentClass = 'div.Mid2L_ctt.block > div.Mid2L_con'
    const timeClass = 'div.Mid2_L > div.Mid2L_ctt.block > div.Mid2L_tit .detail'
    const localPage = (document.querySelector('.page_css b') as any) && (document.querySelector('.page_css b') as any).innerText;
    const time = (document.querySelector(timeClass) as any) && (document.querySelector(timeClass) as any).innerText;
    document.querySelectorAll('.page_css a') && Array.from(document.querySelectorAll('.page_css a')).find((item: any, index, arr) => {
      if (item.innerHTML === '下一页') {
        hasnextPage = true;
        href = item.href;
        totalPage = (arr[index-1] as any).innerText
      }
    })
    const describe = (document.querySelector(des) as any).innerText.replace(/游民星空/g, 'Acfun')
    const content = document.querySelector(contentClass).innerHTML.replace(/游民星空/g, 'Acfun')
    Array.from(document.querySelectorAll('.page_css')).forEach((item) => (item as any).remove())
    if(config.url === config.urlNews) {
        Array.from(document.querySelectorAll('a')).forEach((item) => (item as any).remove())
    }
    return {
      time,
      localPage,
      totalPage,
      describe,
      content,
      href,
      hasnextPage
    };
  });
  console.log(`${html.time}（${html.localPage}/${html.totalPage}）`)
  if (!html.des) {
    html.des = html.describe
  }
  if (!html.hasnextPage) {
    html.content += '<p><img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040894630third_party_b35465986.png">欢迎关注，收藏，香蕉<img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040895082third_party_b35465992.png"></p>'
  }
  creatIndexHtml(html.content, frist)
  if (html.hasnextPage) {
    await mapPage(page, html, false)
  }
  return html
}
export const getContent = async function () {
  config.url = config.urlNews;
  console.log('打开ymxk网站');
  const browser = await puppeteer.launch(browserJSON);
  const page = await browser.newPage();
  errorDeal(page, browser)
  page.setDefaultNavigationTimeout(0)
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url, { waitUntil: 'domcontentloaded' });
  await page.waitFor(1000);
  const link = await page.evaluate((config) => {
    let title, href, tag, id;
    if (config.url === config.urlXz) {
      title = document.querySelector('div.Mid2_L > ul > li:nth-child(1) > div.con > div.tit > a').innerHTML.replace(/游民星空/g, 'Acfun')
      href = document.querySelector('div.Mid2_L > ul > li:nth-child(1) > div.con > div.tit > a').getAttribute('href')
      tag = '福利'
      id = href.match(/\d+/g).join()
    }
    if (config.url === config.urlNews) {
      title = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.tt').innerHTML.replace(/游民星空/g, 'Acfun')
      href = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.tt').getAttribute('href')
      tag = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.dh').innerHTML
      id = href.match(/\d+/g).join()

    }
    if (config.url === config.urlEnt) {
      title = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.tt').innerHTML.replace(/游民星空/g, 'Acfun')
      href = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.tt').getAttribute('href')
      tag = document.querySelector('div.Mid2_L ul > li:nth-child(2) > div.tit > a.dh').innerHTML
      id = href.match(/\d+/g).join()
    }
    return {
      title,
      tag,
      href,
      id,
    };
  }, config);
  const prevHref = await getHrefText()
  console.log('上一个地址' + prevHref)
  console.log('当前地址' + link.href)
  if (prevHref === link.href) {
    await browser.close();
    console.log('关闭ymxk网站');
    return
  };
  if (link.tag === '专栏') {
    await browser.close();
    console.log('关闭ymxk网站');
    return
  };
  console.log('当前标题是：' + link.title)
  await setHrefText(link.href)
  config.prev = link.href;
  const html = await mapPage(page, link, true)
  // await openIndexHtml(page)
  await browser.close();
  console.log('关闭ymxk网站');
  return { ...config, ...link, ...html }
};
