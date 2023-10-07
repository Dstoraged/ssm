<template>
  <el-form
    ref="ruleForm"
    :label-width="$i18n.locale == 'en' ? '95pt' : '80pt'"
    label-position="left"
    style="width: 100%"
    size="mini"
  >
    <el-form-item
      v-for="(item, cd) in headers"
      :key="cd"
      :label="item.titleNotT ? item.label : $t(item.label)"
      size="mini"
    >
      <el-popover
        v-if="item.tooltip"
        placement="bottom"
        trigger="hover"
        :content="getDataVal(item, datas)"
      >
        <div
          class="overflow"
          :style="{ width: '100%', color: getDataColor(item, datas) }"
          slot="reference"
        >
          <template v-if="item.address">
            <div class="overflow_pc">
              {{ getAddrFormat(getDataVal(item, datas), 16) }}
            </div>
            <div class="overflow_app">
              {{ getAddrFormat(getDataVal(item, datas)) }}
            </div>
            <!--<div class="overflow_l">
              {{ addrSplit(getDataVal(item, datas)) }}
            </div>
            <div class="overflow_r">
              {{ addrSplit(getDataVal(item, datas), false) }}
            </div>-->
          </template>
          <template v-else> {{ getDataVal(item, datas) }}</template>
        </div>
      </el-popover>

      <div v-else :style="{ color: getDataColor(item, datas) }">
        {{ getDataVal(item, datas) }}
      </div>
    </el-form-item>

    <el-form-item :label="$t('market.rentalPretreatment')" size="mini">
      <el-popover
        placement="bottom"
        trigger="hover"
        :content="
          isEncapsulationd ? $t('market.complete') : $t('market.unfinished')
        "
      >
        <div
          class="overflow"
          slot="reference"
          :style="{
            width: '100%',
            color: isEncapsulationd ? 'rgb(62, 162, 255)' : '',
          }"
        >
          {{
            isEncapsulationd ? $t("market.complete") : $t("market.unfinished")
          }}
        </div>
      </el-popover>
    </el-form-item>

    <el-form-item
      v-if="datas.rentStatus === 0"
      :label="$t('pledge.pledgeAmount')"
      size="mini"
    >
      {{ pledgeAmount }}
    </el-form-item>

    <template v-if="showPledgeForm">
      <el-form-item
        v-for="item in pledge_headers"
        :key="item.name"
        :label="item.titleNotT ? item.label : $t(item.label)"
        size="mini"
      >
        <el-popover
          v-if="item.tooltip"
          placement="bottom"
          trigger="hover"
          :content="getDataVal(item, datas)"
        >
          <div
            class="overflow"
            :style="{ width: '100%', color: getDataColor(item, datas) }"
            slot="reference"
          >
            <template v-if="item.address">
              <div class="overflow_pc">
                {{ getAddrFormat(getDataVal(item, datas), 16) }}
              </div>
              <div class="overflow_app">
                {{ getAddrFormat(getDataVal(item, datas)) }}
              </div>
            </template>
            <template v-else> {{ getDataVal(item, datas) }}</template>
          </div>
        </el-popover>

        <div v-else :style="{ color: getDataColor(item, datas) }">
          {{ getDataVal(item, datas) }}
        </div>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import utils from "@/utils/utils";
import { Notification as Message } from "element-ui";
import { Dialog } from "vant";
export default {
  props: {
    datas: {
      //getRentInfo
      type: Object,
      default() {
        return {};
      },
    },
    isEncapsulationd: {
      type: Boolean,
      default: false,
    },
    unLoading: {
      type: Boolean,
      default: false,
    },
    pledgeAmount: {
      type: [String, Number],
      default: "0",
    },
    isRent: {
      type: Boolean,
      default: false,
    },

    application: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let _this_ = this;

    let delayed_block = window.$config.delayed_block;
    return {
      delayed_block,
      headers: [
        {
          label: "market.rentalAddress",
          name: "rentAddr",
          address: true,
          tooltip: true,
        },
        {
          label: "HASH",
          name: "rentHash",
          tooltip: true,
          address: true,
          titleNotT: true,
        },
        {
          label: "loadingSubPan.state",
          name: "rentStatus",
          type: "rentStatus",
        },
        {
          label: "market.rentedSpace",
          name: "rentSpace",
          //  type: "storage",
          suffix: _this_.$IEDATA.capacity,
        },

        {
          label: "pledge.rentalPrice",
          name: "rentPrice",
          type: "price",
          suffixFun: () => {
            return `${_this_.$IEDATA.currency} / 1${
              _this_.$IEDATA.capacity
            }·${_this_.$t("table.days")}`;
          },
        },
        {
          label: "pledge.rentalDuration",
          name: "rentTime",

          suffixFun: () => {
            return `${_this_.$t("table.days")}`;
          },
        },
        {
          label: "market.rentalAmount",
          name: "rentAmount",
          type: "price",
          suffix: _this_.$IEDATA.currency,
        },
        { name: "rentNumber", label: "lock.blockNumber" },
        {
          name: "instime",
          label: "market.applicationTime",
          type: "time",
          tooltip: true,
        },
      ],

      pledge_headers: [
        {
          label: "market.pledgeAccount",
          name: "pledgeAddr",
          address: true,
          tooltip: true,
        },
      ],
      types: {
        "-1": { label: "market.leaseFailed", color: "#67c23a" },
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
      vaildStatusTypes: {
        1: { label: "comm.success", color: "#3ea2ff" },
        0: { label: "comm.fail", color: "red" },
      },
    };
  },
  methods: {
    getDataVal(item, datas) {
      let name = item.name;
      let valL = datas[name];
      if (utils.isEmpty(valL)) {
        return "";
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
        case "rentStatus":
          let typeItem = this.types[`${valL}`] || {};

          valL = this.$t(typeItem.label || "");
          break;
        case "vaildStatus":
          let itemL = this.vaildStatusTypes[valL];
          if (itemL) {
            return this.$t(itemL.label || "");
          } else {
            return "";
          }
        case "reqType":
          let rentypeItem = this.rentTypes[valL] || {};
          valL = this.$t(rentypeItem.label || "");

          break;
      }
      let suffix = item.suffix || (item.suffixFun && item.suffixFun()) || "";
      return `${utils.isEmpty(valL) ? "---" : valL} ${suffix}`;
    },
    getDataColor(item, datas) {
      let name = item.name;
      let valL = datas[name];
      if (utils.isEmpty(valL)) {
        return "";
      }

      switch (item.type) {
        case "vaildStatus":
          let itemL = this.vaildStatusTypes[valL];
          if (itemL) {
            return itemL.color;
          } else {
            return "";
          }

        case "rentStatus":
          let typeItem = this.types[valL] || {};
          return typeItem.color || "";
      }

      return "";
    },
    addrSplit(val, left = true) {
      return utils.addrSplit(val, left);
    },
    getAddrFormat(val, num = 8) {
      return utils.getAddrFormat(val, num);
    },
    recovery() {
      this.loadBlock((block, item) => {
        this.$emit("recovery");
      });
    },
    onUnPackge() {
      let sdk = utils.getSdk(this);
      if (!sdk) return;

      this.loadBlock((block, item) => {
        if (!block) return;
        this.$emit("onUnPackge", block);
        //DOTO----
        /*
        let interval_block = block -(50+parseInt(item.utg_block_number||0) );
        //DOTO--
        if (interval_block > this.delayed_block) {
          this.$emit("onUnPackge", block);
        } else {
          Dialog.alert({
            message: `${this.$t("messages.delayedNot")}`,
            theme: "round-button",
            confirmButtonText: this.$t("table.confirm"),
          }).then(() => {});
        }*/
      });
    },
    loadBlock(fun) {
      let voucherMap = this.$store.getters.voucherMap || {};
      let item = voucherMap[this.datas.rentHash];

      if (item) {
        let loadings = true;
        let toast = this.$toast.loading({
          message: `Loading...`,
          forbidClick: true,
          duration: 60000,
          onClose: () => {
            loadings = false;
          },
        });
        this.$api.rpc
          .blockNumber()
          .then((re) => {
            if (!loadings) return;
            toast.clear();
            let block = parseInt(re);
            fun && fun(block, item);
          })
          .catch((err) => {
            console.log(err);
            Message.error(err);
          });
      }
    },
  },
  computed: {
    showPledgeForm() {
      return (
        this.datas.rentStatus !== 0 &&
        this.datas.rentStatus !== -1 &&
        this.datas.rentStatus !== 7
      );
    },
  },
};
</script>
<style >
.el-button--primary {
  background-color: #23cbe0;
  border: 1px solid #23cbe0;
}
.ie_pledge_div .el-form-item {
  border-bottom: 1px solid #eee;
}
.ie_pledge_div .el-form-item__content {
  text-align: right;
  font-weight: 600;
}
</style>