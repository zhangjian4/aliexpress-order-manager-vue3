import request from '@/utils/request'

// 查询揽收单列表
export function listCollect_order(query) {
  return request({
    url: '/order/collect_order/list',
    method: 'get',
    params: query
  })
}

// 查询揽收单详细
export function getCollect_order(id) {
  return request({
    url: '/order/collect_order/' + id,
    method: 'get'
  })
}

// 新增揽收单
export function addCollect_order(data) {
  return request({
    url: '/order/collect_order',
    method: 'post',
    data: data
  })
}

// 修改揽收单
export function updateCollect_order(data) {
  return request({
    url: '/order/collect_order',
    method: 'put',
    data: data
  })
}

// 删除揽收单
export function delCollect_order(id) {
  return request({
    url: '/order/collect_order/' + id,
    method: 'delete'
  })
}

export function importOrder(files) {
  var form = new FormData();
  for (var i = 0; i < files.length; i++) {
    form.append('file', files[i].raw);
  }
  return request({
    url: '/order/collect_order/importData',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 3600000,
    data: form,
  });
}