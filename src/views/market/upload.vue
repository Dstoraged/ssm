<template>
  <div>
    <div class="container-fluid">
      <div class="card">
        <div class="card-body" style="text-align: center">
          <el-form
            style="margin: 0px auto; max-width: 600px"
            :model="ruleForm"
            status-icon
            :rules="rules"
            ref="ruleForm"
            label-width="0px"
            class="demo-ruleForm"
            v-loading="revenue_loading || loading"
          >
            <el-form-item label="HASH" label-width="80px">
              <el-popover
                placement="bottom"
                trigger="hover"
                :content="rent_hash"
              >
                <div class="overflow" slot="reference" style="text-algin: left">
                  {{ rent_hash }}
                </div>
              </el-popover>
            </el-form-item>
            <el-form-item
              prop="img"
              :class="ruleForm.img.length > 0 ? 'hide_img' : ''"
            >
              <van-uploader
                accept="image/*"
                ref="vanUploader"
                v-model="ruleForm.img"
                :multiple="false"
                :max-size="maxSize"
                preview-size="150"
                :upload-text="$t('market.clickUpload')"
                :preview-image="true"
                :preview-full-image="false"
                @click-preview="chooseFile"
                @oversize="oversize"
                :max-count="2"
              >
                <template slot="preview-cover">
                  <div class="preview-cover van-ellipsis"></div>
                </template>
              </van-uploader>
            </el-form-item>

            <el-form-item prop="url">
              <el-input
                :placeholder="$t('market.linkAddress')"
                v-model="ruleForm.url"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitForm('ruleForm')"
                v-loading="butLoading"
                :disabled="butLoading"
                >{{ $t("rPassword.confirmModification") }}</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import utils from "@/utils/utils";
import webSdk from "@/utils/webSdk.js";
import { Dialog } from "vant";
export default {
  data() {
    return {
      loading: false,
      revenue_loading: "",
      butLoading: false,
      rent_hash: "",
      revenue_address: "",
      upMaxSize: window.$config.upMaxSize || 1,
      ruleForm: {
        img: [
          /*  {
            file: {},
            status: "",
            message: "",
            content: "",
          },*/
        ],
        url: "",
      },
      rules: {},
    };
  },
  created() {
    this.rent_hash = this.$route.params.id || "";
    this.loadRevenue();
    this.showPopover();
  },
  methods: {
    getAddrFormat(val, num = 8) {
      return utils.getAddrFormat(val, num);
    },
    oversize() {
      this.$toast.fail(`${this.$t("market.imagecannot", [this.upMaxSize])}`);
    },
    chooseFile() {
      this.$refs.vanUploader.chooseFile();
    },
    showPopover() {
      this.loading = true;
      if (utils.isEmpty(this.rent_hash)) {
        return;
      }
      this.$api.consoleApi
        .getRentInfo({ rent_hash: this.rent_hash })
        .then((re) => {
          this.loading = false;
          let result = re.result || {};
          this.rent_hash = result.rentHash || "";
          let img = result.attachPic || "";
          let url = result.attachText || "";
          let imgs = [];
          if (img) {
            imgs.push({
              file: {},
              status: "",
              message: "",
              content: img,
            });
          }
          this.ruleForm.img = imgs;
          this.ruleForm.url = url;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },

    loadRevenue() {
      this.revenue_loading = true;
      let addr = this.$store.getters.deviceAddr;
      if (!addr) {
        return;
      }

      addr = webSdk.sdkUtils.hashToNX(addr);
      this.$api.consoleApi
        .getMiner(addr)
        .then((re) => {
          re = re.result || {};
          this.revenue_address = re.revenue_address;
          this.revenue_loading = false;
        })
        .catch(() => {
          this.revenue_address = "";
        });
    },

    getFrom() {
      if (utils.isEmpty(this.revenue_address)) {
        Dialog.alert({
          message: `${this.$t("messages.pleaserevenueaccount")} : ${
            this.revenue_address
          }`,
          theme: "round-button",
          confirmButtonText: this.$t("table.confirm"),
        }).then(() => {});
        return false;
      }

      let address = webSdk.sdkUtils.getSelectAddress();
      if (utils.isEmpty(address)) {
        return false;
      }
      let revenue_address = this.revenue_address;
      let deviceAddr = this.$store.getters.deviceAddr;
      try {
        revenue_address = webSdk.sdkUtils.hashToNX(revenue_address, true);
        address = webSdk.sdkUtils.hashToNX(address, true);

        deviceAddr = webSdk.sdkUtils.hashToNX(deviceAddr, true);
      } catch (error) {}
      if (revenue_address != address && deviceAddr != address) {
        Dialog.alert({
          message: `${this.$t("messages.pleaseDevOrRevenue")}`, //: ${this.revenue_address }`,
          theme: "round-button",
          confirmButtonText: this.$t("table.confirm"),
        }).then(() => {});
        return false;
      }

   //   address = webSdk.sdkUtils.hashToNX(this.revenue_address, false, true);
      return address;
    },
    submitForm() {
      utils.mobileVersion(true, 23).then((isOk) => {
        if (!isOk) return;

        let sdk = utils.getSdk(this);
        if (!sdk) return;
        let address = this.getFrom();
        if (!address) return;

        let img =
          this.ruleForm.img.length > 0
            ? this.ruleForm.img[0].content || ""
            : "";
        let url = this.ruleForm.url || "";
        img = img.trim();
        url = url.trim();
        // let imgEmpty = utils.isEmpty(img);
        //  let urlEmpty = utils.isEmpty(url);
        let item = {
          rent_hash: this.rent_hash,
          pic: img,
          text: url,
          address,
          sign: "",
        };
        this.baseSigin(item, sdk);
      });
    },
    baseSigin(item, sdk) {
      let str = `${item.rent_hash}&${item.text}&${item.pic}`;

      this.loading = true;
      let setData = {
        title: `${this.$t("market.requestSignature")}`,
        status: 3,
        //  context: ``,
        request: sdk.personalSign(str, item.address),
        closebtnshow: false,
        success: (re) => {
          item.sign = re.sign;
          this.loading = false;
          this.$store.dispatch("setWinStatus", false);
          this.subAjax(item);
        },
        err: (err) => {
          console.log("err", err);
          this.loading = false;
        },
      };
      this.$store.dispatch("setNotification", setData);
    },
    subAjax(item) {
      console.log(JSON.stringify(item));
      this.butLoading = true;
      this.$api.consoleApi
        .updateStorageRentAttach(item)
        .then((re) => {
          this.butLoading = false;
          if (re.statusCode === 0) {
            this.$notify.success(this.$t("market.savingSucceeded"));
            this.$router.push("/market");
          } else {
            this.butLoading = false;
            this.$notify.error({
              message: re.result || "ERROR",
            });
          }
        })
        .catch((err) => {
          this.butLoading = false;
          this.$notify.error({
            message: err || "ERROR",
          });
        });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
  computed: {
    maxSize() {
      return parseInt(this.upMaxSize) * 1024;
    },
  },
  watch: {
    "ruleForm.img": function(newVals) {
      if (newVals.length > 0) {
        let fileItem = newVals[newVals.length - 1];
        if (
          fileItem &&
          fileItem.file &&
          fileItem.file.type &&
          !fileItem.file.type.includes("image")
        ) {
          newVals.splice(newVals.length - 1, 1);
        }
      }

      if (newVals.length > 1) {
        newVals.splice(0, newVals.length - 1);
      }
    },
    "$store.getters.deviceAddr": function() {
      this.loadRevenue();
    },
  },
};
</script>
<style>
.hide_img .van-uploader__upload {
  display: none;
}
</style>
