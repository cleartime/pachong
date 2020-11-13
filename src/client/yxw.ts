const puppeteer = require('puppeteer');
import { creatYXWIndexHtml, setAPiHrefText, getAPiHrefText, getYXWHrefText, setYXWHrefText } from '../file'
import { browserJSON, errorDeal } from './config'


const config = {
  url: 'https://www.ali213.net/news/zl/',
  tag: '综合',
  prev: ''
}


const mapPage = async function (page, link, frist) {
  if (!link.href) return;
  await page.goto(link.href, { waitUntil: 'domcontentloaded' });
  const html = await page.evaluate((config) => {
    let href = ''
    let hasnextPage = false
    let totalPage = ''
    const contentClass = '#Content'
    const timeClass = '.newstag_l'
    const localPage = (document.querySelector('.currpage') as any) && (document.querySelector('.currpage') as any).innerText;
    const time = (document.querySelector(timeClass) as any) && (document.querySelector(timeClass) as any).innerText;
    href = (document.querySelector('.after_this_page') as any) && (document.querySelector('.after_this_page') as any).innerText;
    Array.from(document.querySelectorAll('a')).forEach((item) => {
      item.remove()
    })
    Array.from(document.querySelectorAll('p')).forEach((item) => {
      if(item.innerText.includes('更多相关资讯请关')){
        item.remove()
      }
    })
    Array.from(document.querySelectorAll('img')).forEach(item => {
        item.remove();
    });
    const content = document.querySelector(contentClass).innerHTML.replace(/游侠网/g, 'Acfun')
    Array.from(document.querySelectorAll('.page_fenye')).forEach((item) => (item as any).remove())
    Array.from(document.querySelectorAll('.n_show_b')).forEach((item) => (item as any).remove())
    return {
      time,
      localPage,
      totalPage,
      content,
      href,
      hasnextPage
    };
  }, config);
  console.log(`${html.time}（${html.localPage}/${html.totalPage}）`)
  if (!html.hasnextPage) {
    html.content += '<p>来源：搜狐网</p><p><img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040894630third_party_b35465986.png">欢迎关注，收藏，香蕉<img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040895082third_party_b35465992.png"></p>'
  }
  creatYXWIndexHtml(html.content, frist)
  if (html.hasnextPage) {
    await mapPage(page, html, false)
  }
  return html
}
export const getYxwContent = async function () {
  const prevHref: any = await getYXWHrefText();
  console.log('打开yxw网站');
  const browser = await puppeteer.launch(browserJSON);
  const page = await browser.newPage();
  errorDeal(page, browser)
  page.setDefaultNavigationTimeout(0)
  await page.setJavaScriptEnabled(true);
  await page.goto(config.url, { waitUntil: 'domcontentloaded' });
  await page.waitFor(1000);
  const link = await page.evaluate((config) => {
    let title, href, tag, id, des;
    title = (document.querySelector('#zlindex > div:nth-child(2) > div:nth-child(1) > div > a') as any).innerText.replace(/游侠网/g, 'Acfun')
    href = document.querySelector('#zlindex > div:nth-child(2) > div:nth-child(1) > div > a').getAttribute('href')
    des = (document.querySelector('#zlindex > div:nth-child(2) > div:nth-child(1) > div > p') as any).innerText
    tag = (document.querySelector('#zlindex > div:nth-child(2) > div:nth-child(1) > div > div > a') as any).innerText
    id = href.match(/\d+/g).join()
    return {
      title,
      tag,
      href,
      id,
      des
    };
  }, config);
  console.log('当前分类' + config.url)
  console.log('上一个地址' + prevHref)
  console.log('当前地址' + link.href)
  if (prevHref === link.href) {
    await browser.close();
    console.log('关闭ymxk网站');
    return
  };
  console.log('当前标题是：' + link.title)
  await setYXWHrefText(link.href)
  const html = await mapPage(page, link, true)
  // await openIndexHtml(page)
  await browser.close();
  console.log('关闭ymxk网站');
  return { ...config, ...link, ...html }
};
