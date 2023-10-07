<template>
  <el-dialog :title="$t('newManage.selectStoragePool')" :visible.sync="dialogVisible" width="95%">
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
        <el-button
          size="mini"
          type="primary"
          @click="onSelect(scope.data)"
          icon="el-icon-check"
          >{{$t('newManage.select')}}</el-button
        >
      </div>
    </h-tbale>
  </el-dialog>
</template>
<script >
import { setPageQuery } from "@/utils/table";
import HTbale from "@/components/modules/HTbale.vue";
import utils from "@/utils/utils.js";
export default {
  components: { HTbale },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let _this_ = this;
    return {
      dialogVisible: false,

      tableHeard: [
        {
          title: "newManage.storagePool",
          name: "hash",
          type: "address",
          minWidth: "120px",
          format: true,
        },
        {
          title: "newManage.storageFactor",
          name: "storageRatio",
          valMap: (val) => {
            return `${val || 0} `;
          },
        },
        {
          name: "entrustRate",
          title: "newManage.rewardDistributionRatio",
          valMap: (val) => {
            return `${val || 0} %`;
          },
        },
        {
          name: "totalCapacity",
          title: "home.maxSpace",
          valMap: (val) => {
            return `${utils.bytesToSize(val)}`;
          },
        },
        {
          name: "usedCapacity",
          title: "newManage.usedSpace",
          valMap: (val) => {
            return `${utils.bytesToSize(val)}`;
          },
        },
      ],
      tableData: [],
    };
  },
  methods: {
    loadTable(query, device_addr, current) {
      if (!query && this.$refs.hTable) {
        query = this.$refs.hTable.tableQuery;
      }
      if (!query) {
        return;
      }

      let redata = {
        //  device_addr,
        current: current || query.pageNum || 1,
        size: query.pageSize,
        status: 1,
      };

      query.table_loading = true;

      this.$api.consoleApi
        .getStoragePoolList(redata)
        .then((response) => {
          query.table_loading = false;
          let tableData = response.result.records || [];
          this.tableData = tableData;
          setPageQuery(query, response.result);
        })
        .catch((err) => {
          query.table_loading = false;
          console.log("error", err);
        });
    },
    onSelect(row) {
      this.$emit("select", row,this.tableHeard);
    },
    colClick(obj) {
      console.log("colClick", obj);
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.dialogVisible = newVal;
      },
    },
    dialogVisible(newVal) {
      this.$emit("input", newVal);
      this.$emit("change", newVal);
    },
  },
};
</script>