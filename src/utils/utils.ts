const generateChatId = (uid1: string, uid2: string) => {
  const ids = [uid1, uid2].sort();
  return `${ids[0]}_${ids[1]}`;
};

export { generateChatId };
