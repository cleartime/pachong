const puppeteer = require('puppeteer');
import { creatIndexHtml, setAPiHrefText, getAPiHrefText, getHrefText, setHrefText } from '../file'
import { browserJSON, errorDeal } from './config'


const config = {
  url: '',
  urlXz: 'https://www.gamersky.com/ent/xz/',
  urlNews: 'https://www.gamersky.com/news/',
  urlEnt: 'https://www.gamersky.com/ent/',
  tag: '综合',
  prev: ''
}


const mapPage = async function (page, link, frist, option) {
  if (!link.href) return;
  await page.goto(link.href, { waitUntil: 'domcontentloaded' });
  const html = await page.evaluate((config) => {
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
        totalPage = (arr[index - 1] as any).innerText
      }
    })
    Array.from(document.querySelectorAll('a')).forEach((item) => {
      item.href = ''
      if(item.innerText.includes('Steam商店链接') || item.innerText.includes('地址')){
        item.remove()
      }
    })
    Array.from(document.querySelectorAll('p')).forEach((item) => {
      if (item.innerText.includes('更多相关资讯请关')) {
        item.remove()
      }
    })
    Array.from(document.querySelectorAll('.page_css')).forEach((item) => (item as any).remove())
    const describe = (document.querySelector(des) as any).innerText.replace(/游民星空/g, 'Acfun')
    const content = document.querySelector(contentClass).innerHTML.replace(/游民星空/g, 'Acfun')
    return {
      time,
      localPage,
      totalPage,
      describe,
      content,
      href,
      hasnextPage
    };
  }, config);
  console.log(`${html.time}（${html.localPage}/${html.totalPage}）`)
  if (!html.des) {
    html.des = html.describe
  }
  if (!html.hasnextPage) {
    html.content += '<p><img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040894630third_party_b35465986.png">欢迎关注，收藏，香蕉<img style="max-width: 700px" class="emotion-icon ubb-emotion" src="https://ali2.a.yximgs.com/bs2/emotion/1587040895082third_party_b35465992.png"></p>'
  }
  await creatIndexHtml(html.content, frist, option)
  if (html.hasnextPage) {
    await mapPage(page, html, false, option)
  }
  return html
}
export const getContent = async function (option) {
  const apiHref: any = await getAPiHrefText();
  config.url = apiHref || config.urlNews;
  console.log('打开ymxk网站');
  const browser = await puppeteer.launch(browserJSON);
  const page = await browser.newPage();
  errorDeal(page, browser)
  page.setDefaultNavigationTimeout(0)
  await page.setJavaScriptEnabled(true);
  if (option) {
    config.url = config.urlXz
  }
  await page.goto(config.urlXz, { waitUntil: 'domcontentloaded' });
  await page.waitFor(1000);
  const link = await page.evaluate((config) => {
    let title, href, tag, id;
    if (config.url === config.urlXz) {
      title = document.querySelector('div.Mid2_L > ul > li:nth-child(1) > div.con > div.tit > a').innerHTML.replace(/游民星空/g, 'Acfun')
      href = document.querySelector('div.Mid2_L > ul > li:nth-child(1) > div.con > div.tit > a').getAttribute('href')
      tag = '福利'
      id = href.match(/\d+/g).join()
    }
    else if (config.url === config.urlNews) {
      title = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.tt').innerHTML.replace(/游民星空/g, 'Acfun')
      href = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.tt').getAttribute('href')
      tag = document.querySelector('body > div.Mid > div.Mid2 > div.Mid2_L > div.Mid2L_con.block > ul > li:nth-child(1) > div.tit > a.dh').innerHTML
      id = href.match(/\d+/g).join()

    }
    else if (config.url === config.urlEnt) {
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
  let prevHref
  if (config.url === config.urlXz) {
    prevHref = await getHrefText('urlXz')
  } else if (config.url === config.urlNews) {
    prevHref = await getHrefText('urlNews')
  } else if (config.url === config.urlEnt) {
    prevHref = await getHrefText('urlEnt')
  } else {
    prevHref = ''
  }
  console.log('当前分类' + config.url)
  console.log('上一个地址' + prevHref)
  console.log('当前地址' + link.href)
  if (!option) {
    if (prevHref === link.href) {
      if (config.url === config.urlXz) {
        await setAPiHrefText(config.urlNews)
      } else if (config.url === config.urlNews) {
        await setAPiHrefText(config.urlEnt)
      } else if (config.url === config.urlEnt) {
        await setAPiHrefText(config.urlXz)
      }
      await browser.close();
      console.log('关闭ymxk网站');
      return
    };
  }
  if (link.tag === '专栏') {
    await browser.close();
    console.log('关闭ymxk网站');
    return
  };
  console.log('当前标题是：' + link.title)
  if (config.url === config.urlXz) {
    await setHrefText(link.href, 'urlXz')
  } else if (config.url === config.urlNews) {
    await setHrefText(link.href, 'urlNews')
  } else if (config.url === config.urlEnt) {
    await setHrefText(link.href, 'urlEnt')
  }
  config.prev = link.href;
  const html = await mapPage(page, link, true, option)
  // await openIndexHtml(page)
  await browser.close();
  console.log('关闭ymxk网站');
  return { ...config, ...link, ...html }
};
