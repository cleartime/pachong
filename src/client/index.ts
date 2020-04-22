const puppeteer = require('puppeteer');

const initialPage = 'https://statsregnskapet.dfo.no/departementer';
const selectors = [
  'div[id$="-bVMpYP"] article a',
  'div[id$="-KcazEUq"] article .dfo-widget-sm a',
];
export const login = async function() {
  debugger
  console.log('打开网站');
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    slowMo:250,
    timeout:0
  });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.goto('https://www.acfun.cn/login/');
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
  await page.waitFor(1000);
  //*[@id="header-guide"]/li[6]/div/ul/li[2]/a
  await page.goto('https://member.acfun.cn/post-article')
  // await page.screenshot({ path: 'example.png' });
  // await browser.close();
  // console.log('关闭网站');

  //延时函数
  // function sleep(delay) {
  // 	return new Promise((resolve, reject) => {
  // 		setTimeout(() => {
  // 			try {
  // 				resolve(1)
  // 			} catch (e) {
  // 				reject(0)
  // 			}
  // 		}, delay)
  // 	})
  // }

  // puppeteer.launch({
  // 	ignoreHTTPSErrors:true,
  // 	headless:false,slowMo:250,
  // 	timeout:0}).then(async browser => {

  // 	let page = await browser.newPage();
  // 	await page.setJavaScriptEnabled(true);
  // 	await page.goto("https://www.jd.com/");
  // 	const searchInput = await page.$("#key");
  // 	await searchInput.focus(); //定位到搜索框
  // 	await page.keyboard.type("手机");
  // 	const searchBtn = await page.$(".button");
  // 	await searchBtn.click();
  // 	await page.waitForSelector('.gl-item'); //等待元素加载之后，否则获取不异步加载的元素
  // 	const links = await page.$$eval('.gl-item > .gl-i-wrap > .p-img > a', links => {
  // 		return links.map(a => {
  // 			return {
  // 				href: a.href.trim(),
  // 				title: a.title
  // 			}
  // 		});
  // 	});
  // 	page.close();

  // 	const aTags = links.splice(0, 10);
  // 	for (let i = 1; i < aTags.length; i++) {
  // 		page = await browser.newPage()
  // 		page.setJavaScriptEnabled(true);
  // 		await page.setViewport({width:1920, height:1080});
  // 		const a = aTags[i];
  // 		await page.goto(a.href, {timeout:0}); //防止页面太长，加载超时

  // 		//注入代码，慢慢把滚动条滑到最底部，保证所有的元素被全部加载
  // 		let scrollEnable = true;
  // 		const scrollStep = 500; //每次滚动的步长
  // 		while (scrollEnable) {
  // 			scrollEnable = await page.evaluate((scrollStep) => {
  // 				const scrollTop = document.scrollingElement.scrollTop;
  // 				document.scrollingElement.scrollTop = scrollTop + scrollStep;
  // 				return document.body.clientHeight > scrollTop + 1080 ? true : false
  // 			}, scrollStep);
  // 			await sleep(100);
  // 		}
  // 		await page.waitForSelector("#footer-2014", {timeout:0}); //判断是否到达底部了
  // 		const filename = "images/items-"+i+".png";
  // 		//这里有个Puppeteer的bug一直没有解决，发现截图的高度最大只能是16384px， 超出部分被截掉了。
  // 		await page.screenshot({path:filename, fullPage:true});
  // 		page.close();
  // 	}

  // 	browser.close();
  // });
  // let selector;
  // let handles;
  // let handle;

  // const width = 1024;
  // const height = 1600;

  // const browser = await puppeteer.launch(
  // {
  //     'defaultViewport' : { 'width' : width,'height' : height }
  // });

  // const page = await browser.newPage();

  // page.setDefaultNavigationTimeout( 90000 );

  // await page.setViewport( { 'width' : width,'height' : height } );

  // await page.setUserAgent( 'UA-TEST' );

  // // Load first page

  // const stat = await page.goto( initialPage,{ 'waitUntil' : 'domcontentloaded' } );

  // // Click on selector 1 - works ok

  // selector = selectors[0];
  // await page.waitForSelector( selector );
  // handles = await page.$$( selector );
  // handle = handles[12];
  // console.log( 'Clicking on: ',await page.evaluate( el => el.href,handle ) );
  // await handle.click();  // OK

  // await page.waitForNavigation();

  // // Click that selector 2 - fails

  // selector = selectors[1];
  // await page.waitForSelector( selector );
  // handles = await page.$$( selector );
  // handle = handles[12];
  // console.log( 'Clicking on: ',handle );
  // await handle.click();

  // await page.waitForNavigation();

  // await browser.close();
};
