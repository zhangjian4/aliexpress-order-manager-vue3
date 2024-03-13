import { getPrintConfig, savePrintConfig } from '@/api/system/printConfig';
import * as CLodop from './clodop';
import * as HiPrint from './hiprint';

export function getInstance(type) {
  if (!type) {
    const config = getPrintConfig();
    type = config.type;
  }
  if (type === 'C-Lodop') {
    return CLodop;
  } else {
    return HiPrint;
  }
}

export function connect() {
  return getInstance().connect();
}

export function getPrinters() {
  return getInstance().getPrinters();
}

export function print(printer, url, options) {
  return getInstance().print(printer, url, options);
}

export function getPaperSizeInfo(printer) {
  return getInstance().getPaperSizeInfo(printer);
}

export function printHtml(printer, html, options) {
  return getInstance().printHtml(printer, html, options);
}
