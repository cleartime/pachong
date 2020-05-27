
export const objMap = function(str) {
  const obj = {};
  const arr = str.split('&');
  arr.forEach(item => {
    const [key, value] = item.split('=');
    obj[key] = value;
  });
  return obj;
};


export const jsonMap = function(obj) {
  let str = '';
  for (const i in obj) {
    str += '&' + i + '=' + obj[i];
  }
  return (str = str.slice(1));
};

export const interceptedRequest  = async function(page, api, cb) {
  page.on('request', async req => {
    // 请求url为页面url时，覆写请求，放入数据
    if (req.resourceType() === 'xhr') {
      if (req.url() === api) {
        const obj = objMap(req._postData)
        const res = cb(obj)
        req.continue({
          postData: jsonMap(res)
        });
      }
    } else {
      req.continue();
    }
  });
}
