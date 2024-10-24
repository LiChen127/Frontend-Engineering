<script>
import { mapGetters } from 'vuex';
import { read, utils } from 'xlsx/xlsx.mjs';
import { getCityOptions, getDistrictOptions } from '@/utils/utils';
export default {
  name: 'ImportExcel',
  props: {
    tableList: {
      type: Array,
      default: () => [],
    },
    subjectList: {
      type: Array,
      default: () => [],
    },
    stageList: {
      type: Array,
      default: () => [],
    },
    // 地区级联选项
    areaOptions: {
      type: Array,
      default: () => [],
    },
    // 省
    provinceOptions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('org', ['orgUsers']),
    // 数据库查重
    // @todo: 后端提供全量查询api，父组件分页查询
    exitPhonesInDb() {
      const dupPhones = [];
      for (const item of this.excelData) {
        if (
          this.tableList
            ?.map(data => data?.username)
            .includes(String(item.username.value))
        ) {
          // 数据库 中 已有的手机号
          dupPhones.push(String(item.username.value));
        }
      }
      return [...new Set(dupPhones)];
    },
    // 列表查重
    exitPhonesInCurrentList() {
      const arr = JSON.parse(JSON.stringify(this.excelData));
      const countMap = {};
      arr
        .map(data => data.username.value)
        ?.forEach(item => {
          if (item) {
            if (countMap[item]) {
              countMap[item]++;
            } else {
              countMap[item] = 1;
            }
          }
        });
      // excel中 重复的手机号
      const dupPhones = Object.keys(countMap).filter(key => countMap[key] > 1);
      return dupPhones;
    },
  },
  data() {
    return {
      excelData: [],
      // 标头与索引、字段的映射关系
      labelMap: [
        {
          label: '姓名',
          field: 'nickname',
        },
        {
          label: '手机号',
          field: 'username',
        },
        {
          label: '省',
          field: 'province',
        },
        {
          label: '市',
          field: 'city',
        },
        {
          label: '区/县',
          field: 'district',
        },
        {
          label: '学段',
          field: 'stage',
        },
        {
          label: '学科',
          field: 'subject',
        },
        {
          label: '年级',
          field: 'grade',
        },
        {
          label: '学校',
          field: 'school',
        },
      ],
    };
  },
  methods: {
    // 用户下载模板
    async downloadTemplateFromOSS() {
      try {
        const fileUrl =
          'https://book-stable.oss-cn-shanghai.aliyuncs.com/%E6%89%B9%E9%87%8F%E6%B7%BB%E5%8A%A0%E6%95%99%E5%B8%88%E7%94%A8%E6%88%B7%E6%A8%A1%E7%89%88.xlsx';
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '批量添加教师用户模版.xlsx';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    },
    // 上传excel
    beforeUpload(file) {
      // 这里可以添加一些文件类型检查或大小限制的代码
      const isExcel =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        this.$message.error('上传文件只能是 Excel 格式!');
        return false;
      }
      return true;
    },
    handleChange(file, fileList) {
      const reader = new FileReader();
      reader.onload = e => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 }); // 假设第一行是标题行
        this.excelData = jsonData;
        // 进行一层format主要用于优化用户体验
        this.initExcelData();
        // 数据结构转换
        this.transferExcelData();
        // 每次excelData change之前进行一次校验
        this.validateExcelData();
        // 每次change的时候及时emit出去excelData
        this.$emit('changeData', this.excelData);
      };
      reader.readAsArrayBuffer(file.raw);
    },
    // 对用户导入的excel进行一层init，优化体验
    initExcelData() {
      // 移除所有列值全部是空字符的行
      this.excelData = this.excelData.filter(item => item.some(it => it));

      // 处理省市后缀
      this.excelData.forEach(item => {
        // 处理省份后缀
        if (/省$/.test(item[2]) && item[2].length > 1) {
          item[2] = item[2].replace(/省$/, '');
        }
        // 处理城市后缀
        if (/市$/.test(item[3]) && item[3].length > 1) {
          // 直辖市边界
          if (!(item[2] === item[3].slice(0, -1))) {
            item[3] = item[3].replace(/市$/, '');
          }
        }
      });
    },
    // 将传进来处理过的excelData处理成我们想要的数据结构
    transferExcelData() {
      // 去掉标头，优化处理
      this.excelData = JSON.parse(
        JSON.stringify(this.excelData.slice(1, this.excelData.length))
      );
      this.excelData = this.excelData.map(item => {
        return {
          nickname: {
            value: item[0],
            errMsg: '',
          },
          username: {
            value: String(item[1]),
            errMsg: '',
          },
          province: {
            value: item[2],
            errMsg: '',
          },
          city: {
            value: item[3],
            errMsg: '',
          },
          district: {
            value: item[4],
            errMsg: '',
          },
          subject: {
            value: item[5],
            errMsg: '',
          },
          stage: {
            value: item[6],
            errMsg: '',
          },
          grade: {
            value: item[7],
            errMsg: '',
          },
          school: {
            value: item[8],
            errMsg: '',
          },
          editStatus: {
            value: false,
            errMsg: '',
          },
        };
      });
    },
    // 错误校验字段
    /**
     * @param { int } row 当前校验的行索引
     * @param { string } key 当前校验的column_key
     */
    validateField(row, key) {
      // 不同字段分别处理，结果是判别是否change errMsg
      // 利用col_index -> labelMap -> 取到label 进行对应rule的validate
      const fieldMap = this.labelMap.find(item => item.field === key);
      // 标头名
      const label = fieldMap?.label;
      // 当前字段对应的value值
      const fieldValue = this.excelData[row][fieldMap.field].value;
      // 错误信息
      let errorMessage = '';
      if (
        label === '手机号' &&
        !/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(
          fieldValue
        )
      ) {
        errorMessage = '手机号格式错误';
      }
      if (
        label === '手机号' &&
        this.exitPhonesInCurrentList?.includes(String(fieldValue))
      ) {
        errorMessage = '重复的手机号码';
      }
      if (
        label === '手机号' &&
        this.exitPhonesInDb?.includes(String(fieldValue))
      ) {
        errorMessage = '当前用户已被注册';
      }
      if (
        label === '学科' &&
        !this.subjectList.map(item => item.cn_name).includes(String(fieldValue))
      ) {
        errorMessage = '学科格式错误';
      }
      if (
        label === '学段' &&
        !this.stageList.map(item => item.label).includes(String(fieldValue))
      ) {
        errorMessage = '学段格式错误';
      }
      if (
        label === '年级' &&
        !this.gradeOption(this.excelData[row].grade).includes(
          String(fieldValue)
        )
      ) {
        errorMessage = '年级格式错误';
      }
      if (['省', '市', '区/县'].includes(label)) {
        const [provinceInRules, cityInRules, districtInRules] =
          this.checkAreaInRules(
            this.excelData[row].province.value,
            this.excelData[row].city.value,
            this.excelData[row].district.value
          );
        if (label === '省' && !provinceInRules) {
          errorMessage = '省份填写不规范，请重新检查';
        }
        if (label === '市' && !cityInRules) {
          errorMessage = '市填写不规范，请重新检查';
        }
        if (label === '区/县' && !districtInRules) {
          errorMessage = '区/县填写不规范，请重新检查';
        }
      }
      // 如果有错误信息，就将它添加到当前data的errMsg中
      // 如果没有错误就更新
      if (errorMessage) {
        this.excelData[row][fieldMap.field].errMsg = errorMessage;
      } else {
        this.excelData[row][fieldMap.field].errMsg = '';
      }
    },
    // 对excelData整体错误校验
    validateExcelData() {
      for (const row in this.excelData) {
        // row 0 1 2 3
        for (const key in this.excelData[row]) {
          // col -> field_Key
          if (key !== 'editStatus') {
            this.validateField(Number(row), key);
          }
        }
      }
    },
    checkAreaInRules(province, city, district) {
      const provinceInRules = this.areaOptions.some(p => p.label === province);
      let cityInRules = false;
      let districtInRules = false;
      // 如果省份正确，检查城市
      if (provinceInRules) {
        cityInRules = this.areaOptions.some(p => {
          if (Array.isArray(p.children)) {
            return p.children.some(c => c.label === city);
          }
          // 没有子cihldren
          return true;
        });
      }
      // 如果城市正确，检查区县
      if (cityInRules) {
        districtInRules = this.areaOptions.some(p => {
          if (Array.isArray(p.children)) {
            p.children.some(c => {
              if (Array.isArray(c.children)) {
                return c.children.some(d => d.label === district);
              }
              // 没有子children
              return true;
            });
          }
          // 没有子children
          return true;
        });
      }
      // 如果省份不正确，也要检查城市是否存在于所有省份中
      if (!provinceInRules) {
        cityInRules = this.areaOptions.some(p => {
          if (Array.isArray(p.children)) {
            return p.children.some(c => c.label === city);
          }
          return true;
        });
      }
      // 如果城市不正确，也要检查区县是否存在于所有城市中
      if (!cityInRules) {
        districtInRules = this.areaOptions.some(p => {
          if (Array.isArray(p.children)) {
            p.children.some(c => {
              if (Array.isArray(c.children)) {
                return c.children.some(d => d.label === district);
              }
              return true;
            });
          }
          return true;
        });
      }
      return [provinceInRules, cityInRules, districtInRules];
    },
    gradeOption(stage) {
      if (stage === '小学') {
        return ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
      } else if (stage === '初中') {
        return ['七年级', '八年级', '九年级'];
      } else if (stage === '高中') {
        return ['高一', '高二', '高三'];
      }
      return [
        '一年级',
        '二年级',
        '三年级',
        '四年级',
        '五年级',
        '六年级',
        '七年级',
        '八年级',
        '九年级',
        '高一',
        '高二',
        '高三',
      ];
    },
    cityOptions(province) {
      const r = getCityOptions(province);
      return [...r].map(item => {
        return {
          label: item.label,
          value: item.label,
        };
      });
    },
    districtOptions(city) {
      const r = getDistrictOptions(city);
      return [...r].map(item => {
        return {
          label: item.label,
          value: item.label,
        };
      });
    },
    // 删除
    handleDelete(index) {
      // 确认删除操作
      this.$confirm('您在执行删除操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$nextTick(() => {
            this.excelData.splice(index, 1);
            this.validateExcelData();
            this.$emit('changeData', this.excelData);
          });
          this.$message({
            type: 'success',
            message: '删除成功!',
          });
        })
        .catch(() => {
          // 取消删除
          this.$message({
            type: 'info',
            message: '已取消删除',
          });
        });
    },
    // 编辑
    handleEdit(index) {
      this.excelData[index].editStatus.value = true;
    },
    // 确认编辑结果
    handleChangeExcelRow(index, values) {
      this.excelData[index].editStatus.value = false;
      Object.keys(values).forEach(key => {
        if (values[key].value !== this.excelData[index][key].value) {
          this.$set(this.excelData[index][key], 'value', values[key].value);
        }
      });
      // post之前整体校验
      this.validateExcelData();
      this.$emit('changeData', this.excelData);
    },
  },
};
</script>
<template>
  <div>
    <div
      style="
        text-decoration: underline;
        cursor: pointer;
        position: absolute;
        top: 18px;
        right: 50px;
      "
      @click="downloadTemplateFromOSS"
    >
      下载模版
    </div>
    <div style="display: flex; justify-content: center">
      <div>
        <el-upload
          class="upload-demo"
          action="#"
          :before-upload="beforeUpload"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleChange"
        >
          <div style="display: flex">
            <div
              slot="trigger"
              style="
                width: 440px;
                height: 50px;
                border-radius: 10px;
                border: 2px dashed #999;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
              "
            >
              <span v-if="excelData?.length">
                总计用户数量
                <span style="text-decoration: underline">
                  <b>{{ excelData.length }}</b>
                </span>
                ，存在数据问题用户
                <span style="text-decoration: underline; color: #f56c6c">
                  <b>
                    {{
                      excelData.filter(item =>
                        Object.values(item)
                          .map(i => i.errMsg)
                          .some(err => err)
                      ).length
                    }}
                  </b>
                </span>
                ，点击确认创建数量
                <span style="text-decoration: underline; color: green">
                  <b>
                    {{
                      excelData.length -
                      excelData.filter(item =>
                        Object.values(item)
                          .map(i => i.errMsg)
                          .some(err => err)
                      ).length
                    }}
                  </b>
                </span>
              </span>
              <span v-else>选择 Excel 文件</span>
            </div>
          </div>
        </el-upload>
      </div>
    </div>
    <div>
      <el-table
        v-if="excelData.length"
        :data="excelData"
        style="width: 100%"
        height="450"
      >
        <el-table-column
          label="序号"
          type="index"
          min-width="4%"
          align="center"
        >
          <!-- 这一行有没有错误信息，有错误red没错误green -->
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
            <i
              v-if="
                !Object.values(excelData[scope.$index])
                  .map(i => i.errMsg)
                  .some(err => err)
              "
              class="el-icon-check"
              style="
                color: green;
                position: absolute;
                top: 22px;
                left: 16px;
                font-size: 24px;
              "
            ></i>
            <i
              v-else
              class="el-icon-minus"
              style="
                color: red;
                position: absolute;
                top: 22px;
                left: 14px;
                font-size: 24px;
              "
            ></i>
          </template>
        </el-table-column>
        <el-table-column label="姓名" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['nickname'].value"
                placement="top"
                v-if="scope.row['nickname'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['nickname'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['nickname'].errMsg ? 'white' : '',
                    width: scope.row['nickname'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['nickname'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['nickname'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['nickname'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-input
                v-model="scope.row['nickname'].value"
                size="mini"
                style="width: 120px"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['username'].value"
                placement="top"
                v-if="scope.row['username'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['username'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['username'].errMsg ? 'white' : '',
                    width: scope.row['username'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['username'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['username'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['username'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-input
                v-model="scope.row['username'].value"
                size="mini"
                style="width: 120px"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="省" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['province'].value"
                placement="top"
                v-if="scope.row['province'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['province'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['province'].errMsg ? 'white' : '',
                    width: scope.row['province'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['city'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['province'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['province'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['province'].value" size="mini">
                <el-option
                  style="width: 140px"
                  v-for="item in provinceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="市" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['city'].value"
                placement="top"
                v-if="scope.row['city'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['city'].errMsg ? '#F56C6C' : '',
                    color: scope.row['city'].errMsg ? 'white' : '',
                    width: scope.row['city'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['city'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['city'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['city'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['city'].value" size="mini">
                <!-- 市 -->
                <el-option
                  v-for="item in cityOptions(scope.row['province']?.value)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="区/县" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['district'].value"
                placement="top"
                v-if="scope.row['district'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['district'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['district'].errMsg ? 'white' : '',
                    width: scope.row['district'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['district'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['district'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['district'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['city'].value" size="mini">
                <el-option
                  v-for="item in districtOptions(scope.row['city']?.value)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学段" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['stage'].value"
                placement="top"
                v-if="scope.row['stage'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['stage'].errMsg ? '#F56C6C' : '',
                    color: scope.row['stage'].errMsg ? 'white' : '',
                    width: scope.row['stage'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['stage'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['stage'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['stage'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['stage'].value" size="mini">
                <el-option
                  :label="item.label"
                  :value="item.label"
                  :key="item.value"
                  v-for="item in stageList"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="年级" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['grade'].value"
                placement="top"
                v-if="scope.row['grade'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['grade'].errMsg ? '#F56C6C' : '',
                    color: scope.row['grade'].errMsg ? 'white' : '',
                    width: scope.row['grade'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['grade'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['grade'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['grade'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['grade'].value" size="mini">
                <el-option
                  :label="item"
                  :value="item"
                  :key="item"
                  v-for="item in gradeOption(scope.row['stage'].value)"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学科" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['subject'].value"
                placement="top"
                v-if="scope.row['subject'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['subject'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['subject'].errMsg ? 'white' : '',
                    width: scope.row['subject'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['subject'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['subject'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['subject'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-select v-model="scope.row['subject'].value" size="mini">
                <el-option
                  :label="item.cn_name"
                  :value="item.cn_name"
                  :key="item.en_name"
                  v-for="item in subjectList"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学校" align="center">
          <template slot-scope="scope">
            <div v-if="!excelData[scope.$index].editStatus.value">
              <el-tooltip
                class="item"
                effect="light"
                :content="scope.row['school'].value"
                placement="top"
                v-if="scope.row['school'].value"
              >
                <div
                  style="display: flex; justify-content: center"
                  :style="{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '160px',
                    backgroundColor: scope.row['school'].errMsg
                      ? '#F56C6C'
                      : '',
                    color: scope.row['school'].errMsg ? 'white' : '',
                    width: scope.row['school'].errMsg ? '150px' : '100px',
                  }"
                >
                  <el-tooltip
                    v-if="scope.row['school'].errMsg"
                    class="item"
                    effect="light"
                    placement="right-start"
                  >
                    <template slot="content">
                      <span>
                        {{ scope.row['school'].errMsg }}
                      </span>
                    </template>
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  {{ scope.row['school'].value }}
                </div>
              </el-tooltip>
              <div v-else style="display: flex; justify-content: center">
                <div
                  style="color: white; background-color: #f56c6c; width: 100px"
                >
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="空值"
                    placement="right-start"
                  >
                    <i
                      class="el-icon-info"
                      style="color: white; cursor: pointer"
                    ></i>
                  </el-tooltip>
                  --
                </div>
              </div>
            </div>
            <div v-else>
              <el-input
                v-model="scope.row['school'].value"
                size="mini"
                style="width: 120px"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180px">
          <template slot-scope="scope">
            <div style="display: flex">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index)"
                type="primary"
                v-if="!excelData[scope.$index].editStatus.value"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                @click="handleChangeExcelRow(scope.$index, scope.row)"
                type="primary"
                v-else
              >
                确定
              </el-button>
              <el-button size="mini" @click="handleDelete(scope.$index)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-nickname-box {
  display: flex;
  align-items: center;

  .user-head {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
  }
}

.business {
  display: flex;
  height: 100%;
  overflow: hidden;
  padding: 20px;

  .business-menu {
    flex: none;
    width: 300px;
    border-right: 1px solid #e6e6e6;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .business-menu-header {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .menu-title {
        font-weight: 700;
      }
    }

    .org-list {
      flex: auto;
      overflow: auto;

      .org-item {
        padding: 0 20px;
        cursor: pointer;
        transition: all 0.1s;
        height: 56px;
        font-size: 14px;
        display: flex;
        align-items: center;
        overflow: hidden;

        &:hover {
          background-color: #ecf5ff;
        }

        .org-item-name {
          flex: auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .org-item-icons {
          flex: none;
          display: none;
        }

        &:hover .org-item-icons {
          display: unset;
        }
      }

      .act-org-item {
        color: #409eff;
      }
    }
  }

  .business-main {
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    padding: 0 20px;
    flex: auto;

    .main-header {
      flex: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;

      .main-title {
        font-weight: 700;
      }
    }

    .ops {
      .el-link {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }

  ::v-deep .el-dialog__wrapper {
    .el-textarea {
      textarea {
        max-height: 348px;
      }
    }

    .user-form {
      .el-form-item {
        .el-input {
          .el-input__inner {
            height: 30px;
            line-height: 30px;
            width: 200px;
          }
        }
      }
    }
  }

  .user-dialog {
    ::v-deep .el-dialog {
      .el-dialog__body {
        padding: 17px 0px;
      }

      .el-dialog__body {
        .el-input__inner {
          width: 360px !important;
        }
      }

      .el-dialog__footer {
        text-align: center;
      }
    }
  }
}

.book-library {
  ::v-deep .el-dialog__header {
    padding: 0px;
  }

  ::v-deep .el-dialog__body {
    padding: 0px;
  }

  ::v-deep .el-dialog {
    margin: 30px auto !important;
  }
}

::v-deep .el-dialog__body {
  padding-top: 0px;
}
</style>
