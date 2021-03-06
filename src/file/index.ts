import { async } from "rxjs/internal/scheduler/async";

const fs = require("fs");
const path = require('path')
const url = path.join(__dirname, '../../public', 'index.html')
const ymxkxzurl = path.join(__dirname, '../../public', 'ymxkxzindex.html')
const yxwurl = path.join(__dirname, '../../public', 'yxwIndex.html')
const apiHref = path.join(__dirname, '../../public', 'apiHref.text')
const yxwHref = path.join(__dirname, '../../public', 'yxwHref.text')

export const getYXWIndexHtml = async function () {
  return new Promise(function (resolve, reject) {
    fs.readFile(yxwurl, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        console.log("yxw读取失败");
      }
    })
  })
}

export const creatYXWIndexHtml = async function (content, frist) {
  return new Promise(function (resolve, reject) {
    if (frist) {
      console.log("yxw清空文件");
      fs.unlink(yxwurl, function (err) {
        if (err) {
          return console.error(err);
        }
        fs.writeFile(yxwurl, content, function (err) {
          console.log("yxw文件新建成功！");
          if (err) {
            reject()
            return console.error(err);
          }
          resolve()
          console.log("yxw数据写入成功！");
        });
      });
    } else {
      fs.readFile(yxwurl, (err, data) => {
        if (!err) {
          fs.writeFile(yxwurl, data + content, function (err) {
            if (err) {
              reject()
              return console.error(err);
            }
            resolve()
            console.log("yxw数据写入成功！");
          });
        } else {
          console.log("yxw数据写入失败！");
        }
      })
    }
  })
}



export const getIndexHtml = async function (option) {
  return new Promise(function (resolve, reject) {
    fs.readFile(option ? ymxkxzurl : url, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        console.log("读取失败");
      }
    })
  })
}

export const creatIndexHtml = async function (content, frist, option) {
  return new Promise(function (resolve, reject) {
    if (frist) {
      console.log("清空文件");
      fs.unlink(option ? ymxkxzurl : url, function (err) {
        if (err) {
          return console.error(err);
        }
        fs.writeFile(option ? ymxkxzurl : url, content, function (err) {
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
      fs.readFile(option ? ymxkxzurl : url, (err, data) => {
        if (!err) {
          fs.writeFile(option ? ymxkxzurl : url, data + content, function (err) {
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


export const setAPiHrefText = async function (data) {
  return new Promise(function (resolve, reject) {
    fs.unlink(apiHref, function (err) {
      if (err) {
        return console.error(err);
      }
      fs.writeFile(apiHref, data, function (err) {
        if (err) {
          reject()
          return console.error(err);
        }
        resolve()
        console.log("apiHref写入成功！");
      });
    });
  })
}
export const getAPiHrefText = async function () {
  return new Promise(function (resolve, reject) {
    fs.readFile(apiHref, (err, data) => {
      if (!err) {
        resolve(data.toString())
      } else {
        console.log("apihref数据写入失败！");
      }
    })
  })
}


export const setHrefText = async function (data, name) {
  const href = path.join(__dirname, '../../public', `${name}.text`)
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


export const getHrefText = async function (name) {
  const href = path.join(__dirname, '../../public', `${name}.text`)
  return new Promise(function (resolve, reject) {
    fs.readFile(href, (err, data) => {
      if (!err) {
        resolve(data.toString())
      } else {
        console.log("href数据写入失败！");
      }
    })
  })
}


export const setYXWHrefText = async function (data) {
  return new Promise(function (resolve, reject) {
    fs.unlink(yxwHref, function (err) {
      if (err) {
        return console.error(err);
      }
      fs.writeFile(yxwHref, data, function (err) {
        if (err) {
          reject()
          return console.error(err);
        }
        resolve()
        console.log("yxwurl写入成功！");
      });
    });
  })
}


export const getYXWHrefText = async function () {
  return new Promise(function (resolve, reject) {
    fs.readFile(yxwHref, (err, data) => {
      if (!err) {
        resolve(data.toString())
      } else {
        console.log("yxwhref数据写入失败！");
      }
    })
  })
}