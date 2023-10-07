<template>
  <div>
    <div class="row" style="margin: 0px; padding: 0px">
      <div
        class="col-12"
        style="padding: 0px; margin: 0px auto; max-width: 500px"
        v-loading="!$store.getters.deviceOk"
      >

        <el-form
          style="clear: both"
          :model="form.data"
          status-icon
          :rules="form.rules"
          ref="ruleForm"
          label-width="0px"
        >
          <slot></slot>
          <el-form-item
            v-if="$store.getters.deviceAddr"
            style="margin-bottom: 0px"
            :label="$t('pledge.deviceAddressNow')"
            :label-width="$i18n.locale == 'en' ? '100pt' : '75pt'"
          >
            <el-popover
              placement="bottom"
              trigger="hover"
              :content="$store.getters.deviceAddr"
            >
              <div
                :style="{ color: upkeyd ? '' : 'orange' }"
                slot="reference"
                v-loading="!$store.getters.deviceOk"
              >
                <div class="overflow_l">
                  {{ addrSplit($store.getters.deviceAddr) }}
                </div>
                <div class="overflow_r">
                  {{ addrSplit($store.getters.deviceAddr, false) }}
                </div>
              </div>
            </el-popover>
          </el-form-item>
          <div class="" style="padding: 10px 10px">
            <h4 style="float: left; font-size: 1.3rem">
              {{ $t(upTitle) }}
            </h4>

            <el-button
              v-show="form.data.upType === 0"
              style="float: right"
              @click.stop="createWallet"
              type="text"
              >{{ $t("messages.createAccount") }}</el-button
            >
            <div style="clear: both"></div>
          </div>

          <van-tabs
            v-model="form.data.upType"
            type="card"
            sticky
            color="#23cbe0"
          >
            <van-tab :title="$t('messages.importPrivateKey')">
              <el-form-item
                prop="privateKey"
                class="privateKey_item"
                style="margin-top: 10px"
              >
                <el-input
                  show-word-limit
                  type="textarea"
                  v-model.trim="form.data.privateKey"
                  :placeholder="$t('messages.importPrivateKey')"
                  autocomplete="true"
                  :autosize="{ minRows: 6, maxRows: 15 }"
                ></el-input>
              </el-form-item>
              <li style="color: green">
                {{ $t("messages.importPrivateKeyMsg") }}
              </li>
            </van-tab>
            <van-tab :title="$t('messages.upAddr')">
              <el-form-item prop="utg_addr" style="margin-top: 10px">
                <el-input
                  show-word-limit
                  type="textarea"
                  v-model.trim="form.data.utg_addr"
                  autocomplete="true"
                  :placeholder="$t('messages.upAddr')"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                ></el-input>
              </el-form-item>
              <li style="color: orange">
                {{ $t("messages.importAccountMsg") }}
              </li>
            </van-tab>
          </van-tabs>
        </el-form>
      
        <el-button
          type="text"
          style="float: right; line-height: 40px"
          @click="jump"
          v-show="upAddrd && showJump && !upkeyd"
          >{{ $t("messages.jump") }}</el-button
        >
        <div
          class="foot-btn"
          style="
            max-width: 50%;
            text-align: center;
            border: none;
            margin: 0px auto;
          "
        >
          <el-button
            type="primary"
            class="btn btn-primary btn-block waves-effect waves-light"
            @click="submitForm('ruleForm')"
            v-loading="loading"
            :disabled="loading"
          >
            {{ $t("messages.import") }}
          </el-button>
        </div>
      </div>
    </div>

    <van-dialog
      :title="$t('messages.newwallet')"
      @close="dialogVisible = false"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :confirm-button-text="$t('loadingSubPan.close')"
      :close-on-click-overlay="false"
      :lock-scroll="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div v-loading="winLoading" class="ie_window_div">
        <div class="mnemonic_title">{{ $t("messages.account") }}</div>
        <el-button
          type="text"
          v-clipboard:copy="winData.address"
          v-clipboard:success="onCopy"
          class="cursor"
          style="font-size: 11pt; font-weight: bold"
        >
          {{ getAddrFormat(winData.address) }}
        </el-button>

        <div class="mnemonic_title">{{ $t("messages.privatekey") }}</div>
        <el-button
          type="text"
          v-clipboard:copy="winData.key"
          v-clipboard:success="onCopy"
          class="cursor"
          style="font-size: 11pt; font-weight: bold"
        >
          {{ getAddrFormat(winData.key, 13) }}
        </el-button>

        <div class="mnemonic_title">{{ $t("messages.mnemonic") }}</div>

        <div
          type="text"
          v-clipboard:copy="winData.mnemonic"
          v-clipboard:success="onCopy"
          class="cursor"
          style="
            font-size: 11pt;
            font-weight: bold;
            color: #409eff;
            padding: 12px 0px;
            cursor: pointer;
          "
        >
          {{ winData.mnemonic }}
        </div>
        <div class="mnemonic_title">{{ $t("messages.bearinmind") }}</div>
        <div style="font-size: 8pt; color: red">
          <div class="bootomLine text_indent">
            1、{{ $t("messages.clickcopy") }}
          </div>
          <div class="bootomLine text_indent">
            2、{{ $t("messages.notnetwokin") }}
          </div>
          <div class="bootomLine text_indent">
            3、{{ $t("messages.notnetworkinkey") }}
          </div>
          <div class="bootomLine text_indent">
            4、{{ $t("messages.closewindowbefore") }}
          </div>
        </div>
        <div style="text-align: center">
          <van-button
            style="min-width: 45%; mring-right: 5px; color: red"
            plain
            @click="dialogVisible = false"
            >{{ $t("table.cancel") }}</van-button
          >
          <van-button type="info" style="min-width: 45%" @click="onBackup">{{
            $t("comm.mnemonicBackup")
          }}</van-button>
        </div>
      </div>
    </van-dialog>
    <van-dialog
      :title="$t('comm.mnemonicBackup')"
      @close="backupWin = false"
      v-model="backupWin"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :close-on-click-overlay="false"
      :lock-scroll="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div class="ie_window_div">
        <div class="backup_text_div">{{ backupData.mnemonic_s.join(" ") }}</div>

        <div class="backup_btns_div">
          <van-button
            v-for="(key, cd) in backupData.mnemonic_b"
            :type="backupData.mnemonic_s.includes(key) ? 'info' : 'default'"
            :key="cd"
            @click="selectMnemonic(key)"
            >{{ key }}</van-button
          >
        </div>
        <div
          v-if="backupData.mnemonic_o.length == backupData.mnemonic_s.length"
          :style="{
            'font-size': '12px',
            'text-align': 'center',
            padding: '5px',
            color: backupOk ? 'green' : 'red',
          }"
        >
          {{ $t(backupOk ? "comm.matchSucceeded" : "comm.mnemonicFailed") }}
        </div>
        <el-button
          style="min-width: 25%; mring-right: 5px"
          type="text"
          icon="el-icon-back"
          size="mini"
          @click="
            backupWin = false;
            dialogVisible = true;
          "
          >{{ $t("comm.back") }}</el-button
        >
        <div style="text-align: center; margin-top: 20px">
          <van-button
            v-if="backupOk"
            type="info"
            style="min-width: 100%"
            @click="inputPrivateKey"
            >{{ $t("loadingSubPan.close") }}</van-button
          >
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import { ethers } from "ethers";
import utils from "@/utils/utils";
import webSdk from "@/utils/webSdk";
import { Notify } from "vant";
import { createWebsocket } from "@/utils/websocket.js";
import CryptoJS from "@/utils/CryptoJS.js";
import localstorage from "@/utils/localstorage.js";
import { Dialog } from "vant";
import { Notification } from "element-ui";
export default {
  props: {
    showJump: {
      type: Boolean,
      default: true,
    },
    autoNext: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    let _this_ = this;
    return {
      isTest: false,
      socket: null,
      loading: false,
      dialogVisible: false,
      winLoading: false,
      winData: { key: "", mnemonic: "", address: "" },
      backupWin: false,
      backupData: { mnemonic_o: [], mnemonic_b: [], mnemonic_s: [] },
      form: {
        data: {
          upType: 0,
          utg_addr: "",
          privateKey: "",
        },
        rules: {
          privateKey: [
            {
              validator: (rule, value, callback) => {
                if (_this_.form.data.upType === 1) {
                  callback();
                  return;
                }

                let wallet = "";
                try {
                  wallet = new ethers.Wallet(value);
                  //val=  webSdk.sdkUtils.hashToNX(value)
                } catch (error) {}
                if (wallet) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.notkey")));
                }
              },
              trigger: "blur",
            },
          ],
          utg_addr: [
            {
              validator: (rule, value, callback) => {
                if (_this_.form.data.upType === 0) {
                  callback();
                  return;
                }

                let addr = "";
                try {
                  let addrL = webSdk.sdkUtils.hashToNX(value, true);
                  addr = new ethers.utils.getAddress(addrL);
                  //val=  webSdk.sdkUtils.hashToNX(value)
                } catch (error) {
                  callback(new Error(_this_.$t("messages.pleaseaddress")));
                }
                if (addr) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.pleaseaddress")));
                }
              },
              trigger: "blur",
            },
          ],
        },
      },
    };
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
  },
  methods: {
    selectMnemonic(key) {
      let cd = this.backupData.mnemonic_s.indexOf(key);
      if (cd >= 0) {
        this.backupData.mnemonic_s.splice(cd, 1);
      } else {
        this.backupData.mnemonic_s.push(key);
      }
    },
    onBackup() {
      this.dialogVisible = false;
      let mnemonic_o = this.winData.mnemonic.split(" ");
      let mnemonic_b = this.winData.mnemonic.split(" ");
      utils.randomArr(mnemonic_b);
      this.backupData = { mnemonic_o, mnemonic_b, mnemonic_s: [] };
      this.backupWin = true;
    },
    inputPrivateKey() {
      this.form.data.privateKey = this.winData.key;
      this.backupWin = false;
      Notification.success(this.$t("comm.newprivatefilled"));
    },
    jump() {
      this.$emit("upload", { address: this.$store.getters.deviceAddr }, true);
    },
    createWallet() {
      this.dialogVisible = true;
      this.winLoading = true;
      this.openWin();
    },

    openWin() {
      let randomWallet = ethers.Wallet.createRandom();
      let mnemonic = randomWallet.mnemonic.phrase;

      let privateKey = webSdk.sdkUtils.hashToNX(randomWallet.privateKey, true);

      this.winData = {
        key: privateKey,
        mnemonic: mnemonic,
        address: webSdk.sdkUtils.hashToNX(randomWallet.address),
      };
      this.winLoading = false;
      this.$refs["ruleForm"].validate();
    },
    inspectAddr(device_addr, fun) {
      let timeOk = true;

      let toast = this.$toast.loading({
        message: "Loading...",
        forbidClick: true,
        duration: 60000,
        onClose: () => {
          timeOk = false;
        },
      });
      this.$api.consoleApi
        .getStorageSpaceList({ device_addr })
        .then((re) => {
          if (!timeOk) return;
          toast.close();
          let reList = re.result.records || [];
          if (reList.length > 0) {
            alert("The address is already in use here");
          } else {
            fun && fun();
          }
        })
        .catch(() => {
          if (!timeOk) return;
          toast.close();
        });
    },

    submitForm() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let wallet = null;
          let orAddr = this.$store.getters.deviceAddr;
          let toFun = null;
          let upAddr = "";
          let warningMsg = "";
          if (this.form.data.upType === 0) {
            wallet = new ethers.Wallet(this.form.data.privateKey);
            upAddr = wallet.address;
            warningMsg = "messages.upPrivateKey";
            toFun = this.toUpPK;
          } else {
            upAddr = this.form.data.utg_addr;
            warningMsg = "messages.upPrivateKey";
            toFun = this.toUpAddr;
          }

          if (this.$store.getters.deviceAddr) {
            try {
              upAddr = webSdk.sdkUtils.hashToNX(upAddr, true);
              orAddr = webSdk.sdkUtils.hashToNX(orAddr, true);
            } catch (error) {}
            if (upAddr != orAddr) {
              let utg_status = this.$store.getters.getDevice.utg_status;

              if (utg_status == 2 || utg_status == 3 || utg_status == 8) {
                this.$dialog
                  .alert({
                    message: `${this.$t("messages.addrNotMeg")}`, //messages.pleaseminer
                    theme: "round-button",
                    confirmButtonText: this.$t("table.confirm"),
                  })
                  .then(() => {
                    this.$emit(
                      "upload",
                      { address: this.$store.getters.deviceAddr },
                      false
                    );
                  });
                return;
              }

              Dialog.confirm({
                title: this.$t("comm.warning"),
                className: "warningText",
                message: this.$t(warningMsg),
                cancelButtonText: `${this.$t("table.cancel")}`,
                confirmButtonText: `${this.$t("messages.import")}`,
              })
                .then(() => {
                  toFun(wallet, true);
                })
                .catch(() => {
                  // on cancel
                });
              return;
            }
          }

          toFun(wallet, false);
        }
      });
    },
    toUpPK(wallet) {
      let ticket = localstorage.getTicket(this).ticket;
      let privateKey = this.form.data.privateKey;
      let md5T = CryptoJS.md5(ticket);
      md5T = CryptoJS.hexToString(md5T);
      let enc_utg_prikey = CryptoJS.toHexString(CryptoJS.rc4(privateKey, md5T));
      let utg_prikey_md5 = CryptoJS.md5(privateKey);
      let dataJson = { enc_utg_prikey, utg_prikey_md5 };
      this.toUpload(dataJson, () => {
        this.$emit("upload", wallet, true);
      });
    },
    toUpAddr(wallet, isNew = true) {
      let utg_addr = webSdk.sdkUtils.hashToNX(this.form.data.utg_addr, true);
      utg_addr = utg_addr.toLocaleLowerCase();
      let dataJson = { utg_addr };
      if (isNew) {
        dataJson.enc_utg_prikey = "";
        dataJson.utg_prikey_md5 = "";
      }
      this.toUpload(dataJson, () => {
        this.$emit("upload", { address: utg_addr }, true);
      });
    },
    toUpload(dataJson, fun) {
      this.loading = true;

      let autofun = {
        onopen: () => {
          this.socket.sendWSPush(dataJson, 2, true, 1);
        },
        onmessage: (data) => {
          if (data.cmd == 2) {
            this.loading = false;
            fun();
          }
        },
        onerror: (e) => {
          this.loading = true;
        },
      };
      if (this.socket) {
        this.socket.init();
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },
    getAddrFormat(val, num = 10) {
      return utils.getAddrFormat(val, num);
    },
    onCopy() {
      Notify({ type: "success", message: this.$t("utilsmsg.copyok") });
    },
    addrSplit(val, left = true) {
      return utils.addrSplit(val, left);
    },
  },
  computed: {
    upkeyd() {
      let utg_prikey_exsit = this.$store.getters.getDevice.utg_prikey_exsit;
      return utils.isEmpty(utg_prikey_exsit) ? true : !!utg_prikey_exsit;
    },

    upAddrd() {
      return !!this.$store.getters.deviceAddr;
    },

    upTitle() {
      return this.form.data.upType === 0
        ? "messages.accountKey"
        : "messages.importAccount";
    },
    backupOk() {
      let oStr = this.backupData.mnemonic_o.join();
      let sStr = this.backupData.mnemonic_s.join();
      return sStr == oStr;
    },
  },
  watch: {
    "$store.getters.deviceAddr": {
      immediate: true,
      handler: function (address) {
        if (this.autoNext && address && this.upkeyd) {
          this.$emit("upload", { address }, false);
        }
      },
    },
  },
};
</script>
<style scoped>
.ie_window_div {
  padding: 10pt;
  word-wrap: break-word;
  text-align: left;
}

.text_indent {
  text-indent: -2em;
  margin-left: 2em;
}
.backup_btns_div {
  background-color: #eee;
  text-align: center;
  margin-top: 5px;
}
.backup_text_div {
  background-color: #fff;
  min-height: 60px;
  border: 1px solid #aaa;
  padding: 10px;
  font-weight: 500;
}
.backup_btns_div .van-button {
  margin: 3px;
  width: 88px;
}
</style>
<style >
.warningText {
  color: orange;
}
</style>