<template>
  <div class="container-fluid" v-loading="loading || pledgeLoading">
    <div class="card" style="">
      <div class="card-body">
        <div class="ie_pledge_div">
          <div
            class="row"
            style="
              margin: 0px auto;
              padding: 0px;
              max-width: 380px;
              width: 100%;
            "
          >
            <el-form
              :label-width="'0px'"
              label-position="left"
              style="width: 100%"
              :model="form.data"
              :rules="form.rules"
              ref="ie_form"
            >
              <el-form-item size="mini">
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(`pledge.deviceAddress`) }}
                </div>
                <el-popover
                  placement="top"
                  trigger="hover"
                  :content="$store.getters.deviceAddr"
                >
                  <div
                    class="overflow"
                    style="width: 100%; text-align: left"
                    slot="reference"
                  >
                    {{ $store.getters.deviceAddr }}
                  </div>
                </el-popover>
              </el-form-item>
              <el-form-item size="mini" v-if="isUp">
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(originalLabel) }}
                </div>
                <el-popover
                  placement="top"
                  trigger="hover"
                  :content="originalAddress"
                >
                  <div
                    class="overflow"
                    style="width: 100%; text-align: left"
                    slot="reference"
                  >
                    {{ originalAddress }}
                  </div>
                </el-popover>
              </el-form-item>

              <el-form-item
                prop="new_manage_address"
                label-width="0px"
                size="mini"
              >
                <div class="el-form-item__label" style="font-weight: 700">
                  {{ $t(newLabel) }}
                </div>
                <el-input
                  show-word-limit
                  type="textarea"
                  v-model.trim="form.data.new_manage_address"
                  autocomplete="true"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                ></el-input>
              </el-form-item>

              <div class="foot-btn" style="text-align: center">
                <el-button
                  type="primary"
                  @click="submitForm"
                  :disabled="!$store.getters.deviceAddr"
                >
                  {{ $t(btnText) }}
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
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

export default {
  components: { FNumber, notPledge },

  data() {
    let _this_ = this;
    return {
      loading: false,
      pledgeLoading: false,
      pledgeData: {},
      form: {
        data: {
          new_manage_address: "",
        },
        rules: {
          new_manage_address: [
            {
              validator: (rule, value, callback) => {
                let valueL = "";
                if (utils.isEmpty(value)) {
                  callback(new Error(_this_.$t("messages.pleaseaddress")));
                  return;
                }
                try {
                  value = webSdk.sdkUtils.hashToNX(value, true);
                  valueL = ethers.utils.getAddress(value);
                } catch (error) {}
                if (valueL) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.pleaseaddress")));
                }
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
    },
    walletSelect() {
      return utils.walletSelect(this, this.pledgeData.deviceAddr,"messages.pleaseminer");
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
          let { sdk, addr } = reObj;

          let title = "newManage.setManagementAddress";
          let context = "";
          let manage_address = webSdk.sdkUtils.hashToNX(
            this.form.data.new_manage_address,
            true
          );

          let type = "editmgaddr";
          if (this.isUp) {
            //  type = "rebind";
            title = "newManage.transferManagementAddress";
            context = `${this.$t(
              "newManage.newManagement"
            )} :${this.getAddrFormat(
              webSdk.sdkUtils.hashToNX(manage_address)
            )}`;
          }
          manage_address = manage_address.toLocaleLowerCase();
          let json = {
            title,
            device_address:addr,
            manage_address,
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
          manage_addr: json.manage_address,
        },
        setData
      );
      setData.request = request;

      this.$store.dispatch("setNotification", setData);
    },
  },
  computed: {
    originalAddress() {
      return this.pledgeData.managerAddr;
    },
    btnText() {
      return this.isUp
        ? "newManage.transferManagementAddress"
        : "newManage.bindingManagementAddress";
    },
    originalLabel() {
      return this.isUp
        ? "newManage.originalAddress"
        : "newManage.bindingManagementAddress";
    },
    newLabel() {
      return this.isUp
        ? "newManage.newManagement"
        : "newManage.bindingManagementAddress";
    },
    isUp() {
      return !!this.pledgeData.managerAddr;
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