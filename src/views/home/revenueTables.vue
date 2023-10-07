<template>
  <div>
    <div class="container-fluid">
      <div class="card">
        <div class="card-body">
          <h-tbale
            @colClick="colClick"
            :heard-all-hid="true"
            :show-page="true"
            :table-heard="tableHeard"
            :table-data="tableData"
            :show-right-tools="false"
            @inint-ok="loadTable"
            @load="loadTable"
            :phone-lable-width="$i18n.locale == 'en' ? '92pt' : '60pt'"
            ref="hTable"
          >
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
export default {
  components: { HTbale },
  props: {
    type: { type: Number, default: 10000 },
  },
  data() {
    let _this_ = this;
    return {
      loadTime: null,

      tableData: [],
      types: {
        0: { label: "comm.application", color: "#23cbe0" },
        1: { label: "pledge.renting", color: "#3ea2ff" },
        2: { label: "pledge.leaseFailed", color: "red" },
        3: { label: "pledge.endLease", color: "#888" },
        4: { label: "pledge.endLease", color: "orange" },
        5: { label: "pledge.terminationProgress", color: "#888" },
        6: { label: "pledge.deleted", color: "red" },
      },
      tableHeard: [
        {
          name: "revenueaddress",
          title: "pledge.revenueAddress",
          type: "address",
          format: true,
        },

        {
          name: "blockNumber",
          title: "lock.blockNumber",
        },
        {
          name: "totalAmount",
          title: "lock.totalAmount",
          valMap(val, item) {
            let valL = new Decimal(val || 0);
            valL = valL.sub(item.releaseamount || 0);
            valL = utils.clearZero(valL.toFixed(8), 8);

            return `${valL} ${_this_.$IEDATA.suffix}`;
          },
        },
        {
          title: "lock.Released",
          name: "releaseamount",
          valMap(val, item) {
            return `${utils.clearZero(item.releaseamount || 0, 8)}  ${
              _this_.$IEDATA.suffix
            }`;
          },
        },
        {
          title: "lock.burningamount",
          name: "burntamount",
          valMap(val, item) {
            let valL = new Decimal(val || 0);
            let totalAmount = new Decimal(item.totalAmount || 0);

            if (valL.gt(0) && totalAmount.gt(0)) {
              valL = valL.div(totalAmount).mul(100);
              return `${utils.clearZero(val, 5)} ${
              _this_.$IEDATA.suffix
            } (${utils.weedZero(
                valL,
                2
              )}%)`;
            } else {
              return `${utils.clearZero(val, 5)} UTG (0%)`;
            }
          },
          more: true,
        },
        {
          title: "lock.lockNumber",
          name: "lockingTime",
          valMap: (val) => {
            return `${val} ${_this_.$t("table.days")}`;
          },
        },

        /* {
          name: "curtime",
          title: "comm.time",
          valMap: (val) => {
            return utils.formatTime(val);
          },
        },*/
      ],
    };
  },
  created() {
    this.loadTable();
  },
  beforeDestroy() {
    this.loadTime && clearTimeout(this.loadTime);
  },
  methods: {
    async loadTable(query, device_addr) {
      //DOTO--
     // device_addr = "ux344ea6265751ad53c249b801bc82aeaaa6bb50e1";

      if (!query && this.$refs.hTable) {
        query = this.$refs.hTable.tableQuery;
      }
      if (!query) {
        return;
      }
      device_addr = device_addr || this.$store.getters.deviceAddr;
      if (!device_addr) return;

      await utils.getNowHeight();
      query.table_loading = true;
      this.$api.home
        .getStorageRewardList({
          address: device_addr,
          current: query.pageNum || 1,
          size: query.pageSize,
          type: this.type,
        })
        .then((response) => {
          query.table_loading = false;
          let tableData = response.result.records || [];
          this.tableDatasConfig(tableData);
          this.tableData = tableData;
          setPageQuery(query, response.result);
        })
        .catch((err) => {
          query.table_loading = false;
          console.log("error", err);
        });
    },
    tableDatasConfig(data) {
      data.forEach((item, index) => {
        /* item.releaseamount = `${utils.clearZero(item.releaseamount, 8)}  ${
          this.$IEDATA.suffix
        }`;*/
        let totalAmount = utils.clearZero(
          (item.totalAmount || 0) - (item.releaseamount || 0),
          8
        );
        //item.totalAmount = `${totalAmount} ${this.$IEDATA.suffix}`;

        item.lockingTime =
          totalAmount == "0"
            ? 0
            : utils.lockingTime(
                item.startTime,
                item.avgBlockTime,
                item.unLockNumber,
                item.releaseHeigth
              );
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
    toExamine(scope) {
      console.log(scope);
      this.$router.push(`examine/${scope.data.rentHash}`);
    },
  },

  watch: {
    "$store.getters.deviceAddr": function (newVal) {
      this.loadTable(null, newVal);
    },
    type: function () {
      this.loadTable();
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