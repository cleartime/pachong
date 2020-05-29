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
  const result = {
    channelIdIndex: 0,
    realmIdIndex: 0
  };
  let localItem = null;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (title.includes(item.name)) {
      result.channelIdIndex = i;
      localItem = item;
      break;
    } else {
      if (item.channelId === '110') {
        result.channelIdIndex = i;
        localItem = item;
        continue
      }
    }
  }
  if (localItem) {
    for (let j = 0; j < localItem.realms.length; j++) {
      const item = localItem.realms[j];
      if (title.includes(item.realmName)) {
        result.realmIdIndex = j;
        break;
      } else {
        if (item.realmId === '5') {
          result.realmIdIndex = j;
          continue
        }
      }
    }
  }
  return result;
};

