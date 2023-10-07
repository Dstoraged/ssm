<template>
  <div class="container-fluid">
    <div class="top_context">
      <div class="card" style="">
        <div class="card-body">
          <h-tbale
            :show-subtitle="true"
            :heard-all-hid="true"
            :show-page="true"
            :table-heard="tableHeard"
            :table-data="tableData"
            :show-right-tools="false"
            @inint-ok="loadTable"
            @load="loadTable"
            ref="hTable"
          >
            <el-button

              type="text"
              slot="table_cell_ts"
              slot-scope="scope"
              style="color: rgb(35, 203, 224);padding:0px !important"
              @click="viewData(scope.row, scope.config)"
            >
              {{ scope.reval }}
            </el-button>

            <div slot="top_title">
              <div class="sub-title" style="float: left">
                {{ $t("table.total", [tableData.length])
                }}<el-button
                  icon="el-icon-refresh"
                  type="text"
                  @click="loadTable(null, true)"
                />
              </div>
              <div style="float: right">
                {{ $t("logs.type") }}:

                <el-select
                  v-model="logType"
                  :placeholder="$t('loadingSubPan.state')"
                  size="mini"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="$t(item.label)"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </div>
              <div style="clear: both; height: 5px"></div>
            </div>
          </h-tbale>
        </div>
      </div>
    </div>

    <!--  <view-ui :datas="views.datas" :headrs="views.headrs" v-model="views.show" />-->

    <van-popup
      closeable
      close-on-popstate
      v-model="views.show"
      position="left"
      :lock-scroll="true"
      :style="{
        height: '100%',
        'min-width': '20%',
        'max-width': '95%',
      }"
      :overlay="true"
      transition-appear
    >
      <div :style="{ 'overflow-x': 'auto', 'padding-top': '10px' }">
        <h5 style="text-align:center;border-bottom:1px solid #eee;padding-bottom:8px">{{$t("logs.logDetails")}}</h5>
        <json-editor
          mode="view"
          lang="zh"
          :showBtns="false"
          :expandedOnStart="true"
          v-model="views.datas"
        />
      </div>
    </van-popup>
  </div>
</template>
<script>
import HTbale from "@/components/modules/HTbale.vue";
import { createWebsocket } from "@/utils/websocket.js";
import utils from "@/utils/utils.js";
import jsonEditor from "vue-json-editor";
import viewUi from "./view.vue";
export default {
  components: { HTbale, viewUi, jsonEditor },
  data() {
    let _this_ = this;

    let logTypes = {
      1: "logs.loginPassword",
      2: "logs.sealUnseal",
      4: "logs.rentalRecycling",
      65536: "logs.submissionPOC",
    };
    return {
      views: {
        show: false,
        headrs: [],
        datas: {},
        width: "1000px",
      },
      options: [
        {
          value: 65543,
          label: "logs.allLogs",
        },
        {
          value: 1,
          label: "logs.loginPassword",
        },
        {
          value: 2,
          label: "logs.sealUnseal",
        },
        {
          value: 4,
          label: "logs.rentalRecycling",
        },
        {
          value: 65536,
          label: "logs.submissionPOC",
        },
      ],
      socket_table: null,
      logType: 65543,
      nodeContext: [],
      logTypes,

      tableHeard: [
        {
          name: "ts",
          title: "comm.time",
          valMap: (val, item) => {
            if (utils.isEmpty(val)) return "";
            return utils.formatTime(val * 1000);
          },
          minWidth: "160px",
        },
        {
          name: "log_type",
          title: "logs.type",
          valMap: logTypes,
          valT: true,
          minWidth: "200px",
        },
        {
          name: "data",
          title: "logs.content",
          unValMap: true,
          quote: "log_type",
          valMap: function (val = {}, item, config) {
            let quoteVal = item[config.quote];
            let re = "";
            if (quoteVal && config.configs[quoteVal]) {
              let configs = config.configs[quoteVal];
              re = _this_.logAnalysis(configs, val, "; ", [
                "utg_poc_commit_details",
              ]);
              re = _this_.arrToStr(re);
            }

            return re;
          },
          configs: {
            1: [
              {
                name: "action_type",
                title: "logs.operationType",
                valMap: {
                  1: "logs.usrLogin",
                  2: "logs.changePassword",
                  3: "logs.resetPassword",
                },
                valT: true,
              },
              { name: "src_ip", title: "logs.sourceIP" },
            ],
            2: [
              {
                name: "action_type",
                title: "logs.operationType",
                valMap: {
                  11: "logs.startEncapsulation",
                  12: "logs.abortEncapsulation",
                  13: "logs.completeSealing",
                  14: "logs.unsealing",
                },
                valT: true,
              },
              { name: "utg_block", title: "logs.sealedBlock" },
              {
                name: "utg_volume",
                title: "logs.sealSize",
                valMap(val) {
                  return utils.isEmpty(val)
                    ? val
                    : `${val} ${_this_.$IEDATA.capacity}`;
                },
              },
            ],
            4: [
              {
                name: "action_type",
                title: "logs.operationType",
                valMap: {
                  21: "logs.spaceRental",
                  22: "logs.spacepledgerecycling",
                  23: "logs.Spaceleaserecycling",
                },
                valT: true,
              },
              { name: "utg_voucher", title: "logs.rentalvoucher" },
              {
                name: "utg_volume_rent",
                title: "market.rentedSpace",
                show(val, item) {
                  return item.action_type == 21;
                },
                valMap(val) {
                  return utils.isEmpty(val)
                    ? val
                    : `${val} ${_this_.$IEDATA.capacity}`;
                },
              },
              {
                name: "utg_volume_free",
                title: "logs.remainingspace",
                show(val, item) {
                  return item.action_type == 21;
                },
                valMap(val) {
                  return utils.isEmpty(val)
                    ? val
                    : `${val} ${_this_.$IEDATA.capacity}`;
                },
              },
              { name: "utg_block", title: "logs.block" },
            ],
            65536: [
              { name: "utg_chain_day", title: "logs.chainDays" ,show:false,valMap(val){
                  return `${val} ${_this_.$t("logs.days")}`
              }},
              {
                name: "utg_poc_commit_progress",
                title: "logs.POCprogress",
                valT: true,
                valMap: {
                  1: "logs.submissionplan",
                  2: "logs.pendingsubmission",
                  3: "logs.waitingverification",
                  4: "logs.Validationsuccessful",
                },
              },
              {
                name: "utg_poc_commit_retry",
                title: "logs.retrySubmission",
                valMap: { true: "logs.resubtrue", false: "logs.resubfalse" },
                valT: true,
              },
              {
                name: "utg_poc_commit_error",
                title: "logs.errormessage",
                valT: true,
                valMap(val = "") {
                  let re = _this_.errTypes[val];
                  return re || val;
                },
                show(val, item) {
                  return item.utg_poc_commit_retry == true;
                },
              },
              {
                name: "utg_poc_commit_plan_block",
                title: "logs.submitestimated",
                show(val, item) {
                  return (
                    item.utg_poc_commit_progress == 2 ||
                    item.utg_poc_commit_progress == 3
                  );
                },
              },
              {
                name: "utg_poc_commit_plan_ts",
                title: "logs.estimatedtime",
                valMap: (val, item) => {
                  if (utils.isEmpty(val)) return "";
                  return utils.formatTime(val * 1000);
                },
                show(val, item) {
                  return (
                    item.utg_poc_commit_progress == 2 ||
                    item.utg_poc_commit_progress == 3
                  );
                },
              },
              {
                name: "utg_poc_commit_details",
                title: "logs.details",
                type: "Array",
                configs: [

                  {
                    name: "utg_voucher",
                    title: "logs.voucher",
                    type: "address",
                    format: true,
                  },
                  {
                    name: "utg_poc_commit_result",
                    title: "hash",
                    type: "address",
                    format: true,
                    titleNotT: true,
                  },

                  { name: "utg_rpc_url", title: "logs.submissionnode" },
                  { name: "utg_block", title: "logs.block" },
                  {
                    name: "utg_poc_commit_error",
                    title: "logs.errormessage",
                    valT: true,
                    valMap(val = "") {
                      let re = _this_.errTypes[val];
                      return re || val;
                    },
                   
                  },
                  {
                    name:"utg_poc_commit_confirm",
                    title:"logs.verificationre",
                     show(val, item) {
                      return !utils.isEmpty(item.utg_poc_commit_result);
                    },
                  },
                  {
                    name: "utg_commit_ts",
                    title: "logs.submissiontime",

                    valMap: (val) => {
                      if (utils.isEmpty(val)) return "";
                      return typeof val == "number"
                        ? utils.formatTime(val * 1000)
                        : val;
                    },
                  },
                ],
              },
            ],
          },
        },
      ],

      tableData: [],
      types: {
        do_volume_package_poc: "logs.sealPOC",
        do_volume_rent_poc: "logs.rentPOC",
        do_volume_rent_retrieve_poc: "logs.leaserecovery",
      },
      errTypes: {
        "out pledge": "logs.err_outPledge",
        "check poc fail	POC": "logs.err_checkfail",
        "enquire pledge fail": "logs.err_pledgefail",
        "enquire block fail": "logs.err_blockfail",
        "enquire nonce fail": "logs.err_noncefail",
        "enquire gasPrice fail": "logs.err_noncefail",
        "utg post data to chain rpc fail": "logs.err_outPledge",
      },
    };
  },
  methods: {
    viewData(row, config) {
      // let quoteVal = row[config.quote];
      //  let datas = [];
      let headrs = [];
      /* if (quoteVal && config.configs[quoteVal]) {
        let configs = config.configs[quoteVal];
        configs = this.getConfigs(["utg_poc_commit_details"], configs);

        let re = this.logAnalysis(configs, row.data);
        let valArr = re[0].val || [];
        datas = this.arrToTableArr(valArr);
        headrs = configs[0].configs;
      }*/
      let reDatas = this.logAnalysis(this.tableHeard, row);

      let rowL = JSON.parse(JSON.stringify(row));
      this.arrToJson(reDatas, rowL);
      this.views.headrs = headrs;
      // this.views.datas = datas;
      this.views.datas = rowL;
      this.views.show = true;

      //item  return re;
    },

    showBtn(item, config) {
      let quoteVal = item[config.quote];

      return quoteVal == 65536 && !!item.data.utg_poc_commit_details;
    },
    arrToJson(arr = [], datat = {}) {
      arr.forEach((item) => {
        let name = item.name;
        let title = this.$t(item.title);
        if (item.configs) {
          let dataL = datat[name];

          if (item.config.type == "Array") {
            let ArrData = {};

            let valArr = item.val || [];
            let arrOk = false;
            valArr.forEach((arrL, cd) => {
              this.arrToJson(arrL, dataL[cd]);
              ArrData[`#${cd + 1}`] = dataL[cd];
              arrOk = true;
            });
            arrOk && (datat[title] = ArrData);
          } else {
            this.arrToJson(item.val || [], dataL || {});
            datat[title] = dataL;
          }
        } else {
          datat[title] = item.config.valT ? this.$t(item.val) : item.val;
        }

        delete datat[name];
      });
    },
    arrToTableArr(arr) {
      let reArr = [];
      arr.forEach((item) => {
        let obj = {};

        if (Array.isArray(item)) {
          item.forEach((valObj) => {
            obj[valObj.name] = valObj.val;
          });
        } else {
          obj = item;
        }
        reArr.push(obj);
      });
      return reArr;
    },
    getConfigs(names = [], arr = []) {
      let reArr = [];
      arr.forEach((item) => {
        if (names.includes(item.name)) {
          reArr.push(item);
        }
      });
      return reArr;
    },

    arrToStr(arr = []) {
      let reStr = "";
      arr.forEach((item) => {
        if (!item.show) return;
        let titleL = this.$t(item.title);
        let valL = item.val;
        if (item.config.valT) {
          valL = this.$t(valL);
        }
        reStr += `${titleL}=${valL}${item.interval}`;
      });
      return reStr;
    },
    logAnalysis(configs = [], data, interval = "; ", notNames = []) {
      let reArr = [];
      configs.forEach((item) => {
        if (notNames.includes(item.name)) {
          return;
        }
        let valL = data[item.name];
        let titleL =
          typeof item.title == "function"
            ? item.title(valL, data, item)
            : item.title;
        //  titleL = this.$t(titleL);
        let showL = true;
        if (!utils.isEmpty(item.show)) {
          if (item.show === false) {
            showL = false;
          }
          if (typeof item.show == "function" && !item.show(valL, data, item)) {
            showL = false;
          }
        }

        if (item.valMap && !item.unValMap) {
          valL =
            typeof item.valMap == "function"
              ? item.valMap(valL, data, item)
              : item.valMap[valL];
        }
        let configsL = null;
        if (item.configs) {
          let configsRe = Array.isArray(item.configs)
            ? item.configs
            : item.quote
            ? item.configs[data[item.quote]]
            : item.configs[valL];
          configsL = configsRe;
          if (configsRe) {
            if (item.type == "Array") {
              let vals = [];
              valL = valL || [];
              valL.forEach((valItem) => {
                vals.push(this.logAnalysis(configsRe, valItem, interval));
              });
              valL = vals;
            } else {
              valL = this.logAnalysis(configsRe, valL, interval);
            }
          }
        }
        valL = valL === null || valL === undefined ? "" : valL;

        /*  if (item.valT) {
          valL = this.$t(valL);
        }*/
        if (item.units) {
          valL = `${valL}${item.units}`;
        }
        reArr.push({
          title: titleL,
          name: item.name,
          val: valL,
          show: showL,
          interval,
          config: item,
          configs: configsL,
        });
        //  reStr += `${titleL}=${valL}${interval}`;
      });
      return reArr;
    },
    getAddrFormat(val, num = 12) {
      if (val && val.length <= num) {
        return val;
      }
      return utils.getAddrFormat(val, num);
    },
    gettypes(val) {
      let re = "";
      if (utils.isEmpty(val)) {
        return "";
      }
      val.trim();
      let configs = val.split(",");
      configs.forEach((valL) => {
        valL = valL.trim();
        let typelan = this.types[valL];
        if (typelan) {
          re += re.length > 0 ? `,${this.$t(typelan)}` : this.$t(typelan);
        }
      });
      return re;
    },
    loadTable(query, up = false) {
      if (this.tableData.length == 0 || up) {
        if (!query && this.$refs.hTable) {
          query = this.$refs.hTable.tableQuery;
        }
        this.getTableDats(query);
      }
    },
    getTableDats(query) {
      query.table_loading = true;
      let autofun = {
        onopen: () => {
          this.socket_table.sendPing({
            message: { log_type: this.logType },
            cmd: 11,
            setTicket: true,
            cd: 0,
          });
        },
        onmessage: (data) => {
          if (data.cmd == 11) {
            let tableData = data.logs || [];
            this.tableData = tableData.reverse();
            query.table_loading = false;
            this.socket_table.closeSocket();
          }
        },
        onerror: () => {
          this.socket_table.closeSocket();
        },
      };
      if (this.socket_table) {
        this.socket_table.init(undefined, autofun);
      } else {
        this.socket_table = createWebsocket("devicectl", autofun);
      }
    },
  },
  computed: {
    /*  getTableDatas() {
      if (this.tableData == 0) {
        return [];
      }
      let pageNum = this.tableQuery.pageNum;
      let pageSize = this.tableQuery.pageSize;
      let page_total = this.tableQuery.page_total;
      let start_index=(pageNum-1)*pageSize;

     if( start_index>this.tableData.length){
        return [];
     }



     // slice

  
    },*/
  },
  watch: {
    logType: function () {
      this.loadTable(null, true);
    },
  },
};
</script>

<style >
.jsoneditor-menu {
  display: none !important;
}
div.jsoneditor {
  border: 0px !important;
}
.jsoneditor-outer {
  border: 0px !important;
}
div.jsoneditor-tree {
  margin-right: 50px;
  width: auto !important;
}
div.jsoneditor-tree table.jsoneditor-tree td {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

div.jsoneditor-tree table.jsoneditor-tree .jsoneditor-object {
  display: none;
}
div.jsoneditor-tree table.jsoneditor-tree .jsoneditor-readonly {
  color: #fff;
}
div.jsoneditor-field,
div.jsoneditor-value,
div.jsoneditor-readonly {
  padding: 0px;
}

div.jsoneditor-tree table.jsoneditor-tree .jsoneditor-expandable:first-child {
  display: none;
}

div.jsoneditor-field.jsoneditor-empty::after,
div.jsoneditor-value.jsoneditor-empty::after {
  color: #fff !important;
}
div.jsoneditor-value.jsoneditor-number {
  color: #008000;
}
</style>