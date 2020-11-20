const AipOcrClient = require('baidu-aip-sdk').ocr;
const fs = require('fs');
// 设置APPID/AK/SK
const APP_ID = '15563140';
const API_KEY = 'zlP76BOOMHiEhvjzPV1I9eDN';
const SECRET_KEY = 'c2pz9QdnolSLhmZjk49QNA9DL2tmutiK';

// 新建一个对象，建议只保存一个对象调用服务接口
const client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

export const getCode = async function(img) {
  const image = img.toString('base64');

  // 带参数调用通用文字识别, 图片参数为远程url图片
  const { words_result } = await client.accurateBasic(image, {
    language_type: 'ENG',
    detect_language: true,
  });
  // .then(function(result) {
  //   console.log(JSON.stringify(result));
  // })
  // .catch(function(err) {
  //   // 如果发生网络错误
  //   console.log(err);
  // });
  if (words_result && words_result.length) {
    return words_result[0] && words_result[0].words
  }
};
