<template>
  <div>
    <not-pledge v-if="isPledge" title="messages.norepeatedpledge" />
    <div
      v-else
      class="row ie_pledge_div"
      style="margin: 0px auto; padding: 0px; max-width: 380px; width: 100%"
    >
    
      <el-form
        :model="form.data"
        status-icon
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
        <el-form-item :label="$t('market.pledgeSpace')" size="mini">
          {{ utg_volume }}{{ $IEDATA.capacity }}
        </el-form-item>

        <el-form-item
          :label="$t('pledge.Estimatedfee')"
          size="mini"
          v-loading="form.priceLoading"
        >
          {{ `${form.data.price} ${$IEDATA.suffix}` }}
        </el-form-item>
        <el-form-item :label="$t('pledge.storageFactor')" size="mini">
          {{ storageVal }}
        </el-form-item>
        <el-form-item label-width="0px" v-loading="loading" prop="dayPrice">
          <label
            class="el-form-item__label"
            style="line-height: 20px; margin-bottom: 0px; width: 120px"
          >
            {{ $t("pledge.serverBandwidth") }}
          </label>

          <f-number
            style="min-width: 180px; max-width: 260px"
            v-model="form.data.bandwidth"
            :min="1"
            :max="999999999999"
            units="Mbps"
          />
          <div style="color: #888; line-height: 20px; text-align: left">
            {{ $t("messages.pleaseSlashed") }}
          </div>
        </el-form-item>
        <el-form-item
          :label="$t('pledge.bandwidthCoefficient')"
          size="mini"
          label-width="160px"
          >{{ bandwidthVal }}
        </el-form-item>
        <el-form-item
          label-width="0px"
          v-loading="loading"
          prop="dayPrice"
          v-show="false"
        >
          <label
            class="el-form-item__label"
            style="line-height: 20px; margin-bottom: 0px; width: 120px"
          >
            {{ $t("pledge.setRentalPrice") }}
            <span style="font-size: 10px"
              >{{ getDayPrice }}~{{ getDayPrice * 10 }}</span
            >
          </label>
          <f-number
            style="min-width: 180px; max-width: 260px"
            v-model="form.data.dayPrice"
            :min="getDayPrice"
            :max="getDayPrice * 10"
            :placeholder="`<=${getDayPrice * 10}`"
            :units="`${$IEDATA.currency} / 1${$IEDATA.capacity}·${$t(
              'comm.day'
            )}`"
          />
        </el-form-item>
      </el-form>
      <div
        class="foot-btn"
        style="
          width: 50%;
          text-align: center;
          border: none;
          margin: 0px auto;
          padding: 20px 20px;
        "
      >
        <el-button
          :disabled="form.priceLoading || btnDisabled"
          type="primary"
          @click="submitForm"
        >
          {{ $t("pledge.pledge") }}
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
    return {
      loading: false,
      socket: false,
      form: {
        priceLoading: false,
        data: { dayPrice: "0", price: "0", bandwidth: 30 },
        rules: {
          dayPrice: [
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
          ],
        },

        configList: [],
        configListS: [],
      },
      properts: {},
      bandwidth: [],
    };
  },
  created() {
    this.inits();
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
  },
  mounted() {
   
    this.getBalance();
  },
  methods: {
    getBalance() {
      let sdk = utils.getSdk();

      if (sdk) {
        sdk
          .getBalance()
          .then((response) => {
           
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
          obj["4"] = utils.clearZero(obj["4"]);
          this.properts = obj;
          this.form.data.dayPrice = obj["4"] || 0;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    submitForm() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
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
            this.onPledge(data);
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
            this.$emit("pledge");
            //this.$router.push("/home");
          }
        },
      };
      let device_address = this.datas.address || this.$store.getters.deviceAddr;
      let dayPrice = this.form.data.dayPrice;
      let bandwidth = this.form.data.bandwidth;
      let capacity = json.utg_volume;
      let verification = json.utg_package_poc;
      let block = json.utg_block;
      let block_hash = json.utg_block_hash;
      let nonce = json.utg_nonce;

      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson.streq,
        {
          device_address,
          dayPrice,
          capacity,
          block,
          nonce,
          block_hash,
          verification,
          bandwidth,
        },
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
        let volume = utils.storage(this.utg_volume, "g-m");
        this.$api.pledge
          .getVolume({ bandWidth: volume })
          .then((response) => {
            try {
              this.form.priceLoading = false;
              let price = utils.weedZero(response.result.utg, 4);

              this.form.data.price = price;
            } catch (error) {}
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
  },
  computed: {
    utg_volume() {
      return utils.storage(
        this.$store.getters.getDevice.utg_volume || 0,
        "g-g"
      );
    },
    storageVal() {
      let volume = this.utg_volume;
      if (!volume) {
        return 0;
      }
      let configListS = this.configListS || [];
      let item = configListS.find((item) => {
        if (volume > item.min && (!item.max || volume <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;
    },
    btnDisabled() {
      return this.form.priceLoading || !this.utg_volume;
    },
    getDayPrice() {
      return this.properts["4"] || 0;
    },
    bandwidthVal() {
      let bandwidth = this.form.data.bandwidth;
      if (!bandwidth) {
        return 0;
      }
      let configList = this.form.configList || [];
      let item = configList.find((item) => {
        if (bandwidth > item.min && (!item.max || bandwidth <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;
    },
  },

  watch: {
    utg_volume: function () {
      this.getVolume();
    },
    isPledge: {
      immediate: true,
      handler: function (newVal) {
        if (newVal) {
          this.$emit("pledge");
        }
      },
    },
   /* "$store.getters.getsdk": {
      immediate: true,
      handler: function () {
        this.getBalance();
      },
    },*/
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