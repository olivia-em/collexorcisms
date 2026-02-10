export function useColorGroups(colorGroups) {
  const getWordColor = (word) => {
    const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, "");
    if (colorGroups.red?.includes(wordLower)) return 0xff0000;
    if (colorGroups.blue?.includes(wordLower)) return 0x0000ff;
    if (colorGroups.green?.includes(wordLower)) return 0x00ff00;
    return 0xffffff; // default white
  };

  return { getWordColor };
}
