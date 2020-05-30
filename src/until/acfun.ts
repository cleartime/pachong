export const setChannelId = function (data, name) {
  const result = {
    channelId: '110',
    realmId: '5'
  };
  let localItem = null;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.name.includes(name)) {
      result.channelId = item.channelId;
      localItem = item;
      break;
    }
  }
  if (localItem) {
    for (let j = 0; j < localItem.realms.length; j++) {
      const item = localItem.realms[j];
      if (item.realmName.includes(name)) {
        result.realmId = item.realmId;
        break;
      }
    }
  }
  return result;
};


export const getChannelId = function (data, title) {
  let _title = JSON.parse(JSON.stringify(title));
  if (_title.includes('单机') || _title.includes('Steam') || _title.includes('索尼') || _title.includes('PS5') || _title.includes('PS4') || _title.includes('任天堂')) {
    _title = '游戏杂谈'
  }
  if (_title.includes('lol') || _title.includes('lpl')) {
    _title = '英雄联盟'
  }
  if (_title.includes('手游')) {
    _title = '手机游戏'
  }
  const result = {
    channelIdIndex: 0,
    realmIdIndex: 0
  };
  data.forEach((item, index) => {
    item.realms.forEach((sitem, sindex) => {
      if (sitem.realmId === '5') {
        result.realmIdIndex = sindex;
        result.channelIdIndex = index;
      }
      if (_title.includes(sitem.realmName)) {
        result.realmIdIndex = sindex;
        result.channelIdIndex = index;
      }
    })
  });
  // for (let i = 0; i < data.length; i++) {
  //   const item = data[i];
  //   if (_title.includes(item.name)) {
  //     result.channelIdIndex = i;
  //     localItem = item;
  //     break;
  //   } else {
  //     if (item.channelId === '110') {
  //       result.channelIdIndex = i;
  //       localItem = item;
  //       continue
  //     }
  //   }
  // }
  // if (localItem) {
  //   for (let j = 0; j < localItem.realms.length; j++) {
  //     const item = localItem.realms[j];
  //     if (_title.includes(item.realmName)) {
  //       result.realmIdIndex = j;
  //       break;
  //     } else {
  //       if (item.realmId === '5') {
  //         result.realmIdIndex = j;
  //         continue
  //       }
  //     }
  //   }
  // }
  return result;
};

