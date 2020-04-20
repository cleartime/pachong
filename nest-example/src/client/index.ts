const puppeteer = require('puppeteer');
 
const initialPage = 'https://statsregnskapet.dfo.no/departementer';
const selectors = [
  'div[id$="-bVMpYP"] article a','div[id$="-KcazEUq"] article .dfo-widget-sm a'
];
export const login = async function() {
  debugger
  // console.log(puppeteer);
  // console.log('打开网站');
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.goto('https://www.acfun.cn/login/');
  // await page.waitFor(100);
  // const account = await page.$('#ipt-account-login');
  // account.value = '17621218285';
  // await page.waitFor(100);
  // const pwd = await page.$('#ipt-pwd-login');
  // pwd.value = 'gxx562606139';
  // await page.waitFor(100);
  // await page.evaluate(()=> {
  //   const btn = document.querySelector('.btn-login');
  //   console.log(btn);
  // });
  // await page.waitFor(100);
  // await page.screenshot({ path: 'example.png' });
  // await browser.close();
  // console.log('关闭网站');

  let selector;
  let handles;
  let handle;

  const width = 1024;
  const height = 1600;

  const browser = await puppeteer.launch(
  {
      'defaultViewport' : { 'width' : width,'height' : height }
  });

  const page = await browser.newPage();

  page.setDefaultNavigationTimeout( 90000 );

  await page.setViewport( { 'width' : width,'height' : height } );

  await page.setUserAgent( 'UA-TEST' );

  // Load first page

  const stat = await page.goto( initialPage,{ 'waitUntil' : 'domcontentloaded' } );

  // Click on selector 1 - works ok

  selector = selectors[0];
  await page.waitForSelector( selector );
  handles = await page.$$( selector );
  handle = handles[12];
  console.log( 'Clicking on: ',await page.evaluate( el => el.href,handle ) );
  await handle.click();  // OK

  await page.waitForNavigation();

  // Click that selector 2 - fails

  selector = selectors[1];
  await page.waitForSelector( selector );
  handles = await page.$$( selector );
  handle = handles[12];
  console.log( 'Clicking on: ',handle );
  await handle.click();

  await page.waitForNavigation();

  await browser.close();
};