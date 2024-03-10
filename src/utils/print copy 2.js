function init() {
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
  return init().then(() => {
    var LODOP = getCLodop();
    console.log(LODOP);
    const count = LODOP.GET_PRINTER_COUNT();
    for (let i = 0; i < count; i++) {
      const name = LODOP.GET_PRINTER_NAME(i);
      console.log(name);
    }
    console.log(count);
  });
}

export function print(printerName, url) {
  return init().then(() => {
    var LODOP = getCLodop();
    LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', url);
    LODOP.PREVIEW();
  });
}
