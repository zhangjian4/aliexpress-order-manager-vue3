import request from '@/utils/request';

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/order/order/list',
    method: 'get',
    params: query,
  });
}

// 查询订单详细
export function getOrder(id) {
  return request({
    url: '/order/order/' + id,
    method: 'get',
  });
}

// 新增订单
export function addOrder(data) {
  return request({
    url: '/order/order',
    method: 'post',
    data: data,
  });
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/order/order',
    method: 'put',
    data: data,
  });
}

// 删除订单
export function delOrder(id) {
  return request({
    url: '/order/order/' + id,
    method: 'delete',
  });
}

export function importOrder(files, updateSupport) {
  var form = new FormData();
  for (var i = 0; i < files.length; i++) {
    form.append('file', files[i].raw);
  }
  form.append('updateSupport', updateSupport);
  return request({
    url: '/order/order/importData',
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
    url: '/order/order/listByOrderId',
    method: 'get',
    params: { orderId },
  });
}

export function setPrinted(id) {
  return request({
    url: '/order/order/setPrinted',
    method: 'post',
    params: { id },
  });
}

