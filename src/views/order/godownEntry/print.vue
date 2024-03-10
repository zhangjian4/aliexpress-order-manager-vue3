<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="入库单编号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入入库单编号"
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
      <el-table-column label="入库单编号" align="center" prop="orderId" />
      <el-table-column label="入库物流单" align="center" prop="postOrderId" />
      <el-table-column label="货品ID" align="center" prop="goodsId" />
      <el-table-column label="商品属性" align="center" prop="goodsProperties" />
      <el-table-column
        label="商品图片"
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
        label="计划数量"
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
        label="入库面单"
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
        label="货品标签"
        align="center"
        width="80"
        prop="goodsTag"
      >
        <template #default="scope">
          <el-link
            v-if="scope.row.goodsTag"
            type="primary"
            :href="baseUrl + scope.row.goodsTag"
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
            @click="printAll(scope.row)"
            v-hasPermi="['order:order:edit']"
            >打印全部</el-button
          >
          <el-button
            v-if="scope.row.goodsTag"
            link
            type="primary"
            icon="Printer"
            @click="printTag(scope.row)"
            v-hasPermi="['order:order:edit']"
            >打印标签</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="GodownEntryPrint">
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
} from '@/api/order/godownEntry';
import { connect, print } from '@/utils/print';
import { getPrintConfig, savePrintConfig } from '@/api/system/printConfig';
import { ElMessage } from 'element-plus';

const { proxy } = getCurrentInstance();
const router = useRouter();

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
          printAll(first);
        } else if (sum > 1) {
          if (lastId === first.id) {
            printAll(first);
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

async function printPdf(file, type, beforePrint) {
  const config = getPrintConfig();
  let printerName;
  if (type === 'tag') {
    printerName = config.tagPrinter;
    if (!printerName) {
      ElMessage('未设置货品条码打印机');
      router.push('/system/printConfig');
      throw new Error('未设置货品条码打印机');
    }
  } else {
    printerName = config.printer;
    if (!printerName) {
      ElMessage('未设置面单打印机');
      router.push('/system/printConfig');
      throw new Error('未设置面单打印机');
    }
  }
  const url = location.origin + import.meta.env.VITE_APP_BASE_API + file;
  if (beforePrint) {
    beforePrint();
  }
  print(printerName, url);
}
async function printAll(data) {
  await connect();
  await printPdf(data.postOrderImage, null, () => setPrinted(data.id));
  for (let item of orderList.value) {
    if ((item.id === data.id || item.parentId == data.id) && item.goodsTag) {
      for (let i = 0; i < data.goodsCount; i++) {
        await printPdf(item.goodsTag, 'tag');
      }
    }
  }
}

async function printTag(data) {
  await printPdf(data.goodsTag, 'tag');
}
</script>
