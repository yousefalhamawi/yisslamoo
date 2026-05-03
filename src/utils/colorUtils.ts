
export const COLOR_MAP: Record<string, string> = {
  '#6C2BD9': 'أرجواني',
  '#EF4444': 'أحمر',
  '#F472B6': 'وردي',
  '#4B2C20': 'بني',
  '#111827': 'أسود',
  '#1E3A8A': 'أزرق',
  '#FFFFFF': 'أبيض',
  '#000000': 'أسود',
  '#030303': 'أسود',
  '#1A1A1A': 'أسود فاحم',
  '#333333': 'رمادي غامق جداً',
  '#F3F4F6': 'رمادي فاتح',
  '#9CA3AF': 'رمادي',
  '#4B5563': 'رمادي غامق',
  '#FFD700': 'ذهبي',
  '#F4D71A': 'ذهبي',
  '#D4AF37': 'ذهبي',
  '#FFDF00': 'ذهبي',
  '#C0C0C0': 'فضي',
  '#D3D3D3': 'فضي',
  '#E5E4E2': 'فضي',
  '#8D5858': 'خشبي',
  '#E51010': 'أحمر فاقع',
  '#FF0000': 'أحمر',
  '#00DBDB': 'فيروزي',
};

export const getColorHex = (colorStr: string): string => {
  if (!colorStr) return '';
  if (colorStr.includes(':')) {
    return colorStr.split(':')[0];
  }
  return colorStr;
};

export const getColorName = (colorStr: string): string => {
  if (!colorStr) return '';
  
  // Handle "hex:name" format
  if (colorStr.includes(':')) {
    const [, name] = colorStr.split(':');
    return name || colorStr.split(':')[0];
  }
  
  const upperHex = colorStr.toUpperCase();
  return COLOR_MAP[upperHex] || colorStr;
};
