<template>
  <div class="app-container">
    <div style="margin-bottom: 12px">
      <!-- 请先下载并运行
      <el-link
        type="primary"
        href="https://gitee.com/CcSimple/electron-hiprint/releases/download/1.0.9/hiprint_win_x64-1.0.9.exe"
        target="_blank"
        style="margin-right: 12px"
      >
        Hiprint
      </el-link> -->

      <el-button @click="reloadPrinter">重新加载打印机</el-button>
    </div>

    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="选择打印组件">
        <el-select v-model="form.type">
          <el-option label="HiPrint" value="HiPrint" />
          <el-option label="C-Lodop" value="C-Lodop" />
        </el-select>
        <el-link
          v-if="form.type === 'C-Lodop'"
          type="primary"
          href="https://demo.lodop.net:8443/Lodop6.226_Clodop6.580.zip"
          target="_blank"
          style="margin-right: 12px"
        >
          下载C-Lodop
        </el-link>
        <el-link
          v-if="form.type === 'HiPrint'"
          type="primary"
          href="https://gitee.com/CcSimple/electron-hiprint/releases/download/1.0.9/hiprint_win_x64-1.0.9.exe"
          target="_blank"
          style="margin-right: 12px"
        >
          下载Hiprint
        </el-link>
      </el-form-item>
      <el-form-item label="面单打印机">
        <el-select v-model="form.printer">
          <el-option
            v-for="printer in printers"
            :label="printer.name"
            :value="printer.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="货品条码打印机">
        <el-select v-model="form.tagPrinter">
          <el-option
            v-for="printer in printers"
            :label="printer.name"
            :value="printer.name"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="货品条码打印纸张">
        <el-select v-model="form.tagPaper">
          <el-option
            v-for="paper in papers"
            :label="paper.name"
            :value="paper.name"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import {
  getInstance,
  getPrinters,
  print,
  getPaperSizeInfo,
} from '@/utils/print';
import { getPrintConfig, savePrintConfig } from '@/api/system/printConfig';
import { reactive, ref } from 'vue';

const form = reactive({
  type: 'HiPrint',
  printer: '',
  tagPrinter: '',
});
const printConfig = getPrintConfig();
if (printConfig) {
  Object.assign(form, printConfig);
}

const onSubmit = () => {
  savePrintConfig(form);
};
const printers = ref([]);
async function reloadPrinter() {
  printers.value = await getInstance(form.type).getPrinters();
}
// reloadPrinter();
watch(
  () => form.type,
  () => {
    reloadPrinter();
  },
  { immediate: true }
);
const papers = ref([]);
async function reloadPages() {
  if (form.tagPrinter) {
    papers.value = await getInstance(form.type).getPaperSizeInfo(
      form.tagPrinter
    );
  }
}
watch(
  () => form.tagPrinter,
  (printer) => {
    reloadPages();
  },
  { immediate: true }
);
// print(
//   '',
//   'http://localhost/dev-api/profile/import/2024/03/08/cd9456fb-efe9-49e4-a820-68a584f3dc57.pdf'
// );
</script>
<style scoped lang="scss"></style>
