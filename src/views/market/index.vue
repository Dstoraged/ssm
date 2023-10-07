<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div
          v-for="(item, cd) in pledges"
          :key="cd"
          :class="`col-md-${12 / pledges.length}`"
        >
          <div class="card">
            <div class="card-body">
              <h5 style="margin: 0 0 20px 0">{{ $t(item.label) }}</h5>
              <div class="media top_count_div">
                <div class="media-body align-self-center">
                  <h4 :class="item.class || 'top_count_h4'">
                    {{ getDataVal(item, pledgeData) }}
                    <span
                      v-if="item.suffixFun || item.suffix"
                      class="top_count_suffix"
                      >{{
                        (item.suffixFun && item.suffixFun()) || item.suffix
                      }}</span
                    >
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="card">
        <div class="card-body">
          <h4 class="mt-0 header-title" style="width: 100%; text-align: left">
            <span style="line-height: 30px">{{ $t("market.rentalList") }}</span>
            <div style="float: right">
              {{ $t("loadingSubPan.state") }}:

              <el-select
                v-model="rent_status"
                :placeholder="$t('loadingSubPan.state')"
                clearable
                size="mini"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                >
                </el-option>
                <el-option
                  v-show="inrecovery.length > 0"
                  :label="$t(torecycledOption.label)"
                  :value="torecycledOption.value"
                ></el-option>
              </el-select>
            </div>
          </h4>

          <el-button
            type="text"
            v-if="inWaitfors.length > 0"
            @click="toInWaitfors"
            style="color: orange; float: right"
            >{{ $t("market.pleasepatiently") }}</el-button
          >

          <h-tbale
            @colClick="colClick"
            :heard-all-hid="true"
            :show-page="true"
            :table-heard="tableHeard"
            :table-data="tableData"
            :show-right-tools="true"
            right-btn-col-width="180px"
            @inint-ok="loadTable"
            @load="loadTable"
            :phone-lable-width="$i18n.locale == 'en' ? '92pt' : '60pt'"
            ref="hTable"
          >
            <div slot="rightCol" slot-scope="scope" style="text-align: center">
              <template
                v-if="
                  scope.data.rentStatus === 1 || scope.data.rentStatus === 4
                "
              >
                <el-popover
                  placement="bottom"
                  trigger="hover"
                  style="margin-right: 10px"
                  @show="showPopover(scope.data)"
                >
                  <el-button type="text" slot="reference">
                    <van-icon name="share" />
                  </el-button>
                  <div
                    style="maring: 5px; text-align: center"
                    v-loading="shareItem.loading"
                  >
                    <template v-if="shareItem.isConfig">
                      <img
                        v-show="shareItem.img"
                        wdith="150px"
                        height="150px"
                        :src="shareItem.img"
                      /><br />
                      <em type="text">{{ shareItem.url }}</em>
                    </template>
                    <template v-else>
                      <span style="color: orange">{{
                        $t("market.noLink")
                      }}</span>
                    </template>
                  </div>
                </el-popover>

                <el-button
                  style="margin-right: 5px"
                  type="text"
                  :title="$t('market.uploadLink')"
                  icon="el-icon-setting"
                  size="mini"
                  @click="uploadImg(scope.data)"
                  >{{ $t("market.configure") }}</el-button
                >
              </template>
              <el-popover
                v-if="btnTips(scope.data)"
                placement="bottom"
                trigger="hover"
                :content="$t(btnTipsText(scope.data))"
              >
                <el-button
                  slot="reference"
                  :style="{ color: btnColor(scope.data) }"
                  type="text"
                  icon="el-icon-warning"
                ></el-button>
              </el-popover>
              <el-button
                size="mini"
                style="color: rgb(35, 203, 224)"
                :type="'text'"
                @click="
                  toExamine(
                    scope,
                    scope.data.rentStatus === 0 ? 'examine' : 'examineview'
                  )
                "
              >
                <template v-if="includeRecovery(scope.data)">
                  {{ $t("market.handle") }}
                </template>
                <template v-else-if="scope.data.renewStatus === 1">
                  {{ $t("market.renewal") }}
                </template>
                <template v-else>
                  {{
                    $t(
                      scope.data.rentStatus === 0
                        ? "market.handle"
                        : "market.view"
                    )
                  }}
                </template>
              </el-button>
            </div>
          </h-tbale>
        </div>
      </div>
    </div>
  </div>
</template>
<script >
import { setPageQuery } from "@/utils/table";
import HTbale from "@/components/modules/HTbale.vue";
import localstorage from "@/utils/localstorage.js";
import utils from "@/utils/utils";
import { Dialog } from "vant";
import { ethers } from "ethers";
export default {
  components: { HTbale },
  data() {
    let _this_ = this;

    return {
      shareItem: {
        img: "",
        url: "",
        isConfig: true,
        loading: false,
      },
      loadTime: null,
      loadTableTime: null,
      rent_status: undefined,
      checkedRecovery: false,
      options: [
        {
          value: 0,
          label: "comm.application", 
        },
        {
          value: 1,
          label: "pledge.renting",
        },
        /* {
          value: 2,
          label: "comm.removing",
        },
        {
          value: 3,
          label: "comm.removing",
        },*/
        {
          value: 4,
          label: "pledge.breachContract", 
        },
        {
          value: 6,
          label: "market.leaseExpired",
        },
        {
          value: 7,
          label: "market.requestExpired", 
        },
      ],
      torecycledOption: {
        value: 100,
        label: "market.torecycled", 
      },

      pledges: [
        {
          label: "market.pledgeSpace",
          name: "declareSpace",
          type: "storage",
          suffix: _this_.$IEDATA.capacity,
        },
        {
          label: "home.availableSpace",
          name: "freeSpace",
          type: "storage",
          suffix: _this_.$IEDATA.capacity,
        },
        {
          label: "pledge.rentalPrice",
          name: "rentPrice",
          suffixFun: () => {
            return `${_this_.$IEDATA.currency}/1${
              _this_.$IEDATA.capacity
            }·${_this_.$t("table.days")}`;
          },
          type: "price",
        },
        {
          label: "home.pledgeTime",
          name: "instime",
          type: "time",
          class: "top_count_time",
          tooltip: true,
        },
      ],
      pledgeData: {},

      tableHeard: [
        {
          title: "HASH",
          name: "rentHash",
          type: "address",
          format: true,
          titleNotT: true,
        },
        {
          name: "rentAddr",
          title: "market.rentalAddress",
          type: "address",
          format: true,
        },

        {
          name: "rentStatus",
          title: "loadingSubPan.state",
          minWidth: "98px",
          isHtml: true,
          valMap: (val) => {
            let item = _this_.types[val] || "";
            if (!item) {
              return "";
            }
            return `<span style="color:${item.color}"> ${_this_.$t(
              item.label
            )} </span>`;
          },
        },
        /*{
          name: "reqType",
          title: "market.rentalType",

          valMap: (val) => {
            let item = _this_.rentTypes[val] || "";
            if (!item) {
              return "";
            }
           
            return _this_.$t(item.label);
          },
        },*/
        {
          name: "rentSpace",
          title: "market.rentedSpace",
          valMap: (val) => {
            return `${utils.storage(val)} ${_this_.$IEDATA.capacity}`;
          },
        },
        {
          title: "pledge.rentalPrice",
          name: "rentPrice",
          valMap: (val) => {
            return `${utils.price(val, 18)} ${_this_.$IEDATA.currency}/1${
              _this_.$IEDATA.capacity
            }·${_this_.$t("table.days")}`;
          },
        },
        {
          name: "rentTime",
          title: "pledge.rentalDuration",
          valMap: (val) => {
            if (utils.isEmpty(val)) return "";
            return `${val} ${_this_.$t("comm.day")}`;
          },
        },
        // { name: "rentNumber", title: "lock.blockNumber" },
        {
          name: "instime",
          title: "market.applicationTime",
          valMap: (val) => {
            return utils.formatTime(val);
          },
        },
        {
          name: "renewStatus",
          title: "market.renewalRequest",
          isHtml: true,
          valMap: (val) => {
            return val === 1
              ? `<span style='color:#007bff'>${_this_.$t(
                  "market.applications"
                )}</span>`
              : "";
          },
        },
      ],
      tableData: [],
      types: {
        0: { label: "comm.application", color: "#67c23a" },
        1: { label: "pledge.renting", color: "#3ea2ff" },
        2: { label: "comm.removing", color: "red" },
        3: { label: "comm.removing", color: "red" },
        4: { label: "pledge.breachContract", color: "orange" },
        //  5: { label: "pledge.terminationProgress", color: "#888" },
        6: { label: "market.leaseExpired", color: "red" },
        7: { label: "market.requestExpired", color: "#aaa" },
      },
      rentTypes: {
        stRent: { label: "market.rent", color: "#67c23a" },
        stReNew: { label: "market.renewal", color: "#3ea2ff" },
      },
    };
  },
  created() {
    this.loadPledge();
    this.setLoadPledge();
  },
  beforeDestroy() {
    this.loadTime && clearInterval(this.loadTime);
    this.loadTableTime && clearTimeout(this.loadTableTime);
  },
  methods: {
    showPopover(data) {
      this.shareItem.loading = true;
      this.$api.consoleApi
        .getRentInfo({ rent_hash: data.rentHash })
        .then((re) => {
          this.shareItem.loading = false;
          let result = re.result || {};
          let img = result.attachPic;
          let url = result.attachText;
          this.shareItem.isConfig = !(utils.isEmpty(img) && utils.isEmpty(url));
          this.shareItem.img = img;
          this.shareItem.url = url;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },

    uploadImg(data) {
      this.$router.push(`/market/uploadURL/${data.rentHash}`);
    },

    setLoadPledge() {
      this.loadTime = setInterval(() => {
        this.loadPledge();
      }, 30000);
    },
    loadPledge(addr) {
      addr = addr || this.$store.getters.deviceAddr;

      if (!addr) return;

      this.$api.home
        .getStorageSpaceInfo(addr)
        .then((re) => {
          this.pledgeData = re.result || {};
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    loadTable(query, device_addr, current) {
      this.loadTableTime &&
        clearTimeout(this.loadTableTime) &&
        (this.loadTableTime = null);

      if (!query && this.$refs.hTable) {
        query = this.$refs.hTable.tableQuery;
      }
      if (!query) {
        return;
      }
      device_addr = device_addr || this.$store.getters.deviceAddr;
      if (!device_addr) return;

      let redata = {
        device_addr,
        current: current || query.pageNum || 1,
        size: query.pageSize,
        status: this.rent_status,
        //req_types: ["stRent"],
      };
      if (this.rent_status == 100) {
        redata.rent_hashs = this.inrecovery || [];
        redata.status = null;
      }

      query.table_loading = true;

      this.$api.consoleApi
        .getStorageRentList(redata)
        .then((response) => {
          query.table_loading = false;
          let tableData = response.result.records || [];
          this.tableData = tableData;
          setPageQuery(query, response.result);

          this.loadTableTime = setTimeout(() => {
            this.loadTable();
          }, 30000);
        })
        .catch((err) => {
          query.table_loading = false;
          console.log("error", err);
          this.loadTableTime = setTimeout(() => {
            this.loadTable();
          }, 30000);
        });
    },
    colClick(item) {
      console.log(item);
    },
    handleSelect(index, val) {
      console.log(index, val);
    },
    toLogin() {
      this.$router.push("/login");
    },
    toExamine(scope, type = "examine") {
      if (scope.data.rentStatus === 0 || scope.data.renewStatus == 1) {
        if (
          this.inrecovery.length > 0 &&
          !this.inrecovery.includes(scope.data.rentHash)
        ) {
          Dialog.confirm({
            title: this.$t("comm.tips"),
            message: `${this.$t("market.pleasepackagesrental")}`,
            cancelButtonText: `${this.$t("market.igotit")}`,
            confirmButtonText: `${this.$t("market.showtorecycled")}`,
          })
            .then(() => {
              this.rent_status = 100;
            })
            .catch(() => {
              // on cancel
            });
          return;
        }
      }

      this.$router.push(`/market/${type}/_${scope.data.rentHash}`);
    },
    removeloca() {
      localstorage.removeItem();
      this.toLogin();
    },
    getDataVal(item, datas) {
      if (datas.pledgeStatus !== 0 && datas.pledgeStatus !== 7) return "---";
      let name = item.name;
      let valL = datas[name];
      if (utils.isEmpty(valL)) {
        return "---";
      }
      switch (item.type || "") {
        case "time":
          valL = utils.formatTime(valL);
          break;
        case "price":
          valL = utils.price(valL, 18);
          break;
        case "storage":
          valL = utils.storage(valL);
          break;
      }
      return `${utils.isEmpty(valL) ? "---" : valL}`;
    },
    toInWaitfors() {
      if (this.inWaitfors.length) {
        this.$router.push(`/market/examine/_${this.inWaitfors[0]}`);
      }
    },
    btnTips(data) {
      return this.incompletes.includes(data.rentHash);
    },
    btnColor(data) {
      if (this.inrecovery.includes(data.rentHash)) {
        return "red";
      } else {
        return "orange";
      }
    },
    btnTipsText(data) {
      if (this.inrecovery.includes(data.rentHash)) {
        return "market.WaitingRecycling";
      } else {
        return "market.pleasepatiently";
      }
    },
    showAction(data) {
      if (!this.btnTips(data)) {
        return true;
      }
      return this.inrecovery.includes(data.rentHash);
    },
    includeRecovery(data) {
      return this.inrecovery.includes(data.rentHash);
    },
  },
  computed: {
    inWaitfors() {
      return this.$store.getters.inWaitfors || [];
    },

    inrecovery() {
      return this.$store.getters.inrecovery || [];
    },
    incompletes() {
      return this.$store.getters.incompletes || [];
    },
  },
  watch: {
    "$store.getters.deviceAddr": function (newVal) {
      this.loadPledge(newVal);
      this.loadTable(null, newVal);
    },
    rent_status: function () {
      this.loadTable(null, null, 1);
    },
    checkedRecovery: function () {
      this.loadTable(null, null, 1);
    },
    inrecovery: {
      immediate: true,
      handler(val) {
        if (val.length == 0 && this.rent_status == 100) {
          this.rent_status = null;
        }
      },
    },
  },
};
</script>
<style scoped>
.top_count_div {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}
.top_count_suffix {
  font-size: 12pt;
  font-weight: normal;
  margin-left: 8px;
}
.top_count_h4 {
  font-size: 20pt;
  text-align: center;
}
.top_count_time {
  font-size: 15pt;
  text-align: center;
  min-height: 32px;
}
</style>