<template>
  <div>
    <div style="text-align: center">
      <div style="margin: 0px auto; max-width: 500px">
        <span style="font-size: 18px" :title="hashToNX(address || $store.getters.deviceAddr)">
          {{ addrFormat(address || $store.getters.deviceAddr) }}</span>
        <div class="col-12 state-div">
          <span :style="`color: ${getStatuColor}; font-size: 16pt`">
            <span v-show="getStatuLabel"> {{ $t("home.deviceState") }}:</span>{{ $t(getStatuLabel ||
              "messages.nowEncapsulation") }}</span>
        </div>
      </div>

      <div v-show="progressShow">
        <h4 class="font-26 m-1" style="text-align: center">
          {{ completion }}%<span v-show="remaining_time">({{ `${$t("messages.remainingTime")} : ${remaining_time}` }})
            <van-loading type="spinner" />
          </span>
          {{ $store.getters.getDevice.utg_volume }}&nbsp;{{ $IEDATA.capacity }}
          <!--({{ wind.form.data.volume }}{{ $IEDATA.capacity }})-->
        </h4>
        <h4 class="font-16 m-1">
          <div class="progress progress-mini">
            <div class="progress-bar progress-bar-info" :style="`width: ${completion}%`"></div>
          </div>
        </h4>
        <div style="color: orange">
          <div>{{ $t("messages.encapsulationText1") }}</div>
          <div>{{ $t("messages.encapsulationText2") }}</div>
        </div>
      </div>

      <div style="
          line-height: 60px;
          text-align: center;
          display: inline-block;
          width: 100%;
          max-width: 300px;
        ">
        <el-button type="text" style="position: absolute; left: 0px; bottom: 10px" icon="el-icon-back"
          @click="$emit('jumpUpload')" v-if="showBack">{{ $t("comm.back") }}</el-button>
        <el-button v-if="!progressShow" v-show="showBtn" v-loading="loading" :disabled="loading" type="primary"
          @click="onBtn">
          {{ $t(getStatuBtnText) }}
        </el-button>
        <div></div>
        <el-button @click="onUnPackge" type="text" v-if="state == 3 || state == 2 || state == 8">
          <span class="van-button__text">{{ $t("pledge.unpacking") }}</span>
        </el-button>
      </div>
    </div>

    <van-dialog :title="$t('pledge.encapsulation')" v-model="wind.show" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-confirm-button="false" :show-cancel-button="false"
      confirm-button-color="rgb(51, 143, 248)" cancel-button-color="red" :close-on-click-overlay="false"
      :lock-scroll="false" :close-on-popstate="true">
      <div style="padding-left: 20px; padding-right: 20px" class="win_context">
        <el-form v-if="wind.show" :model="wind.form.data" status-icon :rules="wind.form.rules" ref="wind_Form"
          :label-width="$i18n.locale == 'en' ? '120pt' : '75pt'" label-position="left" size="mini">
          <el-form-item :label="$t('pledge.spaceenCapsulated')">
            <span :style="`color:${maxVolume > 0 ? '' : 'red'}`">
              {{ maxVolume }}{{ $IEDATA.capacity }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('newManage.originalSpace')" v-if="ancestorNode">
            {{ getStorage(ancestorNode.declareSpace) }}{{ $IEDATA.capacity }}
          </el-form-item>

          <el-form-item :label="$t('home.encapsulatedSpace')" style="margin-bottom: 0px" size="mini">
          </el-form-item>
          <el-form-item prop="volume" label-width="0px">
            <el-slider :disabled="maxVolume <= 0" v-model.number="wind.form.data.volume" :step="5"
              :min="maxVolume ? 5 : 0" :tooltip="false" :max="Number(maxVolume)" />

            <f-number :disabled="maxVolume <= 0" v-model="wind.form.data.volume" :step="5" reValType="number"
              :min="maxVolume ? 5 : 0" :max="maxVolume" :units="$IEDATA.capacity" />
            <div style="color: #888">
              {{ $t("messages.pleaseEncapsulation1") }}
            </div>
            <div style="color: #888">
              {{ $t("messages.pleaseEncapsulation2", [SEAL_MIN, SEAL_MAX]) }}
            </div>
          </el-form-item>
          <!--  <el-form-item
            prop="price"
            :label="$t('pledge.Estimatedfee')"
            v-loading="wind.priceLoading"
            size="mini"
          >
            {{ wind.form.data.price }}{{ $IEDATA.suffix }}
          </el-form-item>-->
          <el-form-item :label="$t('pledge.storageFactor')" size="mini">
            {{ storageVal }}
          </el-form-item>
        </el-form>
      </div>
      <div class="van-hairline--top van-dialog__footer" v-loading="wind.loading">
        <button @click="wind.show = false" class="van-button van-button--default van-button--large van-dialog__cancel"
          style="color: red">
          <div class="van-button__content">
            <span class="van-button__text">{{ $t("messages.cancel") }}</span>
          </div>
        </button>

        <button @click="onEncapsulation"
          class="van-button van-button--default van-button--large van-dialog__confirm van-hairline--left"
          style="color: rgb(51, 143, 248)">
          <div class="van-button__content">
            <span class="van-button__text">{{ $t("messages.confirm") }}</span>
          </div>
        </button>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import utils from "@/utils/utils";
import webSdk from "@/utils/webSdk";
import FNumber from "@/components/modules/fNumber.vue";
import { createWebsocket } from "@/utils/websocket.js";
import { Dialog, Notify } from "vant";
import { Decimal } from "decimal.js";
export default {
  components: { FNumber },
  props: {
    address: {
      type: String,
      default: "",
    },
    isPledge: {
      type: Boolean,
      default: false,
    },
    ancestorNode: {
      type: Object,
      default() {
        return null;
      },
    },
    showBack: {
      type: Boolean,
      default: false,
    },
    autoJump: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const _this_ = this;
    const SEAL_MIN = window.$config.SEAL_MIN;
    const SEAL_MAX = window.$config.SEAL_MAX;
    const SEAL_RESERVE = window.$config.SEAL_RESERVE;
    const msgL = `${SEAL_MIN}~${SEAL_MAX}`;

    return {
      SEAL_MIN,
      SEAL_MAX,
      SEAL_RESERVE,
      loading: false,
      socket: null,
      socketRe: null,
      setTime: null,
      wind: {
        show: false,
        loading: false,
        priceLoading: false,
        form: {
          data: {
            price: "0",
            volume: 0,
            roothash: "",
          },
          rules: {
            volume: [
              {
                required: true,
                message: _this_.$t("messages.required"),
                trigger: "blur",
              },

              {
                validator: (rule, value, callback) => {
                  if (_this_.ancestorNode) {
                    let ancestorSpace = _this_.getStorage(
                      _this_.ancestorNode.declareSpace
                    );
                    if (value != ancestorSpace) {
                      return callback(
                        new Error(
                          `${_this_.$t(
                            "newManage.transferSeal"
                          )}${ancestorSpace}${_this_.$IEDATA.capacity}`
                        )
                      );
                    }
                  }

                  if (value < SEAL_MIN) {
                    callback(
                      new Error(
                        `${_this_.$t("messages.availableRange", [msgL])}`
                      )
                    );
                    return;
                  }
                  if (value > SEAL_MAX) {
                    callback(
                      new Error(
                        `${_this_.$t("messages.availableRange", [msgL])}`
                      )
                    );
                    return;
                  }
                  if (value % 5) {
                    callback(
                      new Error(
                        `${_this_.$t("messages.pleaseEncapsulation1", [msgL])}`
                      )
                    );
                    return;
                  }

                  callback();
                },
                trigger: "blur",
              },
            ],
            /* price: [
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
        },
        configList: [],
      },
      //utg_status
      stateType: {
        1: {
          color: "#333",
          title: "messages.notEncapsulated",
          btn: "pledge.startEncapsulation",
          click: "encapsulation",
        },
        2: {
          color: "#0071cd",
          title: "messages.encapsulating",
          btn: "pledge.viewProgress",
        },
        3: {
          color: "#01b100",
          title: "messages.packageComplete",
          btn: "pledge.next",
          // click: "encapsulation",
          click: "next",
        },
        7: {
          color: "orange",
          title: "pledge.unpackingCapacity",
        },
        8: {
          color: "orange",
          title: "comm.withdrawalPledge",
          //   btn: "pledge.next",
          // click: "next",
        },
      },
    };
  },
  created() {
    //this.getVolume();
    this.getConfigList();
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
    if (this.setTime) {
      clearTimeout(this.setTime);
      this.setTime = null;
    }
  },
  methods: {
    onUnPackge() {
      Dialog.confirm({
        title: ``,
        message: `${this.$t("pledge.unpacking")}?`,
        cancelButtonText: `${this.$t("table.cancel")}`,
        confirmButtonText: `${this.$t("table.confirm")}`,
      })
        .then(() => {
          this.reEncapsulation();
        })
        .catch(() => {
          // on cancel
        });
    },
    getVolume(timeout = 800) {
      this.wind.form.data.price = "0";
      this.wind.priceLoading = true;
      this.wind.loading = true;
      if (this.setTime) {
        clearTimeout(this.setTime);
        this.setTime = null;
      }

      this.setTime = setTimeout(() => {
        let volume = utils.storage(this.wind.form.data.volume, "g-m");
        this.$api.pledge
          .getVolume({ bandWidth: volume })
          .then((response) => {
            this.wind.priceLoading = false;
            this.wind.loading = false;
            try {
              let price = utils.weedZero(response.result.utg, 4);

              this.wind.form.data.price = price;
            } catch (error) { }
          })
          .catch(() => {
            // this.wind.priceLoading = false;
            //this.wind.loading = false;
          });
      }, timeout);
    },
    hashToNX(val) {
      return webSdk.sdkUtils.hashToNX(val);
    },
    addrFormat(val, num = 11) {
      if (!val) {
        return val;
      }
      val = this.hashToNX(val);
      return utils.getAddrFormat(val, num);
    },
    volumeFormat(val) {
      return `${val} ${this.$IEDATA.capacity}`;
    },
    beforeClose(type, onfun) {
      if (type == "cancel") {
        this.wind.show = false;
      } else {
        this.onEncapsulation(onfun);
      }
      //  onfun(false);
      return false;
    },
    onEncapsulation() {
      this.$refs["wind_Form"].validate((valid) => {
        if (valid) {
          this.toEncapsulation(() => {
            this.wind.show = false;
            this.loading = true;
            setTimeout(() => {
              this.$emit("upSend");
              this.loading = false;
            }, 5000);
          });
          // this.wind.show = false;

          // this.progressShow = true;
          //  this.state++;
        }
      });
    },
    toEncapsulation(fun) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;

      this.wind.loading = true;
      let _this_ = this;
      let autofun = {
        onopen: () => {
          //let addr = webSdk.sdkUtils.getSelectAddress();
          let volume = utils.storage(this.wind.form.data.volume, "g-g");
          //  _this_.$api.rpc.nonce(addr).then((utg_nonce) => {
          _this_.$api.rpc
            .blockNumber()
            .then((utg_block) => {
              let block = utg_block;
              if (typeof block == "string" && block.includes("0x")) {
                block = parseInt(block);
                block = `0x${(block > 50 ? block - 50 : block).toString(16)}`;
              } else {
                block = block > 50 ? block - 50 : block;
              }
              utg_block = block;
              _this_.$api.rpc
                .blockHash(utg_block)
                .then((hashJson) => {
                  let utg_nonce = hashJson.nonce;

                  let utg_block_hash = hashJson.hash;
                  utg_nonce = utg_nonce;
                  utg_block = utg_block;

                  let message = {
                    volume,
                    utg_nonce,
                    utg_block,
                    utg_block_hash,
                  };

                  this.socket.sendWSPush(message, 3, true);
                })
                .catch((err) => {
                  Notify({ type: "danger", message: err.message || "" });
                  this.wind.loading = false;
                });
            })
            .catch((err) => {
              Notify({ type: "danger", message: err.message || "" });
              this.wind.loading = false;
            });
        },
        onmessage: (data) => {
          if (data.cmd == 3) {
            this.wind.loading = false;
            fun && fun();
          }
        },
        onRepeat: (data) => {
          if (data.cmd == 3) {
            this.wind.loading = false;
            fun && fun();
          }
        },
        onerror: (e) => {
          this.wind.loading = false;
        },
      };
      if (this.socket) {
        this.socket.init();
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },
    onBtn() {
      if (this.stateTypeClick) {
        switch (this.stateTypeClick) {
          case "encapsulation":
            this.onOpenWin();
            break;

          case "next":
            this.next();
            break;
        }
      }
      /*if (this.state == 1) {
        this.wind.show = true;
      } else if (this.state < 3) {
       // this.state++;
      } else {
        this.submitForm();
      }*/
    },
    onOpenWin() {
      //  this.wind.form.data.volume = Number(this.devVolume);
      let defaultVal = Number(this.getDefaultVal());
      defaultVal = defaultVal - (defaultVal % 5);
      this.wind.form.data.volume = defaultVal;
      this.wind.show = true;
      this.wind.loading = false;
    },
    getDefaultVal() {
      let surplus = new Decimal(this.devVolume || 0); // Number(this.devVolume);
      let lVal = surplus.mul(0.1); //surplus * 0.1;
      let rVal = surplus.mul(0.9); //surplus * 0.9;
      let subVal = surplus.sub(this.SEAL_RESERVE); //surplus - this.SEAL_RESERVE;
      subVal = subVal.lt(0) ? new Decimal(0) : subVal; //subVal < 0 ? 0 : subVal;
      let re = parseInt(
        lVal.gt(this.SEAL_RESERVE) ? rVal.toFixed(0) : subVal.toFixed(0)
      );
      return re;
      /*let lVal = surplus * 0.1;
      let rVal = surplus * 0.9;
      let subVal = surplus - this.SEAL_RESERVE;
      subVal = subVal < 0 ? 0 : subVal;
      return lVal > this.SEAL_RESERVE ? rVal : subVal;*/
    },
    next() {
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
      this.$emit(
        "encapsulation",
        Object.assign(
          { address: this.$store.getters.deviceAddr },
          this.wind.form.data
        )
      );
    },
    getConfigList() {
      this.$api.consoleApi
        .ConfigList("s")
        .then((re) => {
          this.wind.configList = re.result || [];
          //this.storages
        })
        .catch((err) => {
          console.error(err);
        });
    },

    reEncapsulation() {
      let autofun = {
        onopen: () => {
          this.socketRe.sendWSPush({}, 8, true);
        },
        onmessage: (data) => {
          if (data.cmd == 8) {
            this.$emit("upSend");
            this.$notify({
              message: this.$t("messages.resetSpaced"),
              type: "success",
            });
            this.socketRe.closeSocket();
          }
        },
        onRepeat: (data) => {
          if (data.cmd == 8) {
            this.$emit("upSend");
            this.$notify({
              message: this.$t("messages.resetSpaced"),
              type: "success",
            });
            this.socketRe.closeSocket();
          }
        },
        onerror: (e) => { },
      };
      if (this.socketRe) {
        this.socketRe.init();
      } else {
        this.socketRe = createWebsocket("devicectl", autofun);
      }
    },
    getStorage(val = 0) {
      return utils.storage(val);
    },
    jumpNext() {
      this.isPledge && this.autoJump && this.next();
    }
  },
  computed: {
    getStatuLabel() {
      return this.stateTypeItem.title;
    },
    getStatuColor() {
      return this.stateTypeItem.color || "red";
    },
    getStatuBtnText() {
      return this.stateTypeItem.btn || "messages.notAvailable";
    },
    stateTypeClick() {
      return this.stateTypeItem.click;
    },
    devVolume() {
      let volume = this.$store.getters.getDevice.volume || 0;

      if (volume > 5) {
        return utils.storage(volume - 5, "g-g");
      } else {
        return 0;
      }
    },
    maxVolume() {
      let surplus = new Decimal(this.devVolume || 0);
      let lVal = surplus.mul(0.05); //surplus * 0.05;
      let rVal = surplus.mul(0.95); //surplus * 0.95;
      let subVal = surplus.sub(this.SEAL_RESERVE); //surplus - this.SEAL_RESERVE;
      subVal = subVal.lt(0) ? new Decimal(0) : subVal; //subVal < 0 ? 0 : subVal;
      return lVal.gt(this.SEAL_RESERVE) ? rVal.toFixed(0) : subVal.toFixed(0); //lVal > this.SEAL_RESERVE ? rVal : subVal;
    },
    stateTypeItem() {
      return this.stateType[this.state] || {};
    },
    progressShow() {
      return this.state == 2;
    },
    showBtn() {
      return this.stateTypeItem.btn && this.state != 7;
    },
    upkeyd() {
      let utg_prikey_exsit = this.$store.getters.getDevice.utg_prikey_exsit;
      console.log("----", utils.isEmpty(utg_prikey_exsit));
      return utils.isEmpty(utg_prikey_exsit) ? true : !!utg_prikey_exsit;
    },
    completion() {
      let rate = this.$store.getters.getDevice.rate || {};
      return rate.completion || 0;
    },
    remaining_time() {
      let rate = this.$store.getters.getDevice.rate || {};
      let remaining_time = rate.remaining_time || 0;
      let str = "";
      if (remaining_time >= 3600) {
        let hour = Math.floor(remaining_time / 3600);
        str += `${hour}${this.$t("comm.hour")} `;
        remaining_time = remaining_time % 3600;
      }
      if (remaining_time >= 60) {
        let minute = Math.floor(remaining_time / 60);
        str += `${minute}${this.$t("comm.minute")} `;
        remaining_time = remaining_time % 60;
      }
      if (remaining_time) {
        str += `${remaining_time}${this.$t("comm.second")} `;
      }
      return str;
    },
    state() {
      return this.$store.getters.getDevice.utg_status || 0;
    },
    storageVal() {
      let volume = this.wind.form.data.volume;
      if (!volume) {
        return 0;
      }
      return utils.calStorageNewRatio(volume);
      /*let listL = this.wind.configList || [];
      let item = listL.find((item) => {
        if (volume > item.min && (!item.max || volume <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;*/
    },

  },

  watch: {
    /* "wind.form.data.volume": function () {
      this.getVolume();
    },*/
    isPledge: {
      immediate: true,
      handler() {
        this.jumpNext();
      },
    },
    autoJump() {
      this.jumpNext();
    }
  },
};
</script>
<style >
.el-button--primary {
  background-color: #23cbe0;
  border: 1px solid #23cbe0;
}

.win_context .el-form-item__content {
  text-align: right;
}

.win_context .el-form-item {
  border-bottom: 1px solid #eee;
}
</style>
<style  scoped>
.context {
  margin: 0px auto;

  width: 80%;
  border-bottom: 1px solid #f1f1f1;
}

.state-div {
  line-height: 60px;
  font-size: 16pt;
  text-align: center;
}
</style>