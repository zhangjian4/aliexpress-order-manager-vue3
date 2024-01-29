<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          :disabled="!queryParams.orderId"
          @click="handleQuery"
          >搜索</el-button
        >
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="orderList">
      <el-table-column label="订单号" align="center" prop="orderId" />
      <el-table-column label="运单号" align="center" prop="postOrderId" />
      <el-table-column
        label="订单产品 - 属性"
        align="center"
        prop="goodsProperties"
      />
      <el-table-column
        label="订单产品 - 图片-100"
        align="center"
        prop="goodsImage100"
        width="175"
      >
        <template #default="scope">
          <image-preview
            v-if="scope.row.goodsImage100"
            :src="scope.row.goodsImage100"
            :width="150"
            :height="150"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="订单产品 - 数量"
        align="center"
        width="120"
        prop="goodsCount"
      >
        <template #default="scope">
          <el-tag
            :type="scope.row.goodsCount > 1 ? 'danger' : ''"
            effect="dark"
          >
            {{ scope.row.goodsCount }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="发货面单"
        align="center"
        width="80"
        prop="postOrderImage"
      >
        <template #default="scope">
          <el-link
            v-if="scope.row.postOrderImage"
            type="primary"
            :href="baseUrl + scope.row.postOrderImage"
            target="_blank"
            >查看</el-link
          >
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-if="scope.row.postOrderImage"
            link
            type="primary"
            icon="Printer"
            @click="print(scope.row)"
            v-hasPermi="['order:order:edit']"
            >打印</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="Order">
import { getToken } from '@/utils/auth';
import {
  listOrder,
  getOrder,
  delOrder,
  addOrder,
  updateOrder,
  importOrder,
  listByOrderId,
  setPrinted,
} from '@/api/order/order';

const { proxy } = getCurrentInstance();

const orderList = ref([]);
const open = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const data = reactive({
  form: {},
  queryParams: {
    orderId: null,
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

let lastId;

/** 查询订单列表 */
async function getList() {
  loading.value = true;
  try {
    if (queryParams.value.orderId) {
      const response = await listByOrderId(queryParams.value.orderId);
      orderList.value = response;
      if (response.length) {
        const first = response[0];
        const sum = response.reduce(
          (previousValue, currentValue) =>
            (previousValue += currentValue.goodsCount),
          0
        );
        if (sum === 1) {
          print(first);
        } else if (sum > 1) {
          if (lastId === first.id) {
            print(first);
          } else {
            lastId = first.id;
          }
        }
      } else {
        lastId = null;
      }
    } else {
      orderList.value = [];
    }
  } finally {
    loading.value = false;
    queryParams.value.orderId = '';
  }
}

// function getList() {
//   loading.value = true;
//   listOrder(queryParams.value).then((response) => {
//     orderList.value = response.rows;
//     total.value = response.total;
//     loading.value = false;
//   });
// }

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    orderId: null,
    storeName: null,
    postOrderId: null,
    goodsProperties: null,
    goodsImage100: null,
    goodsCount: null,
  };
  proxy.resetForm('orderRef');
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

async function print(data) {
  await setPrinted(data.id);
  const iframe = document.createElement('iframe');
  iframe.style.visibility = 'hidden';
  iframe.src = import.meta.env.VITE_APP_BASE_API + data.postOrderImage;
  document.body.appendChild(iframe);
  iframe.addEventListener('load', function () {
    iframe.contentWindow.print();
    iframe.contentWindow.addEventListener('afterprint', function () {
      iframe.parentNode.removeChild(iframe);
    });
  });
}
</script>
