export function connect() {
  return new Promise((resolve, reject) => {
    if (window.getCLodop) {
      resolve();
    } else {
      var oscript = document.createElement('script');
      oscript.src = 'http://localhost:8000/CLodopfuncs.js?priority=1';
      oscript.onload = () => {
        resolve();
      };
      console.log(oscript);
      var head =
        document.head ||
        document.getElementsByTagName('head')[0] ||
        document.documentElement;
      head.insertBefore(oscript, head.firstChild);
    }
  });
}

export function getPrinters() {
  return connect().then(() => {
    var LODOP = getCLodop();
    LODOP.PRINT_INIT('');
    const count = LODOP.GET_PRINTER_COUNT();
    const list = [];
    for (let i = 0; i < count; i++) {
      const name = LODOP.GET_PRINTER_NAME(i);
      list.push({ name });
    }
    return list;
  });
}

export function getPaperSizeInfo(printerName) {
  return connect().then(() => {
    var LODOP = getCLodop();
    LODOP.PRINT_INIT('');
    const list = LODOP.GET_PAGESIZES_LIST(printerName, '\n');
    return list.split('\n').map((name) => ({ name }));
  });
}

export function print(printerName, url, options = {}) {
  return connect().then(() => {
    var LODOP = getCLodop();
    LODOP.PRINT_INIT('');
    LODOP.SET_PRINTER_INDEX(printerName);
    LODOP.SET_PRINT_PAGESIZE(
      0,
      options.width ?? 0,
      options.height ?? 0,
      options.paperName ?? ''
    );
    LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', url);
    LODOP.PRINT();
  });
}

export function printHtml(printerName, html, options = {}) {
  return connect().then(() => {
    var LODOP = getCLodop();
    LODOP.PRINT_INIT('');
    LODOP.SET_PRINTER_INDEX(printerName);
    LODOP.SET_PRINT_PAGESIZE(
      0,
      options.width ?? 0,
      options.height ?? 0,
      options.paperName ?? ''
    );
    LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', html);
    LODOP.PRINT();
  });
}
