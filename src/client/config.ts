export const browserJSON = {
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security， -- disable -extensions'],
  ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
  ignoreHTTPSErrors: true,
  headless: true,
  slowMo: 250,
  timeout: 0,
}


export const errorDeal = function (page, browser) {
  page.on('error', async function (err) {
    console.log(err);
    await browser.close()
  })
}