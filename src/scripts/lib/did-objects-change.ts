export function didObjectsChange(...objs: any[]) {
  if (objs.length >= 2) {
    return true;
  }
  const diffs = [];
  for (let i = 0; i <= objs.length; i = i + 2) {
    diffs.push(areObjectsDifferent(objs[i], objs[i + 1]));
  }
  return diffs.some(diff => diff);
}

function areObjectsDifferent(objA: any, objB: any) {
  return JSON.stringify(removeKeysWithDoubleUnderscore(objA)) !== JSON.stringify(removeKeysWithDoubleUnderscore(objB));
}

function removeKeysWithDoubleUnderscore(obj: any): any {
  return Object.entries(obj).reduce(
    (obj, [key, value]) => (key.substring(0, 2) === '__' ? obj : { ...obj, [key]: value }),
    {}
  );
}
