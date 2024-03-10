<template>
  <div class="app-container">
    <div style="margin-bottom: 12px;">
      <el-button @click="reloadPrinter">重新加载打印机</el-button>
    </div>
    
    <el-form :model="form" label-width="auto" style="max-width: 600px">
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
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { getPrinters, print } from '@/utils/print';
import { getPrintConfig, savePrintConfig } from '@/api/system/printConfig';
import { reactive, ref } from 'vue';

const form = reactive({
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
  printers.value = await getPrinters();
}
reloadPrinter();
// print(
//   '',
//   'http://localhost/dev-api/profile/import/2024/03/08/cd9456fb-efe9-49e4-a820-68a584f3dc57.pdf'
// );
</script>
<style scoped lang="scss"></style>
