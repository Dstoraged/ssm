<template>
  <div>
    <not-pledge v-if="isPledge" title="messages.norepeatedpledge" />
    <div v-else class="row ie_pledge_div" style="margin: 0px auto; padding: 0px; max-width: 380px; width: 100%">
      <el-form :model="form.data" :rules="form.rules" ref="ruleForm" label-width="120px" label-position="left"
        style="width: 100%">
        <el-form-item :label="$t('pledge.storageAccount')" size="mini">
          <el-popover placement="bottom" trigger="hover" :content="$store.getters.deviceAddr">
            <div slot="reference" class="overflow" style="width: 100%">
              {{ getAddrFormat($store.getters.deviceAddr) }}
            </div>
          </el-popover>
        </el-form-item>
        <el-form-item :label="$t('market.pledgeSpace')" size="mini">
          {{ utg_volume }}{{ $IEDATA.capacity }}
        </el-form-item>

        <el-form-item :label="$t('pledge.storageFactor')" size="mini">
          {{ storageVal }}
        </el-form-item>

        <el-form-item label-width="0px" v-loading="loading" prop="bandwidth">
          <label class="el-form-item__label" style="line-height: 20px; margin-bottom: 0px; width: 100%">
            {{ $t("pledge.serverBandwidth") }}
          </label>

          <f-number style="width: 100%" v-model="form.data.bandwidth" reValType="number" :control="true"
            :control-step="10" :min="20" :max="9999" units="Mbps" :disabled="!clickSpeed" />

          <div style="
              color: orange;
              line-height: 20px;
              text-align: left;
              font-size: 14px;
            " v-if="!clickSpeed">
            {{ $t("messages.pleaseclickTest") }}
            <el-button type="text" @click="testNetwork" style="margin-left: 8px">{{ $t("messages.BandwidthTest")
            }}</el-button>
          </div>
          <el-slider v-model.number="form.data.bandwidth" :step="1" :min="20" :tooltip="false" :show-tooltip="false"
            :max="9999" v-show="clickSpeed" />

          <div v-show="clickSpeed" style="color: #888; line-height: 20px; text-align: left">
            {{ $t("messages.pleaseSlashed") }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('pledge.pledgeCoefficient')" size="mini" label-width="160px">{{ bandwidthVal }}
        </el-form-item>

        <el-form-item label-width="0px" v-loading="loading" prop="dayPrice" v-if="MODUL_SWHITCH.show_rent">
          <label class="el-form-item__label" style="line-height: 20px; margin-bottom: 0px; width: 100%">
            {{ $t("pledge.setRentalPrice") }}
            <span style="font-size: 10px">{{ getDayPriceMin }}~{{ getDayPriceMax }}</span>
          </label>

          <f-number style="min-width: 180px; max-width: 100%" v-model="form.data.dayPrice" reValType="number"
            :step="dayPriceAccuracy" :control="true" :control-step="getDayPriceMin" :min="getDayPriceMin"
            :max="getDayPriceMax" :placeholder="`<=${getDayPriceMax}`" :units="`${$IEDATA.currency} / 1${$IEDATA.capacity}·${$t(
              'comm.day'
            )}`" />

          <el-slider v-model="form.data.dayPrice" :step="Number(getDayPriceMin)" :min="Number(getDayPriceMin)"
            :tooltip="false" :show-tooltip="false" :max="Number(getDayPriceMax)" />
        </el-form-item>
        <el-form-item :label="$t('pledge.Estimatedfee')" size="mini" v-loading="form.priceLoading">
          {{ `${Estimatedfee} ${$IEDATA.suffix}` }}
        </el-form-item>
        <el-form-item label-width="0px" v-loading="loading" prop="pledgeRatio">
          <label class="el-form-item__label" style="line-height: 20px; margin-bottom: 0px; width: 100%">
            {{ $t("home.pledgeAmount") }}
            <span style="font-size: 10px">30%~100%</span>
          </label>

          <f-number style="min-width: 180px; max-width: 100%" v-model="form.data.pledgeRatio" reValType="number" step="1"
            :control="true" control-step="1" :min="30" :max="100" placeholder="30~100" :units="`%`" />

          <el-slider v-model="form.data.pledgeRatio" :step="1" :min="30" :tooltip="false" :show-tooltip="false"
            :max="100" />
        </el-form-item>
        <transition name="el-fade-in" mode="out-in">
          <el-form-item label-width="0px" v-loading="loading" prop="ratio" v-show="form.data.pledgeRatio != 100">
            <label class="el-form-item__label" style="line-height: 20px; margin-bottom: 0px; width: 100%">
              {{ $t("pledge.rewardRatio") }}
              <span style="font-size: 10px">0~100</span>
            </label>

            <f-number style="min-width: 180px; max-width: 100%" v-model="form.data.ratio" reValType="number" step="1"
              :control="true" control-step="1" :min="0" :max="100" placeholder="0~100" :units="`%`" />

            <el-slider v-model="form.data.ratio" :step="1" :min="0" :tooltip="false" :show-tooltip="false" :max="100" />
          </el-form-item>
        </transition>
        <!-- <el-form-item v-if="balanceLack" :label="$t('pledge.walletBalance')">
          <div
            :style="{ width: '100%', color: balanceLack ? 'orange' : '' }"
            class="overflow"
          >
            {{ `${acBalance} ${$IEDATA.suffix}` }}
          </div>
        </el-form-item>-->
      </el-form>
      <div class="foot-btn" style="text-align: center; border: none; margin: 0px auto">
        <!-- <div style="color: orange" v-show="balanceLack">
          {{ $t("messages.insufficientBalance") }}
        </div>-->
        <el-button :disabled="form.priceLoading ||
          btnDisabled ||
          !clickSpeed ||
          voucherMaps.length > 0
          " type="primary" @click="submitForm">
          {{ $t("pledge.pledge") }}
        </el-button>
        <div v-show="voucherMaps.length > 0" style="color: red">
          {{ $t("market.equipmentlease") }}
        </div>
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
        data: {
          dayPrice: 0,
          price: "0",
          bandwidth: 30,
          ratio: 0,
          pledgeRatio: 100,
        },
        rules: {
          bandwidth: [
            {
              validator: (rule, value, callback) => {
                if (value > 0) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.notAvailable")));
                }
              },
              trigger: "change",
            },
          ],
          //DOTO
          /* dayPrice: [
            {
              required: true,
              message: _this_.$t("messages.notAvailable"),
              trigger: "blur",
            },

            {
              validator: (rule, value, callback) => {
                if (value > 0) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.notAvailable")));
                }
              },
              trigger: "blur",
            },
          ],*/
        },

        configList: [],
        configListS: [],
      },
      properts: {},
      bandwidth: [],
      acBalance: "0.0",
      getBalanceTime: null,
    };
  },
  created() {
    this.inits();
  },
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
    inits() {
      this.loadProperty();
      this.getVolume();
      this.getConfigList();
      this.getConfigListStorages();
    },

    loadProperty() {
      this.loading = true;
      this.$api.pledge
        .getSet()
        .then((re) => {
          this.loading = false;
          let obj = re.result;
          obj["4"] = utils.clearZero(obj["4"], 18);
          this.properts = obj;
          this.form.data.dayPrice = Number(obj["4"] || 0);
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    submitForm() {
      this.getBalance();
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        if (!this.upkeyd) {
          Dialog.confirm({
            title: this.$t("comm.warning"),
            className: "warningText",
            message: this.$t("messages.notUpkey"),
            cancelButtonText: `${this.$t("table.cancel")}`,
            confirmButtonText: `${this.$t("pledge.upkey")}`,
          })
            .then(() => {
              this.$emit("jumpUpload");
            })
            .catch(() => {
              // on cancel
            });
          return;
        }
        let sdk = utils.getSdk(this);
        if (!sdk) return;
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
      let verOk = await utils.mobileVersion(false);

      if (this.balanceLack && verOk) {
        Dialog.alert({
          title: `${this.$t("comm.warning")} `,
          message: `${this.$t("messages.insufficientBalance")}  ${this.$t(
            "messages.continuePledge"
          )}`,
          confirmButtonText: `${this.$t("pledge.pledge")} `,
          cancelButtonText: `${this.$t("table.cancel")} `,
          showCancelButton: true,
        })
          .then(() => {
            this.onPledge(json);
          })
          .catch(() => {
            // on cancel
          });
      } else {
        this.onPledge(json);
      }
    },

    onPledge(json) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;
      let setData = {
        title: `${this.$t("pledge.storagePledge")}`,
        context: "",
        request: null,
        closebtnshow: false,
        closeWin: (type) => {
          if (type == 2) {
            //this.$emit("pledge");
            this.$router.push("/home");
          }
        },
      };
      let device_address = this.datas.address || this.$store.getters.deviceAddr;
      let dayPrice = new Decimal(this.form.data.dayPrice).toFixed();
      let bandwidth = new Decimal(this.form.data.bandwidth).toFixed();
      let capacity = json.utg_volume;
      let verification = json.utg_poc || json.utg_package_poc;
      let block = json.utg_block;
      let block_hash = json.utg_block_hash;
      let nonce = json.utg_nonce;

      let pledgeRatio = this.form.data.pledgeRatio || 0;
      let ratio = pledgeRatio == 100 ? 0 : this.form.data.ratio || 0;
      ratio = ratio * 100;
      //DOTO
      dayPrice = dayPrice || "0.0005";

      let reJson = {
        device_address,
        dayPrice,
        capacity,
        block,
        nonce,
        block_hash,
        verification,
        bandwidth,
        pledgeRatio,
        ratio,
      };
      if (
        !utils.jsonProve(reJson, [
          "capacity",
          "verification",
          "block",
          "block_hash",
          "nonce",
        ])
      ) {
        return;
      }
      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson.streq,
        reJson,
        setData
      );
      this.$store.dispatch("setNotification", setData);
    },
    getVolume(timeout = 800) {
      this.form.priceLoading = true;
      this.form.data.price = "0";
      if (this.setTime) {
        clearTimeout(this.setTime);
        this.setTime = null;
      }

      this.setTime = setTimeout(() => {
        let volume = utils.storage(this.utg_volume, "g-b");
        let bandwidth = this.form.data.bandwidth || 0;
        this.$api.pledge
          .getVolume({ bandwidth, declare_space: volume })
          .then((response) => {
            try {
              this.form.priceLoading = false;
              let price = utils.price(response.result.utg || "0", 4);
              this.form.data.price = price;
            } catch (error) { }
          })
          .catch(() => {
            //this.form.priceLoading = false;
          });
      }, timeout);
    },
    getConfigListStorages() {
      this.$api.consoleApi
        .ConfigList("s")
        .then((re) => {
          this.configListS = re.result || [];
          //this.storages
        })
        .catch((err) => {
          console.error(err);
        });
    },

    getConfigList() {
      this.$api.consoleApi
        .ConfigList("w")
        .then((re) => {
          this.form.configList = re.result || [];
        })
        .catch((err) => {
          console.error(err);
        });
    },

    testNetwork() {
      this.clickSpeed = true;
      utils.testNetwork();
    },
  },
  computed: {
    Estimatedfee() {
      let pledgeRatio = this.form.data.pledgeRatio || 0
      let price = this.form.data.price || 0
      return utils.uumbersHandle([pledgeRatio, 100, price], ["/", "*"], 4);

    },
    voucherMaps() {
      let map = this.$store.getters.voucherMap || {};
      return Object.keys(map);
    },
    utg_volume() {
      return utils.storage(
        this.$store.getters.getDevice.utg_volume || 0,
        "g-g"
      );
    },
    upkeyd() {
      let utg_prikey_exsit = this.$store.getters.getDevice.utg_prikey_exsit;
      return utils.isEmpty(utg_prikey_exsit) ? true : !!utg_prikey_exsit;
    },
    storageVal() {
      let volume = this.utg_volume;
      if (!volume) {
        return 0;
      }
      return utils.calStorageNewRatio(volume);
      /* let configListS = this.configListS || [];
      let item = configListS.find((item) => {
        if (volume > item.min && (!item.max || volume <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;*/
    },
    btnDisabled() {
      return this.form.priceLoading || !this.utg_volume;
    },
    getDayPrice() {
      return this.properts["4"] || 0;
    },
    getDayPriceMin() {
      return new Decimal(this.getDayPrice).div(10).toFixed();
    },
    getDayPriceMax() {
      return new Decimal(this.getDayPrice).mul(10).toFixed();
    },
    dayPriceAccuracy() {
      return `${1 / utils.toNumber(1, this.properts["10"] || 5)}`;
    },
    bandwidthVal() {
      let bandwidth = this.form.data.bandwidth;
      if (!bandwidth) {
        return 0;
      }
      return utils.getBandwidthPledgeRatio(bandwidth);
      /*let configList = this.form.configList || [];
      let item = configList.find((item) => {
        if (bandwidth > item.min && (!item.max || bandwidth <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;*/
    },
    balanceLack() {
      let price = new Decimal(this.Estimatedfee || 0);
      let acBalance = new Decimal(this.acBalance || 0);
      return this.$store.getters.getsdk && price.gt(acBalance);
    },
  },

  watch: {
    utg_volume: function () {
      this.getVolume();
    },
    "form.data.bandwidth": function () {
      this.getVolume();
    },
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
      this.getBalance();
    },
    "$store.getters.getsdk": {
      immediate: true,
      handler: function () {
        this.getBalance();
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