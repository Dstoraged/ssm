<template>
  <div class="container-fluid" v-loading="loading || pledgeLoading">
    <div class="card" style="">
      <div class="card-body">
        <div class="ie_pledge_div">
          <div class="row" style="
              margin: 0px auto;
              padding: 0px;
              max-width: 380px;
              width: 100%;
            ">
            <el-form :label-width="'0px'" label-position="left" style="width: 100%" :model="form.data" :rules="form.rules"
              ref="ie_form">
              <el-form-item size="mini">
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(`pledge.deviceAddress`) }}
                </div>
                <el-popover placement="top" trigger="hover" :content="$store.getters.deviceAddr">
                  <div class="overflow" style="width: 100%; text-align: left" slot="reference">
                    {{ getAddrFormat($store.getters.deviceAddr, 16) }}
                  </div>
                </el-popover>
              </el-form-item>
              <el-form-item size="mini" v-if="isUp">
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(originalLabel) }}
                  &nbsp;&nbsp;<el-button type="text" style="color: red" v-if="showExitsp" @click="exitsp">{{
                    $t("home.unbind") }}</el-button>
                </div>
                <el-popover placement="top" trigger="hover" :content="originalAddress">
                  <div class="overflow" style="width: 100%; text-align: left" slot="reference">
                    {{ getAddrFormat(originalAddress, 16) }}
                  </div>
                </el-popover>
              </el-form-item>

              <el-form-item prop="new_storagePool" label-width="0px" size="mini">
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(newLabel) }}&nbsp;&nbsp;<el-button type="text" @click="selectWin.show = true">{{
                    $t("newManage.select") }}</el-button>
                </div>
                <el-popover placement="bottom" trigger="hover" :content="form.data.new_storagePool">
                  <div class="overflow" style="width: 100%; text-align: left" slot="reference">
                    {{ getAddrFormat(form.data.new_storagePool, 16) }}
                  </div>
                </el-popover>
              </el-form-item>
              <f-table-cels v-if="selectWin.selectItem" :notHeards="['hash']" :heards="selectWin.selectheard"
                :data-item="selectWin.selectItem"></f-table-cels>
              <div class="foot-btn" style="text-align: center">
                <el-button type="primary" @click="submitForm" :disabled="!$store.getters.deviceAddr">
                  {{ $t(btnText) }}
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <storage-pool-list @select="onSelect" v-model="selectWin.show" v-if="selectWin.show"></storage-pool-list>
  </div>
</template>
<script>
import FNumber from "@/components/modules/fNumber.vue";
import webSdk from "@/utils/webSdk";
import utils from "@/utils/utils";
import { ethers } from "ethers";
import notPledge from "@/views/pledge/notPledge.vue";
import { Dialog } from "vant";
import { Decimal } from "decimal.js";
import storagePoolList from "./storagePoolList.vue";
import fTableCels from "@/components/modules/fTableCels.vue";
export default {
  components: { FNumber, notPledge, storagePoolList, fTableCels },

  data() {
    let _this_ = this;
    return {
      loading: false,
      pledgeLoading: false,
      pledgeData: {},
      selectWin: {
        show: false,
        selectItem: null,
        selectheard: null,
      },
      form: {
        data: {
          new_storagePool: "",
        },
        rules: {
          new_storagePool: [
            {
              validator: (rule, value, callback) => {
                let valueL = "";
                if (utils.isEmpty(value)) {
                  callback(new Error(_this_.$t("comm.selected")));
                  return;
                }
                callback();
              },
              trigger: "change",
            },
          ],
        },
      },
    };
  },
  created() {
    this.loadPledge();
  },
  activated() {
    this.loadPledge();
  },

  methods: {
    loadPledge(addr) {
      this.loading = true;
      addr = addr || this.$store.getters.deviceAddr;
      if (!addr) {
        return;
      }

      utils.loadGlobalDatas().then(() => {
        utils.getNowHeight().then(() => {
          this.$api.home
            .getStorageSpaceInfo(addr)
            .then((re) => {
              if (re.statusCode !== 0) {
                return;
              }
              let reObj = re.result || {};

              if (reObj.pledgeStatus !== 0 && reObj.pledgeStatus !== 7) {
                Dialog.alert({
                  message: `${this.$t("messages.pleasePledgeFirst")}`,
                  theme: "round-button",
                  confirmButtonText: this.$t("table.confirm"),
                }).then(() => {
                  this.onOkBtn();
                });
                return;
              }
              this.pledgeData = reObj;
              this.loading = false;
            })
            .catch((err) => {
              console.log("error", err);
            });
        });
      });
    },
    walletSelect() {
      return utils.walletSelect(this, this.pledgeData.managerAddr);
    },
    getAddrFormat(val, num = 9) {
      return utils.getAddrFormat(val, num);
    },
    onOkBtn() {
      this.$router.push("/");
    },
    submitForm() {
      this.$refs["ie_form"].validate((valid) => {
        if (valid) {
          let reObj = this.walletSelect();
          if (!reObj) return;
          let { sdk } = reObj;

          let title = "newManage.bindStoragePool";
          let context = "";
          let device_address = this.$store.getters.deviceAddr;
          let storagePool = webSdk.sdkUtils.hashToNX(
            this.form.data.new_storagePool,
            true
          );
          let type = "setsp";
          if (this.isUp) {
            title = "newManage.transferStoragePool";
            context = `${this.$t(
              "newManage.newStoragePool"
            )} :${this.getAddrFormat(webSdk.sdkUtils.hashToNX(storagePool))}`;
          }
          storagePool = storagePool.toLocaleLowerCase();
          let json = {
            title,
            device_address,
            storagePool,
            context,
            type,
            sdk,
          };
          this.bind(json, () => {
            this.onOkBtn();
          });
        }
      });
    },
    exitsp() {
      let reObj = this.walletSelect();
      if (!reObj) return;
      let { sdk } = reObj;

      let title = "newManage.exitStoragePool";
      let context = "";

      let _this_ = this;
      let setData = {
        title: `${this.$t(title)}`,
        context: context,
        request: null,
        closebtnshow: false,
        closeWin(type) {
          if (type == 2) {
            _this_.onOkBtn();
          }
        },
      };
      let request = sdk.sendTransactionTo(
        webSdk.typeJson.exitsp,
        {
          device_address: _this_.$store.getters.deviceAddr,
        },
        setData
      );
      setData.request = request;

      this.$store.dispatch("setNotification", setData);
    },

    bind(json, fun) {
      let sdk = json.sdk;
      let titleL = this.$t(json.title);

      let setData = {
        title: `${titleL}`,
        context: json.context,
        request: null,
        closebtnshow: false,
        closeWin(type) {
          if (type == 2) {
            fun();
          }
        },
      };
      let request = sdk.sendTransactionTo(
        webSdk.typeJson[json.type],
        {
          device_address: json.device_address,
          storagePool: json.storagePool,
        },
        setData
      );
      setData.request = request;

      this.$store.dispatch("setNotification", setData);
    },
    onSelect(row, heards) {
      this.form.data.new_storagePool = row.hash;
      this.selectWin.selectheard = heards
      this.selectWin.selectItem = row;
      this.selectWin.show = false;
      setTimeout(() => {
        this.$refs["ie_form"].validate();
      }, 800);
    },
  },
  computed: {
    originalAddress() {
      return this.pledgeData.spHash;
    },
    btnText() {
      return this.isUp
        ? "newManage.transferStoragePool"
        : "newManage.bindStoragePool";
    },
    originalLabel() {
      return this.isUp
        ? "newManage.originalStoragePool"
        : "newManage.bindStoragePool";
    },
    newLabel() {
      return this.isUp
        ? "newManage.newStoragePool"
        : "newManage.bindStoragePool";
    },
    isUp() {
      return !!this.pledgeData.spHash;
    },
    showExitsp() {
      if (utils.isEmpty(this.pledgeData.spHash)) return false;

      return utils.heightDifference(this.pledgeData.spHeight, "snJoinSpday");
    },
  },
  watch: {
    "$store.getters.deviceAddr": {
      immediate: true,
      handler: function (newVal) {
        this.loadPledge();
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

.ie_pledge_div .el-form-item {
  border-bottom: 1px solid #eee;
}
</style>