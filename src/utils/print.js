import { io } from 'socket.io-client';
import { ElMessage } from 'element-plus';
let socket = null;
let printers = null;
let printerListResolve = null;
var callbackMap = {};
export function connect() {
  console.log('connect');
  return new Promise((resolve, reject) => {
    if (socket == null) {
      socket = io('http://localhost:17521', {
        transports: ['websocket'],
        auth: {
          token: 'vue-plugin-hiprint', // 在此处填入你 client 设置的 token，缺省可留空
        },
      });

      socket.on('connect', () => {
        // globalThis.connect = true;
        resolve();
        // TODO: Do something for your project
      });
      socket.on('connect_error', function (data) {
        ElMessage('Hiprint未开启');
        reject(data);
        socket.close();
        socket = null;
      });
      socket.on('disconnect', (e) => {
        ElMessage('Hiprint已断开连接');
      });
      socket.on('clientInfo', (clientInfo) => {
        console.log(clientInfo);
      });

      socket.on('printerList', (printerList) => {
        console.log('printerList', printerList);
        if (printerListResolve) {
          printerListResolve(printerList);
          printerListResolve = null;
        }
      });
      socket.on('success', (res) => {
        if (res.replyId) {
          const callback = callbackMap[res.replyId];
          if (callback) {
            callback.resolve(res);
          }
        }
      });

      socket.on('error', (res) => {
        ElMessage(res.msg);
        if (res.replyId) {
          const callback = callbackMap[res.replyId];
          if (callback) {
            callback.reject(res);
          }
        }
      });
    } else {
      resolve();
    }
  });
}

export function getPrinters() {
  return new Promise((resolve, reject) => {
    printerListResolve = resolve;
    if (socket == null) {
      connect();
    } else {
      socket.emit('refreshPrinterList');
    }
  });
}

function getUUID(len, radix) {
  var chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [],
    i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

export function print(printer, pdf_path) {
  return connect().then(() => {
    return new Promise((resolve, reject) => {
      const replyId = getUUID();
      socket.emit('news', {
        replyId,
        printer,
        type: 'url_pdf',
        pdf_path,
      });
      callbackMap[replyId] = { resolve, reject };
    });
  });
}
