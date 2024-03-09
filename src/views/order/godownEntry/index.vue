<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="入库单编号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入入库单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库物流单" prop="postOrderId">
        <el-input
          v-model="queryParams.postOrderId"
          placeholder="请输入入库物流单"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否已打印" prop="printed">
        <el-select
          v-model="queryParams.printed"
          placeholder="请选择是否已打印"
          clearable
          style="width: 196.4px"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="导入时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:godownEntry:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order:godownEntry:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:godownEntry:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['system:user:import']"
          >导入</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['order:godownEntry:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="orderList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="导入时间"
        align="center"
        width="160"
        prop="createTime"
      />
      <el-table-column label="入库单编号" align="center" prop="orderId" />
      <el-table-column label="入库物流单" align="center" prop="postOrderId" />
      <el-table-column label="货品ID" align="center" prop="goodsId" />
      <el-table-column label="商品属性" align="center" prop="goodsProperties" />
      <el-table-column
        label="商品图片"
        align="center"
        prop="goodsImage100"
        width="140"
      >
        <template #default="scope">
          <image-preview
            :src="scope.row.goodsImage100"
            :width="50"
            :height="50"
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
        label="是否已打印"
        align="center"
        width="90"
        prop="printed"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.printed" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['order:godownEntry:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['order:godownEntry:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改订单对话框 -->
    <el-dialog :title="title" v-model="open" width="720px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="入库单编号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入入库单编号" />
        </el-form-item>
        <el-form-item label="入库物流单" prop="postOrderId">
          <el-input v-model="form.postOrderId" placeholder="请输入入库物流单" />
        </el-form-item>
        <el-form-item label="货品ID" prop="goodsId">
          <el-input v-model="form.goodsId" placeholder="请输入入库物流单" />
        </el-form-item>
        <el-form-item label="商品属性" prop="goodsProperties">
          <el-input
            v-model="form.goodsProperties"
            placeholder="请输入商品属性"
          />
        </el-form-item>
        <el-form-item label="商品图片" prop="goodsImage100">
          <image-upload v-model="form.goodsImage100" />
        </el-form-item>
        <el-form-item label="计划数量" prop="goodsCount">
          <el-input v-model="form.goodsCount" placeholder="请输入计划数量" />
        </el-form-item>
        <el-form-item label="入库面单" prop="postOrderImage">
          <file-upload v-model="form.postOrderImage" />
        </el-form-item>
        <el-form-item label="关联入库单" prop="parentId">
          <el-input v-model="form.parentId" placeholder="请输入关联入库单" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 订单导入对话框 -->
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        :limit="1"
        accept=".xlsx, .xls"
        :auto-upload="false"
        v-model:file-list="upload.excel"
      >
        <el-button type="primary" :disabled="upload.excel?.length > 0"
          >上传入库单数据Excel</el-button
        >
      </el-upload>
      <el-upload
        :limit="1"
        accept=".pdf"
        :auto-upload="false"
        v-model:file-list="upload.pdf"
      >
        <el-button type="primary" :disabled="upload.pdf?.length > 0"
          >上传入库面单PDF</el-button
        >
      </el-upload>
      <el-upload
        :limit="1"
        accept=".pdf"
        :auto-upload="false"
        v-model:file-list="upload.tagPdf"
      >
        <el-button type="primary" :disabled="upload.tagPdf?.length > 0"
          >上传货品标签PDF</el-button
        >
      </el-upload>
      <div class="el-upload__tip text-center">
        <div class="el-upload__tip">
          <el-checkbox v-model="upload.updateSupport" />是否覆盖已经存在的数据
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitFileForm"
            :loading="upload.isUploading"
            :disabled="
              !upload.excel?.length ||
              !upload.pdf?.length ||
              !upload.tagPdf?.length
            "
            >确 定</el-button
          >
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
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
} from '@/api/order/godownEntry';
import { ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance();

const orderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const dateRange = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    storeName: null,
    postOrderId: null,
    goodsProperties: null,
    goodsImage100: null,
    goodsCount: null,
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单列表 */
function getList() {
  loading.value = true;
  listOrder(proxy.addDateRange(queryParams.value, dateRange.value)).then(
    (response) => {
      orderList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    }
  );
}

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

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm('queryRef');
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加订单';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getOrder(_id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改订单';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除订单编号为"' + _ids + '"的数据项？')
    .then(function () {
      return delOrder(_ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'order/godownEntry/export',
    {
      ...queryParams.value,
    },
    `order_${new Date().getTime()}.xlsx`
  );
}

/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: true,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/order/godownEntry/importData',
  fileList: [],
});
/** 导入按钮操作 */
function handleImport() {
  upload.title = '订单导入';
  upload.open = true;
}
/** 下载模板操作 */
function importTemplate() {
  proxy.download(
    'order/godownEntry/importTemplate',
    {},
    `user_template_${new Date().getTime()}.xlsx`
  );
}

/** 提交上传文件 */
async function submitFileForm() {
  if (upload.isUploading) {
    return;
  }
  upload.isUploading = true;
  try {
    const response = await importOrder(
      upload.excel,
      upload.pdf,
      upload.tagPdf,
      upload.updateSupport
    );
    upload.excel = [];
    upload.pdf = [];
    upload.tagPdf = [];
    ElMessageBox.alert(
      "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
        response.msg +
        '</div>',
      '导入结果',
      {
        // if you want to disable its autofocus
        // autofocus: false,
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
      }
    );
    // proxy.$alert(
    //   "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
    //     response.msg +
    //     '</div>',
    //   '导入结果',
    //   { dangerouslyUseHTMLString: true }
    // );
    upload.open = false;
    getList();
  } finally {
    upload.isUploading = false;
  }
}

getList();
</script>
