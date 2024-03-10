const key = 'printConfig';
export function getPrintConfig() {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  } else {
    return {};
  }
}

export function savePrintConfig(config) {
  if (config) {
    localStorage.setItem(key, JSON.stringify(config));
  }
}
