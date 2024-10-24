<template>
  <div class="business" v-loading="!isReady" v-if="!isReady"></div>
  <div class="business" v-else>
    <div class="business-main" v-if="actBusiness">
      <div class="main-header">
        <div class="main-title">教师成员· {{ tableList.length }}</div>
        <div>
          <el-button
            icon="el-icon-plus"
            size="mini"
            type="primary"
            style="margin-right: 10px"
            @click="handleResetSelected"
          >
            清空筛选项
          </el-button>
          <el-button
            icon="el-icon-plus"
            size="mini"
            type="primary"
            style="margin-right: 10px"
            v-if="actBusiness.isAdmin || actBusiness.isOwner"
            @click="handleOpen"
          >
            添加教师
          </el-button>
          <el-button
            icon="el-icon-position"
            size="mini"
            type="primary"
            style="margin-right: 10px"
            v-if="actBusiness.isAdmin || actBusiness.isOwner"
            @click="exportExcel"
          >
            导出excel
          </el-button>
        </div>
      </div>
      <el-table
        :key="refresh"
        :data="tableData"
        style="width: 100%"
        height="calc(100% - 50px)"
        ref="table"
        class="teacher-user-table"
      >
        <el-table-column
          label="姓名"
          width="120"
          :show-overflow-tooltip="true"
          fixed
          align="center"
        >
          <template slot-scope="scope">
            <div class="user-nickname-box">
              <el-tag
                v-if="scope.row?.isActive === 0"
                type="danger"
                size="mini"
                style="margin: 5px 8px 5px -4px"
              >
                禁用
              </el-tag>
              <img
                v-if="scope.row?.isActive !== 0"
                src="../../assets/visitor.jpg"
                alt
                class="user-head"
              />
              <span
                :style="{ color: scope.row?.isActive === 0 ? '#f56c6c' : '' }"
                class="text-truncate"
              >
                {{ scope.row.nickname }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="手机号"
          width="115"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <div class="text-truncate">
              {{ scope.row.username || '--' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="学校名称"
          width="120"
          :show-overflow-tooltip="true"
          align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.school" class="text-truncate">
              {{ scope.row.school }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="学段"
          width="90"
          :show-overflow-tooltip="true"
          align="center"
        >
          <template #header>
            <el-select
              v-model="selects.stage"
              filterable
              size="mini"
              placeholder="学段"
              @change="handlestageChange(selects.stage)"
            >
              <el-option
                v-for="item in stageOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.stage" class="text-truncate">
              {{ getStageChineseName(scope.row.stage) }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="sss"
          width="100"
          :show-overflow-tooltip="true"
          align="center"
        >
          <template #header>
            <el-select
              v-model="selects.grade"
              filterable
              size="mini"
              placeholder="年级"
            >
              <el-option
                v-for="item in gradeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.grade" class="text-truncate">
              {{ scope.row.grade }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="学科"
          width="120"
          :show-overflow-tooltip="true"
          align="center"
        >
          <template #header>
            <el-select
              v-model="selects.subject"
              filterable
              multiple
              size="mini"
              placeholder="学科"
            >
              <el-option
                v-for="item in subjectList"
                :key="item.en_name"
                :label="item.cn_name"
                :value="item.en_name"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.subject" class="text-truncate">
              {{
                scope.row.subject
                  .split(',')
                  .map(item => getSubjectChineseName(item))
                  .join(',')
              }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="省"
          align="center"
          :width="maxWidth.maxProvinceWidth"
          class="column-padding"
        >
          <template #header>
            <el-select
              v-model="selects.province"
              filterable
              size="mini"
              placeholder="省"
              @change="handleProvinceChange"
            >
              <el-option
                v-for="item in provinceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div>
              {{ getAreaMessage('province', scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="市"
          align="center"
          :width="maxWidth.maxCityWidth"
        >
          <template #header>
            <el-select
              v-model="selects.city"
              filterable
              size="mini"
              placeholder="市"
              @change="handleCityChange"
            >
              <el-option
                v-for="item in cityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div>
              {{ getAreaMessage('city', scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="区/县"
          align="center"
          :width="maxWidth.maxDistrictWidth"
        >
          <template #header>
            <el-select
              v-model="selects.district"
              filterable
              size="mini"
              placeholder="区/县"
            >
              <el-option
                v-for="item in districtOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
          <template slot-scope="scope">
            <div>
              {{ getAreaMessage('district', scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="100"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <div>
              {{ new Date(scope.row.createTime).getFullYear() }}-{{
                (new Date(scope.row.createTime).getMonth() + 1)
                  .toString()
                  .padStart(2, '0')
              }}-{{
                new Date(scope.row.createTime)
                  .getDate()
                  .toString()
                  .padStart(2, '0')
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="已配置图书数" width="120" align="center">
          <template slot-scope="scope">
            <div>
              {{ scope.row.project_limit.length }}
            </div>
          </template>
        </el-table-column>
        <el-table-column width="200" fixed="right">
          <template slot="header" slot-scope="scope">
            <div v-if="false">{{ scope }}</div>
            <el-input
              v-model="usersSearch"
              size="mini"
              placeholder="输入姓名\手机号搜索"
            />
          </template>
          <template slot-scope="scope">
            <div class="flex a-center j-center">
              <div class="ops">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="showEditUserDialog(scope.row)"
                >
                  配置
                </el-link>
                <el-link
                  type="primary"
                  :underline="false"
                  :disabled="!scope.row.username"
                  @click="resetPassword(scope.row)"
                >
                  重置密码
                </el-link>
                <el-link
                  type="danger"
                  :underline="false"
                  v-if="!scope.row.isOwner"
                  @click="deleteUserFromOrg(scope.row)"
                >
                  移除
                </el-link>
                <el-link
                  type="info"
                  :underline="false"
                  v-if="!scope.row.isOwner && scope.row?.isActive !== 0"
                  @click="disableTeacher(scope.row, false)"
                >
                  禁用
                </el-link>
                <el-link
                  type="info"
                  :underline="false"
                  v-if="!scope.row.isOwner && scope.row?.isActive == 0"
                  @click="disableTeacher(scope.row, true)"
                >
                  解除禁用
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div
        style="
          width: 100%;
          height: 40px;
          padding-top: 15px;
          display: flex;
          justify-content: center;
          align-content: center;
        "
      >
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="curPage"
          @size-change="handleSizeChange"
          :page-sizes="[50, 100, 200]"
          :page-size="curSize"
          layout="sizes, prev, pager, next"
          small="small"
          :total="
            tableList.filter(
              data =>
                !usersSearch ||
                data.nickname.toLowerCase().includes(usersSearch.toLowerCase())
            ).length
          "
        ></el-pagination>
      </div>
    </div>
    <el-dialog
      title="批量添加成员"
      :visible.sync="addUserDialog"
      :width="radio === 2 ? '95%' : '35%'"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleCancel"
      destroy-on-close
    >
      <div style="margin-bottom: 20px; display: flex; justify-content: center">
        <el-radio v-model="radio" :label="1">单个添加用户信息</el-radio>
        <el-radio v-model="radio" :label="2">批量导入用户信息</el-radio>
      </div>
      <div v-if="radio === 1" style="display: flex; justify-content: center">
        <div>
          <el-form
            ref="form"
            class="user-form2"
            :model="userForm"
            label-width="80px"
            v-if="!actUser"
            style="margin-left: -30px"
          >
            <el-form-item
              label="姓名"
              :rules="[{ required: true, message: '姓名不能为空' }]"
            >
              <el-input
                v-model.trim="userForm.nickname"
                placeholder="请填写姓名"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="手机"
              :rules="[{ required: true, message: '手机号不能为空' }]"
            >
              <el-input
                v-model.trim="userForm.phone"
                placeholder="请填写手机号"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="学科"
              :rules="[{ required: true, message: '学科不能为空' }]"
            >
              <el-select
                v-model="userForm.subject"
                placeholder="请选择学科"
                multiple
                filterable
              >
                <el-option
                  :label="item.cn_name"
                  :value="item.en_name"
                  v-for="item in subjectList"
                  :key="item.en_name"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="学段"
              :rules="[{ required: true, message: '学段不能为空' }]"
            >
              <el-select
                v-model="userForm.stage"
                placeholder="请选择学段"
                @change="handlestageChange(userForm.stage)"
              >
                <el-option
                  :label="item.label"
                  :value="item.value"
                  v-for="item in stageOptions"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="年级"
              :rules="[{ required: true, message: '年级不能为空' }]"
            >
              <el-select
                v-model="userForm.grade"
                filterable
                placeholder="请填写年级"
              >
                <el-option
                  v-for="item in gradeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="省市"
              :rules="[{ required: true, message: '省市不能为空' }]"
            >
              <el-cascader
                placeholder="教师省市"
                :options="options"
                v-model="selectedOptions"
                @change="handleAreaChange"
              />
            </el-form-item>
            <el-form-item
              label="学校"
              :rules="[{ required: true, message: '学校不能为空' }]"
            >
              <el-input v-model="school" placeholder="请填写学校"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-if="radio === 2">
        <ImportExcel
          @changeData="excelData = $event"
          :tableList="tableList"
          :subjectList="subjectList"
          :stageList="stageOptions"
          :provinceOptions="provinceOptions"
          :areaOptions="options"
        />
      </div>
      <span
        slot="footer"
        class="dialog-footer"
        style="display: flex; justify-content: center"
      >
        <el-button
          type="primary"
          @click.native.prevent="handleAddUser"
          :disabled="
            excelData.filter(item =>
              Object.values(item)
                .map(i => i.errMsg)
                .some(err => err)
            ).length > 0
          "
        >
          创 建
        </el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="成员配置"
      class="user-dialog"
      :visible.sync="editUserDialog"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      @close="resetUserForm"
    >
      <el-form
        ref="userEditForm"
        class="user-form"
        :model="userForm"
        label-width="80px"
        v-if="actUser"
      >
        <el-form-item label="姓名">
          <el-input
            v-model.trim="userForm.nickname"
            placeholder="请填写姓名"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="学科"
          :rules="[
            { required: true, message: '学科不能为空', trigger: 'change' },
          ]"
          prop="subject"
        >
          <el-select
            v-model="userForm.subject"
            placeholder="请选择学科"
            multiple
            filterable
            @change="handleSubjectChange"
          >
            <el-option
              :label="item.cn_name"
              :value="item.en_name"
              v-for="item in subjectList"
              :key="item.en_name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="学段"
          :rules="[
            { required: true, message: '学段不能为空', trigger: 'change' },
          ]"
          prop="stage"
        >
          <el-select
            v-model="userForm.stage"
            placeholder="请选择学段"
            @change="handlestageChange(userForm.stage)"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="item in stageOptions"
              :key="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="年级"
          :rules="[
            { required: true, message: '年级不能为空', trigger: 'change' },
          ]"
          prop="grade"
        >
          <el-select
            v-model="userForm.grade"
            filterable
            placeholder="请选择年级"
            @change="changeGrade"
            :key="refresh2"
          >
            <el-option
              v-for="item in gradeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="省市"
          :rules="[{ required: true, message: '省市不能为空' }]"
          prop="area"
        >
          <el-cascader
            placeholder="教师省市"
            :options="options"
            v-model="selectedOptions"
            @change="handleAreaChange"
          />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="school" placeholder="请填写学校"></el-input>
        </el-form-item>
        <el-form-item label="可见素材">
          <span v-if="!userForm.subject.length">请先选择学科</span>
          <span v-else>
            <el-button size="mini" @click="libraryVisible = true">
              选择素材
            </el-button>
            <span class="m-l-20">
              已选择 {{ userForm.books?.length }} 个素材
            </span>
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="confirmEditInfo">保 存</el-button>
        <el-button @click="editUserDialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="libraryVisible"
      :show-close="false"
      class="book-library"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
      v-if="libraryVisible"
    >
      <BookLibrary
        :disable-project="true"
        :subject-limit="userForm.subject"
        :stage-default="userForm?.stage"
        :grade-limit="userForm?.grade?.split(',')"
        :area-default="userForm?.area?.split('/')[0]"
        @cancel="libraryVisible = false"
        @select-book="selectBookHandle"
        :select-book="userForm.books"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  batchAddTeacher,
  deleteTeacher,
  disableTeacher,
  resetPasswordTeacher,
  getTeacherList,
  getConfigList,
} from './api';
import { getUserAndOrgList, updateTeacherInfo } from '@/api/account';
import { getSubjectsAndStages } from '@api/common';
import { getBookList, getUserBookList } from '@api/bookLib';
import {
  getSubjectChineseName,
  getSubjectEnglishName,
  getStageChineseName,
  getStageEnglishName,
  removeEmpty,
} from '@/scripts/helper';
import { mapGetters } from 'vuex';
import BookLibrary from '../Book/components/BookLibrary';
import store from '@store';
import area from './static/area.json';
import { utils, write } from 'xlsx/xlsx.mjs';
import { saveAs } from 'file-saver';
import ImportExcel from './components/ImportExcel.vue';
import {
  STAGE_OPTIONS,
  GRADE_OPTIONS_ORIGIN,
  GRADE_OPTIONS,
} from '@/store/enum';
import {
  getCityOptions,
  getProvinceOptions,
  getDistrictOptions,
} from '../../utils/utils';

export default {
  components: {
    BookLibrary,
    ImportExcel,
  },
  async created() {
    await this.init();
    await this.getSubjectList();
    await this.getList();
    this.$nextTick(() => {
      this.$refs.table?.doLayout();
    });
    this.initProvinceOptions();
  },
  data() {
    return {
      areaDefault: '',
      isReady: false,
      actOrg: 0,
      usersSearch: '',
      // 通过手机号加入成员
      addUserDialog: false,
      addUsers: '',
      // 配置成员信息
      editUserDialog: false,
      libraryVisible: false,
      userForm: {
        nickname: '',
        phone: '',
        email: '',
        titleId: '',
        stage: '',
        subject: [],
        books: [],
        // departmentId: [],
        departmentId: '',
        userId: '',
        school: '',
        area: '',
        grade: '',
        project_limit: [],
      },
      gradeOption: {},
      gradeOptionOrigin: GRADE_OPTIONS_ORIGIN,
      school: '',
      actUser: null,
      stageOptions: STAGE_OPTIONS,
      gradeOptions: GRADE_OPTIONS,
      provinceOptions: [],
      cityOptions: [],
      districtOptions: [],
      selects: {
        subject: '',
        stage: '',
        grade: '',
        province: '',
        city: '',
        district: '',
      },
      subjectList: [],
      bookList: [],
      options: area,
      selectedOptions: [],
      curPage: 1,
      curSize: 50,
      refresh: 0,
      refresh2: 0,
      tableList: [],
      radio: 1,
      excelData: [],
      // 是否禁用批量创建
      banBatchAddBtn: true,
      maxWidth: {},
    };
  },
  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('org', ['orgUsers']),
    actBusiness() {
      return this.orgUsers?.find(item => item.id === this.actOrg);
    },
    tableData() {
      let tableData = this.tableList;
      const condition = this.usersSearch;
      tableData = tableData.filter(data => {
        if (condition) {
          return (
            data.nickname
              .toLowerCase()
              .includes(condition.toLocaleLowerCase()) ||
            data.username.toLowerCase().includes(condition.toLocaleLowerCase())
          );
        }
        return true;
      });
      return tableData.splice((this.curPage - 1) * this.curSize, this.curSize);
    },
  },
  watch: {
    actBusiness: {
      deep: true,
      handler() {
        this.$refs.table?.doLayout();
      },
    },
    school: {
      handler(val) {
        this.userForm.school = val;
      },
    },
    selects: {
      async handler(val) {
        await this.getList();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getSubjectChineseName,
    getStageChineseName,
    getBooksByIds,
    getConfigList,
    async init() {
      try {
        if (
          this.orgUsers.length &&
          (!this.actOrg || !this.orgUsers.find(item => item.id === this.actOrg))
        ) {
          this.actOrg = this.orgUsers[0].id;
        }
        this.allDefaultRules = await getConfigList(this.user.orgs[0].orgId);
        this.isReady = true;
      } catch (e) {
        this.$message.error('服务端异常');
      }
    },
    async getSubjectList() {
      try {
        const res = await getSubjectsAndStages();
        let list = [];
        res.study_section_list.forEach(i => {
          i.grade_subject_list.forEach(j => {
            list = list.concat(j.subject_list);
          });
        });
        this.subjectList = this.removeDuplicateObj(list);
      } catch (e) {
        this.$message.error('服务端异常');
        this.subjectList = [];
      }
    },
    initProvinceOptions() {
      const r = getProvinceOptions();
      this.provinceOptions = ['全国', ...r].map(item => {
        return {
          label: item,
          value: item,
        };
      });
    },
    handleProvinceChange(province) {
      const r = getCityOptions(province);
      this.cityOptions = [...r].map(item => {
        return {
          label: item.label,
          value: item.label,
        };
      });
    },
    handleCityChange(city) {
      const r = getDistrictOptions(city);
      this.districtOptions = [...r].map(item => {
        return {
          label: item.label,
          value: item.label,
        };
      });
    },
    handleResetSelected() {
      this.$set(this, 'selects', {
        subject: '',
        stage: '',
        grade: '',
        province: '',
        city: '',
        district: '',
      });
    },
    async getBookList() {
      try {
        this.bookList = await getBookList({
          customer_id: this.actOrg,
          subjects: this.userForm.subject.join(','),
        });
      } catch (e) {
        this.$message.error('服务端异常');
        this.bookList = [];
      }
    },
    async handlestageChange(stage) {
      this.gradeOption = this.gradeOptionOrigin[stage];
      // option变了，所以要重置一下v-model绑定的值
      await this.handleGetAllDefaultConfigObj();
    },
    async handleSubjectChange() {
      await this.handleGetAllDefaultConfigObj();
    },
    async changeGrade(val) {
      this.refresh2 += 1;
      await this.handleGetAllDefaultConfigObj();
    },
    removeDuplicateObj(arr) {
      const obj = {};
      arr = arr.reduce((newArr, next) => {
        if (!obj[next.en_name]) {
          obj[next.en_name] = true;
          newArr.push(next);
        }
        return newArr;
      }, []);
      return arr;
    },
    // 批量添加
    handleAddUser() {
      if (this.radio === 1) this.singleAdduser();
      else this.batchAddUser();
    },
    async singleAdduser() {
      const { userForm } = this;
      if (
        userForm.nickname &&
        userForm.subject &&
        userForm.stage &&
        userForm.grade &&
        userForm.area &&
        userForm.phone &&
        this.school
      ) {
        console.log('验证表单完整性通过');
      } else {
        this.$message.warning('请填写完整信息');
        return;
      }
      const phoneReg =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      // const phones = userForm.filter(i => phoneReg.test(i));
      const phones = userForm.phone.split(/\s+/).filter(i => phoneReg.test(i));
      if (!phones.length) {
        this.$message.warning('手机号格式错误');
        return;
      }
      try {
        const testData = {
          users: phones.map(p => {
            return {
              username: p,
              nickname: userForm.nickname,
              subject: userForm.subject.join(','),
              stage: userForm.stage,
              grade: userForm.grade,
              area: userForm.area,
              school: userForm.school,
              externalUserType: 'teacher',
            };
          }),
          orgId: this.actOrg,
        };
        const res = await batchAddTeacher(testData);
        if (res.data.status !== 0) throw res.data.statusInfo;
        await this.getList();
        const users = await getUserAndOrgList();
        store.dispatch('org/orgUsersAction', users);
        if (res.data.message) {
          this.$message.warning(res.data.message);
        } else if (!res.data.statusInfo.includes('ms')) {
          this.$message.warning(res.data.statusInfo);
        } else {
          this.$message.success('添加成功');
        }
        this.init();
        this.userForm = {
          nickname: '',
          phone: '',
          email: '',
          titleId: '',
          stage: '',
          subject: [],
          books: [],
          departmentId: '',
          userId: '',
          school: '',
          area: '',
          grade: '',
          project_limit: [],
        };
        this.school = '';
        this.selectedOptions = [];
      } catch (e) {
        if (e.includes('length should bigger than 1')) {
          this.$message.error('手机号格式错误 请重试');
        } else {
          console.log('错误信息：, e');
          this.$message.error(e);
        }
      }
      this.addUserDialog = false;
    },
    async batchAddUser() {
      // 容器
      const newUsers = [];
      for (const index in this.excelData) {
        newUsers.push({
          username: String(this.excelData[index].username.value),
          nickname: this.excelData[index].nickname.value,
          stage: getStageEnglishName(this.excelData[index].stage.value),
          subject: this.excelData[index].subject.value,
          grade: this.excelData[index].grade.value,
          area:
            this.excelData[index].province.value +
            '/' +
            this.excelData[index].city.value +
            '/' +
            this.excelData[index].district.value,
          school: this.excelData[index].school.value,
          externalUserType: 'teacher',
        });
      }
      this.addUserDialog = false;
      const res = await batchAddTeacher({
        users: newUsers,
        orgId: this.actOrg,
      });
      if (res.data.status === 0) {
        this.$message.success('添加成功');
        await Promise.all([this.getList(), getUserAndOrgList()]);
      } else {
        this.$message.error(res.data.statusInfo);
      }
      await this.getList();
    },
    handleOpen() {
      this.school = '';
      this.addUserDialog = true;
    },
    handleCancel() {
      this.addUserDialog = false;
      this.addUsers = '';
    },
    async selectBookHandle(val) {
      this.userForm.books = val;
    },
    // 编辑用户信息
    async confirmEditInfo() {
      console.log('编辑用户信息');
      const { userForm } = this;
      let params = {
        user_id: userForm.userId,
        org_id: this.user.orgs[0].orgId,
        book_list: userForm.books,
        nickname: userForm.nickname,
        stage: userForm.stage,
        subject: userForm.subject,
        grade: userForm.grade,
        school: userForm.school,
        area: userForm.area,
      };
      // return;
      params = removeEmpty({ ...params });
      params.subject = userForm.subject.join(',');
      this.$refs.userEditForm.validate(async valid => {
        if (valid) {
          try {
            await updateTeacherInfo({ ...params });
            await this.getList();
            this.$message.success('操作成功');
            // 更改 actUser 的属性
            this.init();
          } catch (error) {
            this.$message.error('更新失败');
          } finally {
            this.editUserDialog = false;
          }
        } else {
          this.$message.warning('请完善表单');
        }
      });
    },
    // 初始化信息
    async showEditUserDialog(user) {
      this.actUser = user;
      this.userForm.nickname = (user.nickname || '').trim();
      this.userForm.email = (user.email || '').trim();
      this.userForm.phone = (user.phone || '').trim();
      this.userForm.userId = user.userId;
      if (user.titleId) this.userForm.titleId = user.titleId;
      if (user.stage) {
        this.userForm.stage = user.stage;
        this.gradeOption = this.gradeOptionOrigin[this.userForm.stage];
      }
      if (user.subject) this.userForm.subject = user.subject.split(',');
      if (user.grade) this.userForm.grade = user.grade;
      if (user?.departmentList?.length !== 1) {
        this.userForm.departmentId = '';
      } else {
        this.userForm.departmentId = user.departmentList[0].id;
      }
      this.userForm.area = user.area;
      this.school = user.school;
      this.userForm.school = user.school;
      this.userForm.project_limit = user.project_limit;
      await this.handleGetAllDefaultConfigObj();
      this.selectedOptions = [];
      if (user.area) {
        user.area = user.area.split('/');
        // label 转为 value 以支持el-cascader回显数据
        const loc = [];
        for (const item of area) {
          if (user.area[0] && item.label === user.area[0]) {
            loc.push(item.value);
            for (const item2 of item.children) {
              if (user.area[1] && item2.label === user.area[1]) {
                loc.push(item2.value);
                if (item2.children) {
                  for (const item3 of item2.children) {
                    if (user.area[2] && item3.label === user.area[2]) {
                      loc.push(item3.value);
                    }
                  }
                }
              }
            }
          }
        }

        user.area = user.area.join('/');
        this.selectedOptions = loc;
      }
      this.editUserDialog = true;
    },
    // 重置用户信息 form
    resetUserForm() {
      this.actUser = null;
      this.$set(this, 'userForm', {
        nickname: '',
        phone: '',
        email: '',
        titleId: '',
        subject: [],
        books: [],
        // departmentId: [],
        departmentId: '',
        userId: '',
        project_limit: '',
      });
      this.selectedOptions = [];
    },
    // 移除成员
    deleteUserFromOrg(user) {
      this.$confirm(`是否删除${user.nickname}成员?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const res = await deleteTeacher({
              userId: user.userId,
              orgId: this.actOrg,
            });
            if (res.data.status !== 0) throw res.data.statusInfo;
            await this.getList();
            const users = await getUserAndOrgList();
            store.dispatch('org/orgUsersAction', users);
            this.$message.success('操作成功');
            this.init();
          } catch (e) {
            this.$message.error(e);
          }
        })
        .catch(e => e);
    },
    // 禁用教师
    disableTeacher(user, active) {
      const mess = active
        ? `是否解除禁用${user.nickname}成员?`
        : `是否禁用${user.nickname}成员?`;
      this.$confirm(mess, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const res = await disableTeacher({
              userId: user.userId,
              orgId: this.actOrg,
              isActive: active,
            });
            if (res.data.status !== 0) throw res.data.statusInfo;
            await this.getList();
            const users = await getUserAndOrgList();
            store.dispatch('org/orgUsersAction', users);
            this.$message.success('操作成功');
            this.init();
          } catch (e) {
            this.$message.error(e);
          }
        })
        .catch(e => e);
    },
    // 重置密码
    async resetPassword(user) {
      try {
        const res = await resetPasswordTeacher({
          userId: user.userId,
          orgId: this.actOrg,
        });
        if (res.data.status !== 0) throw res.data.statusInfo;
        this.$message.success('操作成功');
        this.init();
      } catch (e) {
        this.$message.error(e);
      }
    },
    async handleAreaChange(val) {
      const loc = [];
      for (const item of area) {
        if (val[0] && item.value === val[0]) {
          loc.push(item.label);
          for (const item2 of item.children) {
            if (val[1] && item2.value === val[1]) {
              loc.push(item2.label);
              if (item2.children) {
                for (const item3 of item2.children) {
                  if (val[2] && item3.value === val[2]) {
                    loc.push(item3.label);
                  }
                }
              }
            }
          }
        }
      }
      this.userForm.area = loc.join('/');
      await this.handleGetAllDefaultConfigObj();
    },
    async handleCurrentChange(val) {
      this.curPage = val;
      this.refresh += 1;
      this.getMaxWidthFromChar();
      await this.getList();
    },
    async handleSizeChange(val) {
      this.curSize = val;
      await this.getList();
    },

    // 获取教师用户信息
    async getList() {
      const params = {
        customer_id: this.actOrg,
        page: this.curPage,
        size: this.curSize,
        stage: this.selects?.stage,
        grade: this.selects?.grade,
        subject: String(this.selects?.subject),
        province: this.selects?.province,
        city: this.selects?.city,
        district: this.selects?.district,
      };
      this.tableList = await getTeacherList(params);
      this.getMaxWidthFromChar();
    },
    // 导出excel
    exportExcel() {
      let data = this.tableList.filter(
        data =>
          !this.usersSearch ||
          data.nickname.toLowerCase().includes(this.usersSearch.toLowerCase())
      );

      data = data.map(item => {
        return {
          姓名: item.nickname,
          手机号: item.username,
          创建时间:
            new Date(item.createTime).getFullYear() +
            '-' +
            (new Date(item.createTime).getMonth() + 1)
              .toString()
              .padStart(2, '0') +
            '-' +
            new Date(item.createTime).getDate().toString().padStart(2, '0'),
          省: item.area ? item.area?.split('/')[0] : '',
          市: item.area ? item.area?.split('/')[1] : '',
          '区/县': item.area ? item.area?.split('/')[2] : '',
          学科: item.subject
            .split(',')
            .map(it => getSubjectChineseName(it))
            .join(','),
          学段: getStageChineseName(item.stage),
          年级: item.grade,
          学校名称: item.school,
        };
      });
      // 定义表头
      const headers = [
        '姓名',
        '手机号',
        '创建时间',
        '省',
        '市',
        '区/县',
        '学科',
        '学段',
        '年级',
        '学校名称',
      ];

      const ws = utils.json_to_sheet(data, { header: headers });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });

      saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        this.user.orgs[0].orgName + '-教师用户.xlsx'
      );
    },
    getAreaMessage(item, row) {
      let arr = [];
      if (!row) {
        return '--';
      }
      arr = row.area?.split('/') ?? [];
      if (item === 'province') {
        return arr[0] ?? '--';
      }
      if (item === 'city') {
        return arr[1] ?? '--';
      }
      if (item === 'district') {
        return arr[2] ?? '--';
      }
      return '--';
    },
    getAdaptionWidth(item, tableData) {
      if (!Array.isArray(tableData) || tableData.length === 0) {
        return;
      }
      let columnContent = '';
      for (let i = 0; i < tableData.length; i++) {
        const nowText = this.getAreaMessage(item, tableData[i]);
        if (nowText.length > columnContent.length) {
          columnContent = nowText;
        }
      }
      if (!columnContent) return; // 如果没有找到任何内容，就返回
      let charCounts = 0;
      const charWidth = 8;
      for (const char of columnContent) {
        if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
          charCounts++;
        } else if (char >= '\u4e00' && char <= '\u9fa5') {
          charCounts += 2;
        } else {
          charCounts += 2;
        }
      }
      return charCounts * charWidth + 60;
    },
    getMaxWidthFromChar() {
      const maxProvinceWidth = this.getAdaptionWidth(
        'province',
        this.tableData
      );
      const maxCityWidth = this.getAdaptionWidth('city', this.tableData);
      const maxDistrictWidth = this.getAdaptionWidth(
        'district',
        this.tableData
      );
      this.maxWidth = {
        maxProvinceWidth,
        maxCityWidth,
        maxDistrictWidth,
      };
    },
    async handleGetAllDefaultConfigObj() {
      const obj = this.userForm;
      // @hooks init @fieid change
      if (obj?.subject?.length > 0 && obj?.stage && obj?.grade && obj?.area) {
        // 都存在时,@change a field
        // 根据fields filter
        let { subject, stage, grade, area } = obj;
        const defaultRules = this.allDefaultRules?.data?.find(item => {
          if (Array.isArray(subject)) {
            // 如果是数组，都变成字符串,严格匹配
            subject = subject.join(',');
          }
          return (
            subject === item?.subject &&
            item.stage === stage &&
            item.grade === grade &&
            area?.includes(item.area)
          );
        })?.resources;
        let projectIds = [];
        if (obj.project_limit?.length > 0) {
          projectIds = obj?.project_limit.concat(defaultRules);
        } else {
          projectIds = defaultRules;
        }
        const uniqueIds = Array.from(new Set(projectIds));
        const books = await getBooksByIds(uniqueIds);
        books?.forEach(item => {
          // 说明属于默认配置
          if (defaultRules?.includes(item._id)) {
            item.isDefault = true;
          }
        });
        this.userForm.books = books;
      }
    },
  },
};
</script>

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

    .user-form2 {
      .el-form-item {
        .el-input {
          .el-input__inner {
            height: 30px;
            line-height: 30px;
            width: 290px;
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

.teacher-user-table {
  ::v-deep .cell {
    padding: 0;
    margin: auto;
  }
}
</style>
