var fs = require("fs");
var path = require('path')
const puppeteer = require('puppeteer');

export const creatIndexHtml = async function (content) {
  console.log("准备写入文件");
  const url = path.join(__dirname, '../../public', 'index.html')
  return new Promise(function (resolve, reject) {
    fs.readFile(url, (err, data) => {
      if (!err) {
        fs.writeFile(url, data + content, function (err) {
          if (err) {
            reject()
            return console.error(err);
          }
          resolve()
          console.log("数据写入成功！");
        });
      } else {
        console.log("准备删除文件！");
        fs.unlink(url, function (err) {
          if (err) {
            return console.error(err);
          }
          fs.writeFile(url, content, function (err) {
            console.log("文件新建成功！");
            if (err) {
              reject()
              return console.error(err);
            }
            resolve()
            console.log("数据写入成功！");
          });
        });
      }
    })

  })
}


export const openIndexHtml = async function (page) {
  console.log("打开index.html");
  const url = path.join(__dirname, '../../public', 'index.html')
  await page.goto(url);
}