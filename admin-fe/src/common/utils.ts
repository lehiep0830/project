// Hàm tạo id ngắn, duy nhất
export function generateId(prefix = "id"): string {
  // Tạo id dựa trên thời gian và số ngẫu nhiên, có thể thêm prefix
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

export function EnumFromObject<T extends object>(obj: T) {
  return Object.freeze(
    Object.fromEntries(
      Object.keys(obj).map(key => [key, key])
    )
  ) as { [K in keyof T]: K }
}

export const camelToSnake = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

