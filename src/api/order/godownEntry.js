import request from '@/utils/request';

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/order/godownEntry/list',
    method: 'get',
    params: query,
  });
}

// 查询订单详细
export function getOrder(id) {
  return request({
    url: '/order/godownEntry/' + id,
    method: 'get',
  });
}

// 新增订单
export function addOrder(data) {
  return request({
    url: '/order/godownEntry',
    method: 'post',
    data: data,
  });
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/order/godownEntry',
    method: 'put',
    data: data,
  });
}

// 删除订单
export function delOrder(id) {
  return request({
    url: '/order/godownEntry/' + id,
    method: 'delete',
  });
}

export function importOrder(excel, pdf, tagPdf, updateSupport) {
  var form = new FormData();
  form.append('excel', excel[0].raw);
  form.append('pdf', pdf[0].raw);
  form.append('tagPdf', tagPdf[0].raw);
  form.append('updateSupport', updateSupport);
  return request({
    url: '/order/godownEntry/importData',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 3600000,
    data: form,
  });
}

export function listByOrderId(orderId) {
  return request({
    url: '/order/godownEntry/listByOrderId',
    method: 'get',
    params: { orderId },
  });
}

export function setPrinted(id) {
  return request({
    url: '/order/godownEntry/setPrinted',
    method: 'post',
    params: { id },
  });
}
