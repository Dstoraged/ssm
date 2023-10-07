<template>
  <div>
    <div class="container-fluid">
      <div class="card">
        <div class="card-body">
          <h4 class="mt-0 header-title" style="width: 100%; text-align: left">
            {{ $t("market.renewalList") }}
          </h4>

          <h-tbale
            @colClick="colClick"
            :heard-all-hid="true"
            :show-page="true"
            :table-heard="tableHeard"
            :table-data="tableData"
            :show-right-tools="true"
            @inint-ok="loadTable"
            @load="loadTable"
            :phone-lable-width="$i18n.locale == 'en' ? '92pt' : '60pt'"
            ref="hTable"
          >
            <div slot="rightCol" slot-scope="scope">
              <el-button
                v-if="scope.data.reqStatus === 2"
                :disabled="
                  isIncomplete || !isRent || scope.data.webBtnDis || overtime
                "
                size="mini"
                style="min-width: 50px"
                type="primary"
                @click="pledgeStart(scope.data)"
              >
                {{ $t("market.agree") }}
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
import utils from "@/utils/utils";
import { Decimal } from "decimal.js";
import { Dialog } from "vant";
import webSdk from "@/utils/webSdk";
export default {
  components: { HTbale },
  props: {
    hash: {
      type: String,
      default: "",
    },
    isRent: {
      type: Boolean,
      default: false,
    },
    isIncomplete: {
      type: Boolean,
      default: true,
    },
    overtime: {
      type: Boolean,
      default: true,
    },
    exchRate: {
      type: [String, Number],
      default: "0",
    },
    pledgeAddr: {
      type: String,
      default: "",
    },
  },
  data() {
    let _this_ = this;

    return {
      block_day: window.$config.BLOCK_DAY,
      loadTableTime: null,

      tableHeard: [
        {
          name: "reqStatus",
          title: "loadingSubPan.state",
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
        {
          name: "reqType",
          title: "market.rentalType",

          valMap: (val) => {
            let item = _this_.rentTypes[val] || "";
            if (!item) {
              return "";
            }

            return _this_.$t(item.label);
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
        { name: "reqNumber", title: "lock.blockNumber" },
        {
          name: "instime",
          title: "market.applicationTime",
          valMap: (val) => {
            return utils.formatTime(val);
          },
        },
      ],
      tableData: [],
      types: {
        0: { label: "market.requestExpired", color: "#aaa" },
        1: { label: "market.passed", color: "#3ea2ff" },
        2: { label: "market.applications", color: "#67c23a" },
        3: { label: "market.requestExpired", color: "#aaa" },
        /*  3: { label: "comm.removing", color: "red" },
        4: { label: "pledge.breachContract", color: "orange" },
        //  5: { label: "pledge.terminationProgress", color: "#888" },
        6: { label: "pledge.deleted", color: "red" },*/
      },
      rentTypes: {
        stRent: { label: "market.rent", color: "#67c23a" },
        stReNew: { label: "market.renewal", color: "#3ea2ff" },
      },
    };
  },
  mounted() {},
  beforeDestroy() {
    this.loadTableTime && clearTimeout(this.loadTableTime);
  },
  methods: {
    pledgeStart(datas) {
      let sdk = utils.getSdk(this);
      if (!sdk || !this.pledgeAddr) return;
      let select = this.$store.getters.account;
      let pledgeAddr = this.pledgeAddr;
      try {
        pledgeAddr = webSdk.sdkUtils.hashToNX(pledgeAddr, true).toLowerCase();
        select = webSdk.sdkUtils.hashToNX(select, true).toLowerCase();
      } catch (error) {}
      if (select != pledgeAddr) {
        Dialog.alert({
          message: `${this.$t("messages.pleasePledge")} : ${pledgeAddr}`,
          theme: "round-button",
          confirmButtonText: this.$t("table.confirm"),
        }).then(() => {});
        return;
      }

      this.$emit("pledgeStart", true, this.pledgeAmount(datas));
    },
    async loadTable(query, device_addr) {
      this.loadTableTime &&
        clearTimeout(this.loadTableTime) &&
        (this.loadTableTime = null);

      if (!query && this.$refs.hTable) {
        query = this.$refs.hTable.tableQuery;
      }
      device_addr = device_addr || this.$store.getters.deviceAddr;
      if (!query || !this.hash || !device_addr) {
        return;
      }

      if (!device_addr) return;

      let nowBlock = await utils.getNowHeight();

      query.table_loading = true;
      this.$api.consoleApi
        .tablePage({
          device_addr,
          current: query.pageNum || 1,
          size: query.pageSize,
          req_types: ["stReNew"],
          rent_hash: this.hash,
        })
        .then((response) => {
          query.table_loading = false;
          let tableData = response.result.records || [];
          tableData.forEach((element) => {
            element.pledgeAmount = "";
            let maxBlock = parseInt(element.reqNumber || 0) + this.block_day;
            element.webBtnDis = parseInt(nowBlock || 0) > maxBlock;
          });

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
    getDataVal(item, datas) {
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
          valL = utils.price(valL, 8);
          break;
        case "storage":
          valL = utils.storage(valL);
          break;
      }
      return `${utils.isEmpty(valL) ? "---" : valL}`;
    },
    pledgeAmount(datas) {
      let exchRate = new Decimal(this.exchRate || 0);
      let rentPrice = new Decimal(
        utils.clearZero(datas.rentPrice || 0, 18) || 0
      );
      let rentTime = new Decimal(datas.rentTime || 0);
      let rentSpace = new Decimal(utils.storage(datas.reqSpace, "b-g"));
      if (
        exchRate.isZero() ||
        rentPrice.isZero() ||
        rentTime.isZero() ||
        rentSpace.isZero()
      ) {
        return "";
      }
      debugger;
      let reNumber = rentPrice
        .mul(rentSpace)
        .mul(rentTime)
        .mul(10000)
        .div(exchRate);
      return `${reNumber.toFixed(4)} ${this.$IEDATA.suffix}`;
    },
  },
  watch: {
    "$store.getters.deviceAddr": function (newVal) {
      this.loadTable(null, newVal);
    },
    hash: {
      immediate: true,
      handler: function () {
        this.loadTable();
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