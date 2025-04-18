export const filterObj = <T extends Record<string, any>>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> => {
  const newObj: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    if (
      allowedFields.includes(key as keyof T) &&
      obj[key as keyof T] !== undefined &&
      obj[key as keyof T] !== null
    ) {
      newObj[key as keyof T] = obj[key as keyof T];
    }
  });

  return newObj;
};
