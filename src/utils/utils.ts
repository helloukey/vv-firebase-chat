const generateChatId = (
  uid1: string | undefined | null,
  uid2: string | undefined | null
) => {
  // Return empty string if uid1 and uid2 not available
  if (!uid1 || !uid2) {
    return "";
  }

  const ids = [uid1, uid2].sort();
  return `${ids[0]}_${ids[1]}`;
};

export { generateChatId };
