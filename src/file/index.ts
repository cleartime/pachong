import { async } from "rxjs/internal/scheduler/async";

const fs = require("fs");
const path = require('path')
const url = path.join(__dirname, '../../public', 'index.html')
const href = path.join(__dirname, '../../public', 'href.text')

export const creatIndexHtml = async function (content, frist) {
  return new Promise(function (resolve, reject) {
    if (frist) {
      console.log("清空文件");
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
    } else {
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
          console.log("数据写入失败！");
        }
      })
    }
  })
}


export const openIndexHtml = async function (page) {
  console.log("打开index.html");
  await page.goto('http://localhost:3000/public/index.html');
  await page.reload();
  await page.evaluate(() => {
    document.body.focus();
    Array.from(document.querySelectorAll('.page_css')).forEach((item) => (item as any).remove())
  });
  await page.keyboard.down('Control')
  await page.keyboard.down('A')
  await page.keyboard.up('Control')
  await page.keyboard.up('A')
  await page.keyboard.down('Control')
  await page.keyboard.down('c')
  await page.keyboard.up('Control')
  await page.keyboard.up('c')
}


export const setHrefText = async function (data) {
  return new Promise(function (resolve, reject) {
    fs.unlink(href, function (err) {
      if (err) {
        return console.error(err);
      }
      fs.writeFile(href, data, function (err) {
        if (err) {
          reject()
          return console.error(err);
        }
        resolve()
        console.log("url写入成功！");
      });
    });
  })
}


export const getHrefText = async function () {
  return new Promise(function (resolve, reject) {
    fs.readFile(href, (err, data) => {
      if (!err) {
        resolve(data.toString())
      } else {
        console.log("数据写入失败！");
      }
    })
  })
}
