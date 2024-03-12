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

export function print(printer, pdf_path, options) {
  return getInstance().print(printer, pdf_path, options);
}

export function getPaperSizeInfo(printer) {
  return getInstance().getPaperSizeInfo(printer);
}
