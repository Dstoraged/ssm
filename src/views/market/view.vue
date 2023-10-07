<template>
  <div>
    <div
      class="container-fluid"
      v-loading="loading || rent_poc_loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)"
    >
      <div class="card" style="">
        <div class="card-body">
          <div>
            <div>
              <div class="model-content">
                <div class="main">
                  <div class="row" style="margin: 0px; padding: 0px">
                    <div class="col-md-12">
                      <div
                        class="row ie_pledge_div"
                        style="
                          margin: 0px auto;
                          padding: 0px;
                          max-width: 400px;
                          width: 100%;
                        "
                      >
                        <examine
                          ref="examine"
                          :pledge-amount="pledgeAmount"
                          :un-loading="unLoading"
                          :datas="pledgeData"
                          :is-encapsulationd="isEncapsulationd"
                          @onUnPackge="onUnPackge"
                          @recovery="recovery"
                          :is-rent="isRent"
                          :application="application"
                        />
                        <div
                          v-if="actionItems.length > 0"
                          style="text-align: center; width: 100%"
                        >
                          <template v-if="isIncomplete">
                            <span
                              style="
                                text-align: center;
                                width: 100%;
                                color: orange;
                              "
                            >
                              {{ $t("market.otheroutstanding") }}
                            </span>
                          </template>
                          <template v-else>
                            <div
                              v-for="(item, cd) in actionItems"
                              :key="cd"
                              style="margin: 5px 0px"
                            >
                              <span
                                v-if="item.type == 'error'"
                                style="color: red; font-size: 14px"
                                >{{ $t(item.text) }}</span
                              >
                              <span
                                v-else-if="item.type == 'warning'"
                                style="color: orange; font-size: 14px"
                                >{{ $t(item.text) }}</span
                              >

                              <el-button
                                v-else-if="item.type == 'btn'"
                                :type="item.btnType"
                                :icon="item.icon"
                                @click="actionBtn(item.action)"
                                :disabled="
                                  btnLoading ||
                                    unLoading ||
                                    (item.action == 'pledgeStart' &&
                                      (!stateTypeItem.showBtn ||
                                        pledgeData.webBtnDis))
                                "
                                v-loading="btnLoading || unLoading"
                                style="min-width: 45%"
                              >
                                {{ $t(item.label) }}
                              </el-button>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <renewal
      v-if="rentHash"
      :datas="pledgeData"
      :exch-rate="ExchRate"
      :hash="rentHash"
      :pledge-addr="pledgeAddr"
      :is-rent="isRent"
      :overtime="overtime"
      @pledgeStart="pledgeStart"
      :is-incomplete="isIncomplete"
    />
  </div>
</template>
<script>
import examine from "./examine";
import utils from "@/utils/utils";
import webSdk from "@/utils/webSdk";
import { createWebsocket } from "@/utils/websocket.js";
import Renewal from "@/views/market/Renewal.vue";
import { Decimal } from "decimal.js";
import { Dialog } from "vant";
import { Notification as Message } from "element-ui";
//import { ethers } from "ethers";
export default {
  components: { examine, Renewal },
  data() {
    return {
      reid: "",
      hash: "",
      loading: false,
      rent_poc_loading: false,
      socket: null,
      socket_Poc: null,
      socket_space: null,
      btnLoading: false,
      unLoading: false,
      loadTime: null,
      ExchRate: 0,
      storageSpaceInfo: {},
      pledgeData: {},
      stateType: {
        1: { title: "comm.WaitingEncapsulation", color: "red" },
        2: { title: "comm.capacityEncapsulation", color: "red" },
        3: { title: "comm.capacityCompleted", color: "red" },
        4: { title: "comm.capacityEncapsulation", color: "red" },
        5: { title: "comm.normalService", color: "#0071cd", showBtn: true },
        6: { title: "comm.reclaimingCapacity", color: "red" },
        7: { title: "comm.unpacking", color: "red" },
      },
      acBalance: "0.0",
      block_day: window.$config.BLOCK_DAY,
      lease_reservation: window.$config.LEASE_RESERVATION,
      nowBlock: 0,

      actionTypes: {
        //0 NOT  1 NO unPledge 2 unPledge
        0: {
          0: [
            {
              type: "btn",
              btnType: "primary",
              icon: "",
              label: "pledge.pledge",
              action: "pledgeStart",
            },
          ],
          1: [{ type: "error", text: "market.errorSealed" }],
          4: [{ type: "error", text: "market.errorSealed" }],
        },
        1: {
          0: [
            {
              type: "btn",
              btnType: "primary",
              icon: "",
              label: "pledge.pledge",
              action: "pledgeStart",
            },
          ],
        },
        2: {
          0: [
            {
              type: "btn",
              label: "pledge.pledge",
              action: "pledgeStart",
              btnType: "primary",
              icon: "",
              show: () => {},
            },
            {
              type: "btn",
              label: "market.revoke",
              action: "revoke",
              btnType: "danger",
              icon: "el-icon-thumb",
            },
          ],
          1: [
            {
              type: "warning",
              text: "market.pleasepatiently",
            },
          ],
          4: [{ type: "error", text: "market.errorSealed" }],
          6: [
            {
              type: "btn",
              label: "market.revoke",
              action: "revoke",
              btnType: "danger",
              icon: "el-icon-thumb",
            },
          ],
          "-1": [
            {
              type: "btn",
              label: "market.revoke",
              action: "revoke",
              btnType: "danger",
              icon: "el-icon-thumb",
            },
          ],
          7: [
            {
              type: "btn",
              label: "market.revoke",
              action: "revoke",
              btnType: "danger",
              icon: "el-icon-thumb",
            },
          ],
        },
      },
    };
  },

  beforeDestroy() {
    this.loadTime && clearInterval(this.loadTime);

    this.socket && this.socket.closeSocket();
    this.socket_Poc && this.socket_Poc.closeSocket();
    this.socket_space && this.socket_space.closeSocket();
  },

  mounted() {
    let idL = this.$route.params.id || "";
    let ids = idL.split("_");
    this.reid = ids.length > 0 ? ids[0] : "";
    this.hash = ids.length > 1 ? ids[1] : "";

    this.loadPledge();
    this.getRentInfo();
    this.getSet();
    this.getBalance();
    this.loadTime = setInterval(() => {
      this.getRentInfo();
      this.getBalance();
    }, 10000);
  },
  methods: {
    actionBtn(type) {
      switch (type) {
        case "pledgeStart":
          this.pledgeStart(false);
          break;
        case "revoke":
          if (!this.$refs.examine) {
            return;
          }
          if (this.pledgeData.rentStatus === 0) {
            this.$refs.examine.onUnPackge();
          } else {
            let msgOnw = `<span style='color:orange'>${this.$t(
              "market.requestExpired"
            )} / ${this.$t("market.leaseExpired")} </span>`;
            Dialog.confirm({
              title: `${this.$t("market.revoke")}?`,
              message: `${this.$t("market.Pleaseexceedsblocks", [
                msgOnw,
                window.$config.BLOCK_DAY,
              ])}`,
              cancelButtonText: `${this.$t("comm.close")}`,
              confirmButtonText: `${this.$t("table.confirm")}`,
            })
              .then(() => {
                this.$refs.examine.onUnPackge();
              })
              .catch(() => {
                // on cancel
              });
          }

          break;
      }
    },
    btnDisabled(item) {
      return;
    },

    getSet() {
      this.$api.pledge
        .getSet()
        .then((re) => {
          let result = re.result || {};
          this.ExchRate = result.ExchRate || 0;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    recovery() {
      // alert("");
    },
    onUnPackge(block) {
      this.toUnPackge(block, (toast) => {
        setTimeout(() => {
          Message({
            message: this.$t("market.revocationOk"),
            type: "success",
          });
          this.$emit("upSend");
          this.unLoading = false;
          this.$router.push("/market");
          toast && toast.clear();
        }, 4000);
      });
    },

    toUnPackge(block, fun) {
      this.unLoading = true;
      let toast = this.$toast.loading({
        message: `${this.$t("market.recycling")}`,
        forbidClick: true,
        duration: 60000,
        onClose: () => {
          this.unLoading = false;
        },
      });
      let sdk = utils.getSdk(this);
      if (!sdk) {
        this.unLoading = false;
        return;
      }

      let autofun = {
        onopen: () => {
          let voucher = this.rentHash;
          let message = {
            voucher,
            utg_block: `${block}`,
          };

          this.socket.sendWSPush(message, 7, true);
        },
        onmessage: (data) => {
          if (data.cmd == 7) {
            fun && fun(toast);
          }
        },
        onRepeat: (data) => {
          if (data.cmd == 7) {
            fun && fun(toast);
          }
        },
        onerror: (e) => {
          this.unLoading = false;
          toast && toast.clear();
        },
      };
      if (this.socket) {
        this.socket.init(undefined, autofun);
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },
    pledgeStart(isReNew = false, pledgeAmount = this.pledgeAmount) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;

      if (!isReNew && !this.avSpace) {
        Dialog.alert({
          message: `${this.$t("market.spaceInsufficient")} < ${this.$t(
            "market.rentedSpace"
          )}`,
          theme: "round-button",
          confirmButtonText: this.$t("table.confirm"),
        }).then(() => {});

        return;
      }

      this.getBalance();
      let loadingJson = {
        timeOk: true,
        toast: this.$toast.loading({
          message: `${
            isReNew ? "Loading" : this.$t("market.pretreatmentProgress")
          }...`,
          forbidClick: true,
          duration: 50000,
          onClose: () => {
            loadingJson.timeOk = false;
          },
        }),
      };
      let apiType = isReNew ? 6 : 5;
      this.getPoc(
        async (data) => {
          if (!data) return;
          this.$emit("upSend");

          let verOk = await utils.mobileVersion(false);
          data.pledgeAmount = pledgeAmount;
          data.isReNew = isReNew;
          let title = isReNew ? "comm.renewalPledge" : "comm.leasePledge";
          let type = isReNew ? "strentnewpg" : "strentpg";
          if (verOk && this.balanceLack(pledgeAmount)) {
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
                this.onPledge(title, type, data);
              })
              .catch(() => {
                // on cancel
              });
          } else {
            this.onPledge(title, type, data);
          }
        },
        false,
        loadingJson,
        apiType
      );
    },
    getPoc(fun, errorIgnore = false, loadingJson = {}, apiType = 5) {
      let toast = loadingJson.toast || {
        clear: function() {
          loadingJson.timeOk = false;
        },
      };
      let sdk = utils.getSdk(this);
      if (!sdk) return toast.clear();

      let _this_ = this;
      let utg_nonce = "";
      let utg_block = "";
      let utg_block_hash = "";
      let volume = this.pledgeData.rentSpace;
      let voucher = this.rentHash;
      //--DOTO
      let rentAddr = this.pledgeData.rentAddr;
      let rentTime = this.pledgeData.rentTime;
      let send = function() {
        _this_.socket_Poc.sendWSPush(
          {
            voucher,
            utg_nonce,
            utg_block,
            utg_block_hash,
            volume,
            rentAddr,
            rentTime,
          },
          apiType,
          true
        );
      };

      let autofun = {
        onopen: () => {
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
              toast.clear();
              Message.error(`ERROR 101`);
              fun();
            });
        },
        errorStart: (e) => {
          //DOTO--
          if (errorIgnore && (e.result == 24 || e.result === 1)) {
            toast.clear();
            fun();
            return true;
          }
        },
        onmessage: (data) => {
          if (data.cmd == apiType) {
            toast.clear();
            fun(data);
          }
        },
        onerror: () => {
          toast.clear();
          Message.error(`ERROR 102`);
          fun();
        },
        onRepeat: (data) => {
          if (data.cmd == apiType) {
            setTimeout(() => {
              if (loadingJson.timeOk) {
                send();
              } else {
                this.socket_Poc.linkOk && this.socket_Poc.closeSocket();
                fun();
              }
            }, 4000);
          }
        },
      };
      if (this.socket_Poc) {
        this.socket_Poc.init(undefined, autofun);
      } else {
        this.socket_Poc = createWebsocket("devicectl", autofun);
      }
    },
    onPledge(title, apiType, data) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;

      let setData = {
        title: `${this.$t(title)}`,
        context: `${this.$t("pledge.pledgeAmount")}:${data.pledgeAmount || ""}`,
        request: null,
        closebtnshow: false,
        closeWin: (type) => {
          if (type == 2) {
            this.$router.push("/market");
          } /* else if (!data.isReNew) {
           // this.onUnPackge();
          }*/
        },
      };
      let device_address = this.$store.getters.deviceAddr;
      let rent_hash = this.rentHash;
      let capacity = this.pledgeData.rentSpace;
      let verification = data.utg_rent_poc;
      let surplus_capacity = this.storageSpaceInfo.freeSpace - capacity;
      surplus_capacity = surplus_capacity > 0 ? surplus_capacity : 0;
      let surplus_verification = data.utg_package_poc;

      let reJson = {
        device_address,
        rent_hash,
        capacity,
        verification,
        surplus_capacity,
        surplus_verification,
      };
      let proves =
        surplus_capacity > 0
          ? [
              "rent_hash",
              "capacity",
              "verification",
              "surplus_capacity",
              "surplus_verification",
            ]
          : ["rent_hash", "capacity", "verification", "surplus_capacity"];

      if (!utils.jsonProve(reJson, proves)) {
        return;
      }
      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson[apiType],
        reJson,
        setData
      );
      this.$store.dispatch("setNotification", setData);
    },
    loadPledge(addr) {
      addr = addr || this.$store.getters.deviceAddr;
      this.loading = true;

      if (!addr) return;

      this.$api.home
        .getStorageSpaceInfo(addr)
        .then((re) => {
          this.loading = false;
          let reData = re.result || {};
          reData.freeSpace = utils.storage(reData.freeSpace || 0);
          this.storageSpaceInfo = reData;
        })
        .catch((err) => {
          Message.error(`ERROR 103`);
          console.log("error", err);
        });
    },

    async getRentInfo() {
      let hash = this.hash;
      if (!hash) return;

      this.$api.consoleApi
        .getRentInfo({ rent_hash: hash })
        .then((re) => {
          let reData = re.result || {};
          reData.rentSpace = utils.storage(reData.rentSpace, "b-g");
          reData.webBtnDis = false;
          this.pledgeData = reData;
          this.maxBblock_btn();
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    async maxBblock_btn() {
      this.nowBlock = await utils.getNowHeight();
      if (this.application) {
        let element = this.pledgeData || {};
        let maxBlock = parseInt(element.rentNumber || 0) + this.block_day;
        element.webBtnDis = parseInt(this.nowBlock || 0) > maxBlock;
      }
    },
    getBalance() {
      let sdk = utils.getSdk(this, false);

      if (sdk) {
        sdk
          .getBalance()
          .then((response) => {
            this.acBalance = response;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    balanceLack(pledgeAmountNumber) {
      if (typeof pledgeAmountNumber === "string") {
        pledgeAmountNumber = pledgeAmountNumber
          .replace(`${this.$IEDATA.suffix}`, "")
          .trim();
      }

      let price = new Decimal(pledgeAmountNumber || 0);
      let acBalance = new Decimal(this.acBalance || 0);
      return price.gt(acBalance);
    },
  },
  computed: {
    actionItems() {
      let rentHash = this.rentHash || "";
      if (!rentHash) return [];
      //DOTO--
      let consoleStatus = this.pledgeData.rentStatus; 
      if (utils.isEmpty(consoleStatus)) {
        return [];
      }
      let voucherItem = this.$store.getters.voucherMap[this.rentHash];
      //DOTO--
      let isSeal = !!voucherItem; 
      let isPledge = false; 
      //DOTO--
      let isUnPackge = false; 

      //DOTO-- 2022/10/31
      if (voucherItem) {
        isPledge = !!voucherItem.utg_rent_onpledge;
        isUnPackge = !!voucherItem.utg_need_retrieve_by_manual;
      }

      if (consoleStatus == 6 || consoleStatus == 7) {
        isUnPackge = true;
      }

      let devStatus = isSeal ? (isUnPackge ? 2 : 1) : 0;
      let item_one = this.actionTypes[devStatus] || {};
      return item_one[consoleStatus] || [];
    },
    getStatuLabel() {
      if (!this.application) {
        return "";
      }
      return this.stateTypeItem.title || this.$t("messages.nowEncapsulation");
    },
    getStatuColor() {
      return this.stateTypeItem.color || "red";
    },
    getStatuBtnText() {
      //DOTO
      if (this.application) {
        return "pledge.pledge";
      }

      return this.$t("messages.notAvailable");
    },
    stateTypeClick() {
      //DOTO
      if (this.application) {
        return "pledgeStart";
      }
      return null;
    },
    showBtn() {
      // if (this.isIncomplete) return false;//&& this.application;
      return this.stateTypeItem.showBtn;
    },
    application() {
      return this.pledgeData.rentStatus === 0;
    },
    isRent() {
      return (
        this.pledgeData.rentStatus === 1 || this.pledgeData.rentStatus === 4
      );
    },
    overtime() {
      let rentTime = this.pledgeData.rentTime || 0;
      let rentNumber = this.pledgeData.rentNumber || 0;
      let maxBlock = parseInt(rentNumber) + rentTime * this.block_day;
      return parseInt(this.nowBlock || 0) > maxBlock;
    },
    stateTypeItem() {
      return this.stateType[this.state] || {};
    },
    state() {
      //DOTO--
      return this.$store.getters.getDevice.utg_status || 0;
    },
    avSpace() {
      let freeSpace =
        parseInt(this.storageSpaceInfo.freeSpace || 0) -
        (this.lease_reservation || 0);
      console.log("----------", freeSpace);
      return freeSpace >= parseInt(this.pledgeData.rentSpace);
    },
    voucherMap() {
      if (!this.rentHash || !this.$store.getters.voucherMap) {
        return null;
      }
      return this.$store.getters.voucherMap[this.rentHash];
    },
    isEncapsulationd() {
      return !!this.voucherMap;
    },
    isIncomplete() {
      if (!this.rentHash) return false;
      let incompletes = this.$store.getters.incompletes || [];
      return incompletes.length > 0 && !incompletes.includes(this.rentHash);
    },
    includePledge() {
      if (!this.rentHash) return false;
      let inPledgeMaps = this.$store.getters.inPledgeMaps || {};
      return inPledgeMaps[this.rentHash];
    },

    rentHash() {
      return this.pledgeData.rentHash;
    },

    pledgeAmount() {
      let datas = this.pledgeData || {};
      let exchRate = new Decimal(this.ExchRate || 0);
      let rentPrice = new Decimal(
        utils.clearZero(datas.rentPrice || 0, 18) || 0
      );
      let rentTime = new Decimal(datas.rentTime || 0);
      let rentSpace = new Decimal(datas.rentSpace || 0);
      if (
        exchRate.isZero() ||
        rentPrice.isZero() ||
        rentTime.isZero() ||
        rentSpace.isZero()
      ) {
        return "";
      }
      let reNumber = rentPrice
        .mul(rentSpace)
        .mul(rentTime)
        .mul(10000)
        .div(exchRate);
      return `${reNumber.toFixed(4)} ${this.$IEDATA.suffix}`;
    },
    pledgeAddr() {
      let datas = this.pledgeData || {};
      return datas.pledgeAddr || "";
    },
  },
  watch: {
    "$store.getters.deviceAddr": function(newVal) {
      this.loadPledge(newVal);
    },
    "$store.getters.account": function() {
      this.getBalance();
    },
    "$store.getters.getsdk": {
      immediate: true,
      handler: function() {
        this.getBalance();
      },
    },
  },
};
</script>
