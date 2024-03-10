var ws_httpprinter = null;
var callbackMap = {};
import { ElMessage } from 'element-plus';
export function connect() {
  return new Promise((resolve, reject) => {
    if (ws_httpprinter == null || ws_httpprinter.readyState != WebSocket.OPEN) {
      if (window.WebSocket) {
        var ws_httpprinterPath = 'ws://localhost:12346';
        if (ws_httpprinterPath != null && ws_httpprinterPath != '') {
          ws_httpprinter = new WebSocket(ws_httpprinterPath);
          ws_httpprinter.onopen = function (event) {
            console.log('websocket连接成功...' + ws_httpprinterPath);
            resolve();
          };
          ws_httpprinter.onmessage = function (event) {
            //接收数据

            ///console.log("websocket接收数据(url解密后)：" + decodeURIComponent(event.data));
            //creatdiv(event.data, "服务端");
            // creatdiv(decodeURIComponent(event.data), '服务端');

            var data = JSON.parse(decodeURIComponent(event.data));
            console.log('websocket接收数据：', data);
            if (data.status !== 'ok') {
              ElMessage(data.data);
            }
            const callback = callbackMap[data.taskid];
            if (callback) {
              if (data.status == 'ok') {
                callback.resolve(data.data);
              } else {
                callback.reject(data.data);
              }
              delete callbackMap[data.taskid];
            }

            // if (data.method == 'getprinterlist' && data.status == 'ok') {
            //   //获取打印机列表

            //   //alert("打印成功:"+data.data);
            //   $('#PrinterS').empty();

            //   for (var o in data.data) {
            //     //alert(o);
            //     //alert(data.data[o]);
            //     var printname = data.data[o].name;
            //     //alert(printname);
            //     $('#PrinterS').append(
            //       "<option value='" + printname + "'>" + printname + '</option>'
            //     );
            //   }
            // }

            // if (data.method == 'pdfprint' && data.status == 'ok') {
            //   //下载并打印pdf文件
            //   alert('打印成功:' + data.data);
            // }
          };
          ws_httpprinter.onclose = function (event) {
            console.log('websocket关闭...' + ws_httpprinterPath);
            ws_httpprinter = null;
          };
          ws_httpprinter.onerror = function (event) {
            console.log('websocket异常...' + ws_httpprinterPath);
            ElMessage('HttpPrinter客户端未开启');
            reject(event);
          };
        } else {
          alert('请输入正确的websocket地址');
        }
      } else {
        alert('您的浏览器不支持WebSocket协议！');
      }
    } else {
      resolve();
    }
  });
}

//关闭WebSocket连接
function close() {
  if (ws_httpprinter != null && ws_httpprinter.readyState == WebSocket.OPEN) {
    ws_httpprinter.close();
  }
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

function send(msg) {
  return connect().then(() => {
    const taskid = getUUID();
    msg.token = 'aa';
    msg.taskid = taskid;
    console.log('send', msg);
    ws_httpprinter.send(encodeURIComponent(JSON.stringify(msg)));
    return new Promise((resolve, reject) => {
      callbackMap[taskid] = { resolve, reject };
    });
  });
}

export function getPrinters() {
  return send({
    method: 'getprinterlist',
    description: '获取打印机列表',
  });
}

export function print(printerName, url) {
  return send({
    method: 'pdfprint' /*事件 打印pdf pdfprint  */,
    description: '下载并打印pdf文件_download_and_print_pdf_file.html' /*描述*/,
    Preview:
      '0' /*可选。是否预览，和主界面设置的效果一样 为空默认不预览,   0：不预览，1：预览(弹出导出的pdf,jpg等文件)。*/,
    PdfUrl: url /*必填 pdf地址 从该地址自动下载*/,
    PrinterNameUrlEncode:
      '0' /*可选,默认 0  //PrinterName 是否进行了UrlEncode加密 0 无 1 有  */,
    PrinterName:
      printerName /*可选。指定打印机，为空的话 使用默认打印机, 请在 控制面板 -> 设备和打印机 中查看您的打印机的名称 */,
    PageLeft:
      '0' /*可选。左偏移，单位mm。纸张的水平方向上的偏移量，向右为正，向左为负。*/,
    PageTop:
      '0' /*可选。上偏移，单位mm。 纸张的垂直方向上的偏移量，向下为正，向上为负。*/,
    PaperSize:
      '' /*可选,默认为空,使用打印机驱动设置的默认纸张大小 。 页面类型:   A3 A4 A5 B4 B5 custom    */,
    PaperLength:
      '0' /*自定义页面高度: 当 PaperSize =  custom 时,才有效  单位mm 毫米*/,
    PaperWidth:
      '0' /*自定义页面宽度: 当 PaperSize =  custom 时,才有效   单位mm 毫米*/,
    Copies: '1' /*可选。打印份数:支持指定打印份数。默认1份*/,
    Orientation: '1' /*可选。方向：1=纵向，2=横向  。默认 1*/,
    FromPage: '1' /*可选。从第几页开始 */,
    ToPage: '0' /*可选。至从第几页结束    0 代表最后一页*/,
    Title: '' /*可选。文档的标题 */,
    PrintQuality:
      '1' /*   可选,。打印质量: 1 = 高, 2 = 中, 3 = 低, 4 = 草稿般的质量。 默认1 */,
    Color: '1' /* 可选,。颜色: 1 = 单色, 2 = 彩色  默认1 */,
    Duplex:
      '1' /* 可选,。双面打印:1 = 单面, 2 = 垂直双面 , 3 = 水平双面 。 默认 1*/,
    DefaultSource: '0' /*可选。默认来源（纸盘/纸盒）: 。*/,
    Collate:
      '1' /*保留,暂时不用。指定在打印多份拷贝的时候是否使用校对 : 0 = 否, 1 = 是 。 默认 1 */,
    MediaType:
      '1' /*保留,暂时不用。打印介质类型(纸张类型) 1=标准，2=透明度，3=光泽 。默认 1*/,
    PageScaling:
      '0' /*保留,暂时不用。默认 0 页面缩放 0=无(None)  1=适合纸张(Fit to paper) 2=缩小过大页面(Shrink large pages) */,
    AutoRotateCenter:
      '1' /*保留,暂时不用 默认1 自动旋转居中 0=不自动旋转页面(Do not rotate pages automatically) 1=旋转页面以适合输出介质，并在页面上居中(Rotate pages to fit on the output medium, and center on the page) -1=旋转页面以适合输出介质，并在页面上居中 但改为逆时针旋转(Rotate pages to fit on the output medium, and center on the page but rotate anticlockwise instead) */,
  });
}
