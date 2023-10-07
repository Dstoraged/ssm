<template>
  <div v-loading="loading" class="ie_pledge_div">
    <not-pledge v-if="revenue_address" title="messages.RevenueBeenBound">
      <div v-if="false">
        <el-button type="primary" @click="onOkBtn" size="mini">
          {{ $t("messages.confirm") }}
        </el-button>
      </div>
    </not-pledge>
    <div
      v-else
      class="row"
      style="margin: 0px auto; padding: 0px; max-width: 380px; width: 100%"
    >
      <el-form
        label-width="0px"
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
            <div class="overflow" style="width: 100%;text-align:left" slot="reference">
              {{ address || $store.getters.deviceAddr }}
            </div>
          </el-popover>
        </el-form-item>

        <el-form-item prop="new_revenue_address" label-width="0px" size="mini">
          <div class="el-form-item__label" style="font-weight: 700">
            {{ $t(`pledge.revenueAddressBin`) }}
          </div>
          <el-input
            show-word-limit
            type="textarea"
            v-model.trim="form.data.new_revenue_address"
            autocomplete="true"
            :autosize="{ minRows: 3, maxRows: 6 }"
          ></el-input>
        </el-form-item>

        <el-form-item size="mini" v-if="false">
          <template slot="label">
            {{ $t(`pledge.revenueAddressBin`) }}
            <el-popover
              placement="top"
              trigger="hover"
              :content="$t('messages.upwallet')"
            >
              <i class="el-icon-warning" slot="reference" style="color: orange">
              </i>
            </el-popover>
          </template>

          <el-popover
            placement="top"
            trigger="hover"
            :content="$store.getters.account"
          >
            <div class="overflow" style="width: 100%" slot="reference">
              {{ getAddrFormat($store.getters.account) }}
            </div>
          </el-popover>
        </el-form-item>
        <div class="foot-btn" style="text-align: center">
          <el-button type="primary" @click="submitForm">
            {{ $t("messages.binding") }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import FNumber from "@/components/modules/fNumber.vue";
import webSdk from "@/utils/webSdk";
import utils from "@/utils/utils";
import notPledge from "./notPledge.vue";
import { Decimal } from 'decimal.js'
import {ethers} from "ethers"
export default {
  components: { FNumber, notPledge },
  props: {
    address: {
      type: String,
      default: "",
    },
  },
  data() {
    let _this_ = this;
    return {
      loading: false,
      revenue_address: "",
      form: {
        data: {
          new_revenue_address: "",
        },
        rules: {
          new_revenue_address: [
            {
              validator: (rule, value, callback) => {
                let valueL=""
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
    this.loadRevenue();
  },
  activated() {
    this.loadRevenue();
  },

  methods: {
    getAddrFormat(val, num = 9) {
      return utils.getAddrFormat(val, num);
    },
    onOkBtn() {
      this.$emit("bindaddr", this.revenue_address);
    },
    submitForm() {
      this.$refs["ie_form"].validate((valid) => {
        if (valid) {
          let sdk = utils.getSdk(this);
          if (!sdk) return;
          let device_address = this.address || this.$store.getters.deviceAddr;
          let revenue_address = webSdk.sdkUtils.hashToNX(
            this.form.data.new_revenue_address,
            true
          );
          if (device_address && revenue_address) {

        
            revenue_address=revenue_address.toLocaleLowerCase();
            this.bind(device_address, revenue_address, () => {
              this.$emit("bindaddr", revenue_address);
            });

          }
        }
      });
    },
    bind(device_address, revenue_address, fun) {
      let sdk = this.$store.getters.getsdk;

      let contractAddr = "0x0000000000000000000000000000000000000000";
      let signaddr = "0x0000000000000000000000000000000000000000";

      let titleL = this.$t("pledge.bindaddr");

      let setData = {
        title: `${titleL}`,
        request: null,
        closebtnshow: false,
        closeWin(type) {
          if (type == 2) {
            fun();
          }
        },
      };
      let request = sdk.sendTransactionTo(
        webSdk.typeJson.bind,
        {
          device_address,
          type: 1,
          contractAddr,
          signaddr,
          revenue_address,
        },
        setData
      );
      setData.request = request;

      this.$store.dispatch("setNotification", setData);
    },
    loadRevenue() {
      this.loading = true;
      let addr = this.address || this.$store.getters.deviceAddr;
      if (!addr) {
        return;
      }

      addr = webSdk.sdkUtils.hashToNX(addr);
      this.$api.consoleApi
        .getMiner(addr)
        .then((re) => {
          re = re.result || {};
          this.loading = false;
          this.revenue_address = re.revenue_address;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
  },
  watch: {
    "$store.getters.deviceAddr": {
      immediate: true,
      handler: function (newVal) {
        this.loadRevenue(newVal);
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