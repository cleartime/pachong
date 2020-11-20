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
  let danjiArr = ['单机', 'Steam', '索尼', 'xbox', 'PS5', 'PS4', '任天堂', 'SWTICH', 'Stadia', '玩家', 'game'];
  let shouyouArr = ['手游'];
  let lolArr = ['lol', 'lpl', 'lck'];
  let mietuArr = ['桌面截图'];
  danjiArr.forEach(item => {
    if (_title.includes(item)) {
      _title = '游戏杂谈'
    }
  })
  lolArr.forEach(item => {
    if (_title.includes(item)) {
      _title = '英雄联盟'
    }
  })
  shouyouArr.forEach(item => {
    if (_title.includes(item)) {
      _title = '手机游戏'
    }
  })
  mietuArr.forEach(item => {
    if (_title.includes(item)) {
      _title = '美图分享'
    }
  })
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

