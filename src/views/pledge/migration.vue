<template>
  <div>
    <div
      class="row ie_pledge_div"
      style="margin: 0px auto; padding: 0px; max-width: 380px; width: 100%"
    >
      <el-form
        :model="form.data"
        :rules="form.rules"
        ref="ruleForm"
        label-width="120px"
        label-position="left"
        style="width: 100%"
      >
        <el-form-item :label="$t('pledge.storageAccount')" size="mini">
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$store.getters.deviceAddr"
          >
            <div slot="reference" class="overflow" style="width: 100%">
              {{ getAddrFormat($store.getters.deviceAddr) }}
            </div>
          </el-popover>
        </el-form-item>
        <el-form-item :label="$t('newManage.managedAccount')" size="mini">
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="ancestorNode.managerAddr"
          >
            <div slot="reference" class="overflow" style="width: 100%">
              {{ getAddrFormat(ancestorNode.managerAddr) }}
            </div>
          </el-popover>
        </el-form-item>
        <el-form-item :label="$t('lock.pledgeAddress')" size="mini">
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="ancestorNode.pledgeAddr"
          >
            <div slot="reference" class="overflow" style="width: 100%">
              {{ getAddrFormat(ancestorNode.pledgeAddr) }}
            </div>
          </el-popover>
        </el-form-item>
        <el-form-item :label="$t('home.pledgeAmount')" size="mini">
          {{ toPrice(ancestorNode.pledgeAmount) }}{{ "  " }}{{ $IEDATA.suffix }}
        </el-form-item>

        <el-form-item :label="$t('home.pledgeTime')" size="mini">
          {{ formatTime(ancestorNode.instime) }}
        </el-form-item>
        <el-form-item :label="$t('home.pledgeCapacity')" size="mini">
          {{ storage(ancestorNode.declareSpace) }}{{ $IEDATA.capacity }}
        </el-form-item>
        <el-form-item :label="$t('home.totalRevenue')" size="mini">
          {{ toPrice(ancestorNode.totalAmount) }}{{ "  " }}{{ $IEDATA.suffix }}
        </el-form-item>

        <el-form-item :label="$t('logs.sealSize')" size="mini">
          {{ utg_volume }}{{ $IEDATA.capacity }}
        </el-form-item>
      </el-form>
      <div
        class="foot-btn"
        style="text-align: center; border: none; margin: 0px auto"
      >
        <el-button
          type="primary"
          class="btn btn-primary btn-block waves-effect waves-light"
          :loading="loading"
          @click="submitForm"
        >
          {{ $t("newManage.nodeMigration") }}
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>
import FNumber from "@/components/modules/fNumber.vue";
import webSdk from "@/utils/webSdk";
import utils from "@/utils/utils";
import { createWebsocket } from "@/utils/websocket.js";
import notPledge from "./notPledge";
import { ethers } from "ethers";
import { Dialog } from "vant";
import { Decimal } from "decimal.js";
export default {
  components: { FNumber, notPledge },
  props: {
    datas: {
      type: Object,
      default() {
        return {};
      },
    },
    isPledge: {
      type: Boolean,
      default: false,
    },
    ancestorNode: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    let _this_ = this;
    let MODUL_SWHITCH = window.$config.MODUL_SWHITCH;
    return {
      MODUL_SWHITCH,
      loading: false,
      socket: false,
      clickSpeed: false,
      form: {
        priceLoading: false,
        data: {},
        rules: {},

        configList: [],
        configListS: [],
      },
      properts: {},
      bandwidth: [],
      acBalance: "0.0",
      getBalanceTime: null,
    };
  },
  created() {},
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
    this.getBalanceTime && clearInterval(this.getBalanceTime);
  },
  mounted() {
    this.getBalance();
    this.getBalanceTime = setInterval(() => {
      this.getBalance();
    }, 8000);
  },
  methods: {
    toPrice(val, num = 8) {
      return utils.price(val || 0, num);
    },
    formatTime(val) {
      return utils.formatTime(val || 0);
    },
    storage(val) {
      return utils.storage(val || 0);
    },
    getBalance(fun) {
      let sdk = utils.getSdk(this, false);

      if (sdk) {
        sdk
          .getBalance()
          .then((response) => {
            this.acBalance = response;
            fun && fun();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    getAddrFormat(val, num = 9) {
      return utils.getAddrFormat(val, num);
    },

    walletSelect() {
      return utils.walletSelect(this, this.ancestorNode.managerAddr);
    },
    submitForm() {
      this.getBalance();
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let reObj = this.walletSelect();
        if (!reObj) return;
        this.getPoc();
      });
    },
    getPoc() {
      let timeOk = true;
      let toast = this.$toast.loading({
        message: "Loading...",
        forbidClick: true,
        duration: 30000,
        onClose: () => {
          timeOk = false;
        },
      });

      let _this_ = this;
      let utg_nonce = "";
      let utg_block = "";
      let utg_block_hash = "";
      let send = function () {
        _this_.socket.sendWSPush(
          {
            utg_nonce,
            utg_block,
            utg_block_hash,
          },
          4,
          true
        );
      };

      let autofun = {
        onopen: () => {
          let addr = webSdk.sdkUtils.getSelectAddress();

          //_this_.$api.rpc.nonce(addr).then((nonce) => {

          _this_.$api.rpc
            .blockNumber()
            .then((block) => {
              if (typeof block == "string" && block.includes("0x")) {
                block = parseInt(block);
                block = `0x${(block > 50 ? block - 50 : block).toString(16)}`;
              } else {
                block = block > 50 ? block - 50 : block;
              }

              _this_.$api.rpc.blockHash(block).then((hashJson) => {
                let nonce = hashJson.nonce;
                let block_hash = hashJson.hash;
                utg_nonce = nonce;
                utg_block = block;
                utg_block_hash = block_hash;
                send();
              });
            })
            .catch((err) => {
              console.log(err);
              timeOk = false;
              toast.clear();
            });
        },
        onmessage: (data) => {
          if (data.cmd == 4) {
            toast.clear();
            this.pledgeStart(data);
          }
        },
        onerror: () => {
          toast.clear();
        },
        onRepeat: (data) => {
          if (data.cmd == 4) {
            setTimeout(() => {
              if (timeOk) {
                send();
              } else {
                this.socket.linkOk && this.socket.closeSocket();
              }
            }, 2000);
          }
        },
      };
      if (this.socket) {
        this.socket.init();
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },
    async pledgeStart(json) {
      this.onPledge(json);
    },

    onPledge(json) {
      let reObj = this.walletSelect();
      if (!reObj) return;
      let { sdk } = reObj;

      let setData = {
        title: `${this.$t("newManage.nodeMigration")}`,
        context: "",
        request: null,
        closebtnshow: false,
        closeWin: (type) => {
          if (type == 2) {
            this.$router.push("/home");
          }
        },
      };
      let device_address = this.$store.getters.deviceAddr;
      let capacity = json.utg_volume;
      let verification = json.utg_poc || json.utg_package_poc;
      let block = json.utg_block;
      let block_hash = json.utg_block_hash;
      let nonce = json.utg_nonce;

      let reJson = {
        device_address,
        capacity,
        block,
        nonce,
        block_hash,
        verification,
      };
      if (
        !utils.jsonProve(reJson, [
          "verification",
          "capacity",
          "block",
          "block_hash",
          "nonce",
        ])
      ) {
        return;
      }
      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson.streplace,
        reJson,
        setData
      );
      this.$store.dispatch("setNotification", setData);
    },
  },
  computed: {
    utg_volume() {
      return utils.storage(
        this.$store.getters.getDevice.utg_volume || 0,
        "g-g"
      );
    },
  },

  watch: {
    isPledge: {
      immediate: true,
      handler: function (newVal) {
        if (newVal) {
          //DOTO--
          // this.$emit("pledge");
        }
      },
    },
    "$store.getters.account": function () {
      // this.getBalance();
    },
    "$store.getters.getsdk": {
      immediate: true,
      handler: function () {
        //   this.getBalance();
      },
    },
  },
};
</script>
<style >
.el-button--primary {
  background-color: #23cbe0;
  border: 1px solid #23cbe0;
}

.ie_pledge_div .el-form-item__content {
  text-align: right;
  font-weight: 600;
}

.ie_pledge_div .el-form-item {
  border-bottom: 1px solid #eee;
}
</style>