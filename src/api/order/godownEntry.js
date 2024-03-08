import request from '@/utils/request'

// 查询入库单列表
export function listGodownEntry(query) {
  return request({
    url: '/order/godownEntry/list',
    method: 'get',
    params: query
  })
}

// 查询入库单详细
export function getGodownEntry(id) {
  return request({
    url: '/order/godownEntry/' + id,
    method: 'get'
  })
}

// 新增入库单
export function addGodownEntry(data) {
  return request({
    url: '/order/godownEntry',
    method: 'post',
    data: data
  })
}

// 修改入库单
export function updateGodownEntry(data) {
  return request({
    url: '/order/godownEntry',
    method: 'put',
    data: data
  })
}

// 删除入库单
export function delGodownEntry(id) {
  return request({
    url: '/order/godownEntry/' + id,
    method: 'delete'
  })
}
export function importOrder(files, updateSupport) {
  var form = new FormData();
  for (var i = 0; i < files.length; i++) {
    form.append('file', files[i].raw);
  }
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
