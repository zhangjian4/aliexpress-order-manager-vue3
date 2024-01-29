<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
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
      <el-form-item label="文件名" prop="pdfName">
        <el-input
          v-model="queryParams.pdfName"
          placeholder="请输入文件名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="是否已打印" prop="printed">
        <el-input
          v-model="queryParams.printed"
          placeholder="请输入是否已打印"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="打印时间" prop="printedTime">
        <el-date-picker
          clearable
          v-model="queryParams.printedTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择打印时间"
        >
        </el-date-picker>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:collect_order:add']"
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
          v-hasPermi="['order:collect_order:edit']"
          >修改</el-button
        >
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order:collect_order:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['order:collect_order:import']"
          >导入</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="collect_orderList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="导入时间"
        align="center"
        width="160"
        prop="createTime"
      />
      <el-table-column label="PDF" align="center" prop="pdf">
        <template #default="scope">
          <el-link
            v-if="scope.row.pdf"
            type="primary"
            :href="baseUrl + scope.row.pdf"
            target="_blank"
            >{{ scope.row.pdfName }}</el-link
          >
        </template>
      </el-table-column>
      <!-- <el-table-column label="文件名" align="center" prop="pdfName" /> -->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <!-- <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['order:collect_order:edit']"
            >修改</el-button
          > -->
          <el-button
            v-if="scope.row.pdf"
            link
            type="primary"
            icon="Printer"
            @click="print(scope.row)"
            v-hasPermi="['order:order:print']"
            >打印</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['order:collect_order:remove']"
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

    <!-- 添加或修改揽收单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form
        ref="collect_orderRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="PDF" prop="pdf">
          <el-input v-model="form.pdf" placeholder="请输入PDF" />
        </el-form-item>
        <el-form-item label="文件名" prop="pdfName">
          <el-input v-model="form.pdfName" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="是否已打印" prop="printed">
          <el-input v-model="form.printed" placeholder="请输入是否已打印" />
        </el-form-item>
        <el-form-item label="打印时间" prop="printedTime">
          <el-date-picker
            clearable
            v-model="form.printedTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择打印时间"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        accept=".pdf"
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
            <span>仅允许导入pdf格式文件。</span>
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

<script setup name="Collect_order">
import {
  listCollect_order,
  getCollect_order,
  delCollect_order,
  addCollect_order,
  updateCollect_order,
  importOrder,
} from '@/api/order/collect_order';
import { getToken } from '@/utils/auth';
import { ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance();

const collect_orderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    pdf: null,
    pdfName: null,
    printed: null,
    printedTime: null,
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询揽收单列表 */
function getList() {
  loading.value = true;
  listCollect_order(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    collect_orderList.value = response.rows;
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
    createTime: null,
    pdf: null,
    pdfName: null,
    printed: null,
    printedTime: null,
  };
  proxy.resetForm('collect_orderRef');
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
  title.value = '添加揽收单';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getCollect_order(_id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = '修改揽收单';
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['collect_orderRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateCollect_order(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addCollect_order(form.value).then((response) => {
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
    .confirm('是否确认删除揽收单编号为"' + _ids + '"的数据项？')
    .then(function () {
      return delCollect_order(_ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
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

async function print(data) {
  const iframe = document.createElement('iframe');
  iframe.style.visibility = 'hidden';
  iframe.src = import.meta.env.VITE_APP_BASE_API + data.pdf;
  document.body.appendChild(iframe);
  iframe.addEventListener('load', function () {
    iframe.contentWindow.print();
    iframe.contentWindow.addEventListener('afterprint', function () {
      iframe.parentNode.removeChild(iframe);
    });
  });
}
getList();
</script>
