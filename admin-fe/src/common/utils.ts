export function EnumFromObject<T extends object>(obj: T) {
  return Object.freeze(
    Object.fromEntries(
      Object.keys(obj).map(key => [key, key])
    )
  ) as { [K in keyof T]: K }
}

export const camelToSnake = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();
