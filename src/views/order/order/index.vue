<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="110px"
    >
      <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="运单号" prop="postOrderId">
        <el-input
          v-model="queryParams.postOrderId"
          placeholder="请输入运单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单产品 - 属性" prop="goodsProperties">
        <el-input
          v-model="queryParams.goodsProperties"
          placeholder="请输入订单产品 - 属性"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['order:order:add']"
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
          v-hasPermi="['order:order:edit']"
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
          v-hasPermi="['order:order:remove']"
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
          v-hasPermi="['order:order:export']"
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
        label="订单产品 - 数量"
        align="center"
        prop="goodsCount"
      />
      <el-table-column label="发货面单" align="center" prop="postOrderImage">
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
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['order:order:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['order:order:remove']"
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
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="运单号" prop="postOrderId">
          <el-input v-model="form.postOrderId" placeholder="请输入运单号" />
        </el-form-item>
        <el-form-item label="订单产品 - 属性" prop="goodsProperties">
          <el-input
            v-model="form.goodsProperties"
            placeholder="请输入订单产品 - 属性"
          />
        </el-form-item>
        <el-form-item label="订单产品 - 图片-100" prop="goodsImage100">
          <image-upload v-model="form.goodsImage100" />
        </el-form-item>
        <el-form-item label="订单产品 - 数量" prop="goodsCount">
          <el-input
            v-model="form.goodsCount"
            placeholder="请输入订单产品 - 数量"
          />
        </el-form-item>
        <el-form-item label="发货面单" prop="postOrderImage">
          <file-upload v-model="form.postOrderImage"/>
        </el-form-item>
        <el-form-item label="关联订单" prop="parentId">
          <el-input v-model="form.parentId" placeholder="请输入关联订单" />
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
        ref="uploadRef"
        :limit="2"
        accept=".xlsx, .xls, .pdf"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        v-model:file-list="upload.fileList"
        multiple
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox
                v-model="upload.updateSupport"
              />是否覆盖已经存在的订单数据
            </div>
            <span>仅允许导入xls、xlsx、pdf格式文件。</span>
            <el-link
              type="primary"
              :underline="false"
              style="font-size: 12px; vertical-align: baseline"
              @click="importTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitFileForm"
            :loading="upload.isUploading"
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
} from '@/api/order/order';
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
  listOrder(queryParams.value).then((response) => {
    orderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
    'order/order/export',
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
  url: import.meta.env.VITE_APP_BASE_API + '/order/order/importData',
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
    'order/order/importTemplate',
    {},
    `user_template_${new Date().getTime()}.xlsx`
  );
}
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs['uploadRef'].handleRemove(file);
  ElMessageBox.alert(
    "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
      response.msg +
      '</div>',
    '导入结果',
    {
      // if you want to disable its autofocus
      // autofocus: false,
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
  getList();
};
/** 提交上传文件 */
async function submitFileForm() {
  if (upload.isUploading) {
    return;
  }
  upload.isUploading = true;
  try {
    const response = await importOrder(upload.fileList, upload.updateSupport);
    proxy.$refs['uploadRef'].clearFiles();
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
