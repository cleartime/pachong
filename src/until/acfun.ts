export const setChannelId = function(data, name) {
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
