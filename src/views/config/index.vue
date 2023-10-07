<template>
  <div class="container-fluid">
    <div class="top_context">
      <div class="card" style="">
        <div class="card-body">
          <div class="ie_rows_div">
            <el-form
              status-icon
              ref="ruleForm"
              label-width="0px"
              label-position="left"
              style="width: 100%"
            >
              <!-- <el-form-item :label="$t('pledge.storageAccount')" size="mini">
                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="$store.getters.deviceAddr"
                >
                  <div slot="reference" class="overflow" style="width: 100%">
                    {{ getAddrFormat($store.getters.deviceAddr) }}
                  </div>
                </el-popover>
              </el-form-item>-->
              <!--  <el-form-item size="mini" v-if="!!baseData.name">
                <div class="el-form-item__label">
                  {{ $t("settings.configurationsaved") }}
                </div>
                {{ baseData.name }}
              </el-form-item>-->

              <el-form-item size="mini">
                <div class="el-form-item__label">
                  {{ $t("settings.chainId") }}
                </div>
                {{ chainIdName(baseData.chain_id) }}
              </el-form-item>
              <!--       <el-form-item size="mini">
                <div class="el-form-item__label">
                  {{ $t("settings.leasepayback") }}
                </div>
                {{ baseData.utg_retrieve_block_number }}
              </el-form-item>
              <el-form-item size="mini">
                <div class="el-form-item__label">
                  {{ $t("settings.dayblocks") }}
                </div>
                {{ baseData.utg_one_day_block_number }}
              </el-form-item>
              <el-form-item size="mini">
                <div class="el-form-item__label">
                  {{ $t("settings.pledgequery") }}
                </div>
                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="baseData.utg_enquire_pledge_url"
                >
                  <div
                    slot="reference"
                    class="overflow"
                    style="max-width: 100%"
                  >
                    {{ baseData.utg_enquire_pledge_url }}
                  </div>
                </el-popover>
              </el-form-item>-->
              <div class="pc_show">
                <el-form-item>
                  <div style="clear: both; margin-top: 20px">
                    <div style="float: left">
                      {{ $t("settings.rpcUrl") }}
                    </div>
                    <div style="float: right">
                      <el-button
                        type="default"
                        size="mini"
                        icon="el-icon-plus"
                        style="margin-top: 10px"
                        @click="addRPC"
                        >{{ $t("settings.node") }}</el-button
                      >

                      <el-button
                        type="default"
                        size="mini"
                        style="margin-top: 10px"
                        @click="inspectAll()"
                      >
                        <img :src="nodetestPng" width="10px" height="10px" />
                        {{ $t("settings.test") }}</el-button
                      >
                    </div>
                  </div>
                </el-form-item>
                <el-form-item
                  size="mini"
                  v-for="(rpc, cd) in utg_chain_urls || []"
                  :key="cd"
                >
                  <div>
                    <div
                      class="overflow rpc_url"
                      :style="{
                        'max-width': '100%',
                        'vertical-align': 'top',
                        color: rpcIsBase(rpc) ? '#888' : '#333',
                      }"
                    >
                      {{ `${rpc}` }}

                      <i
                        v-show="inspectRPC(rpc)"
                        :style="{ color: inspectRe(rpc) ? '#67c23a' : 'red' }"
                        :class="
                          inspectRe(rpc) ? 'el-icon-success' : 'el-icon-remove'
                        "
                        :title="
                          inspectRe(rpc)
                            ? $t('settings.rpcavailable')
                            : $t('settings.invalidRPC')
                        "
                      ></i>
                    </div>

                    <div class="rpc_btns">
                      <el-button-group>
                        <el-button
                          type="danger"
                          v-if="!rpcIsBase(rpc)"
                          icon="el-icon-delete"
                          @click="removeRPC(cd)"
                        ></el-button>
                        <!--  <el-button
                          type="default"
                          :title="$t('settings.test')"
                          @click="inspectAll(rpc)"
                          ><img :src="nodetestPng" width="10px" height="10px"
                        /></el-button>-->

                        <el-button
                          v-if="cd > 0"
                          type="default"
                          @click="swapArray(cd)"
                          icon="el-icon-caret-top"
                        ></el-button>
                        <el-button
                          v-if="utg_chain_urls.length > cd + 1"
                          type="default"
                          icon="el-icon-caret-bottom"
                          @click="swapArray(cd, false)"
                        ></el-button>
                      </el-button-group>
                    </div>
                  </div>
                </el-form-item>
              </div>
              <div class="app_show">
                <div style="margin-top: 20px">
                  <h6 style="float: left">
                    {{ $t("settings.rpcUrl") }}
                  </h6>
                  <div style="float: right">
                    <el-button
                      type="default"
                      size="mini"
                      icon="el-icon-plus"
                      style="margin-top: 5px"
                      @click="addRPC"
                      >{{ $t("settings.node") }}</el-button
                    >
                    <el-button
                      type="default"
                      size="mini"
                      style="margin-top: 5px"
                      @click="inspectAll()"
                    >
                      <img :src="nodetestPng" width="10px" height="10px" />
                      {{ $t("settings.test") }}</el-button
                    >
                  </div>
                </div>
                <div style="clear: both"></div>

                <van-cell-group>
                  <van-cell
                    v-for="(rpc, cd) in utg_chain_urls || []"
                    :key="cd"
                    is-link
                  >
                    <van-popover
                      v-model="clicks[cd]"
                      trigger="click"
                      slot="right-icon"
                      :offset="[0, -50]"
                      placement="right-start"
                    >
                      <van-icon name="arrow" slot="reference" />
                      <div style="width: 100px">
                        <!--  <van-button
                          type="default"
                          @click="inspect(rpc)"
                          class="app_popver_btns"
                          ><img :src="nodetestPng" />{{
                            $t("settings.test")
                          }}</van-button
                        >-->
                        <van-button
                          type="default"
                          class="app_popver_btns"
                          v-if="cd > 0"
                          @click="swapArray(cd)"
                          ><i class="el-icon-caret-top"></i
                          >{{ $t("settings.moveup") }}</van-button
                        >
                        <van-button
                          type="default"
                          class="app_popver_btns"
                          v-if="utg_chain_urls.length > cd + 1"
                          @click="swapArray(cd, false)"
                          ><i class="el-icon-caret-bottom" />{{
                            $t("settings.moveupdown")
                          }}</van-button
                        >
                        <van-button
                          type="danger"
                          v-if="!rpcIsBase(rpc)"
                          icon="delete-o"
                          class="app_popver_btns"
                          @click="removeRPC(cd)"
                          >{{ $t("settings.remove") }}</van-button
                        >
                      </div>
                    </van-popover>
                    <div
                      slot="title"
                      style="width: 100%"
                      :style="{ color: rpcIsBase(rpc) ? '#888' : '#333' }"
                    >
                      {{ rpc }}
                      <i
                        v-show="inspectRPC(rpc)"
                        :style="{ color: inspectRe(rpc) ? '#67c23a' : 'red' }"
                        :class="
                          inspectRe(rpc) ? 'el-icon-success' : 'el-icon-remove'
                        "
                        :title="
                          inspectRe(rpc)
                            ? $t('settings.rpcavailable')
                            : $t('settings.invalidRPC')
                        "
                      ></i>
                    </div>
                  </van-cell>
                </van-cell-group>
              </div>
              <div style="clear: both"></div>
              <div style="clear: both; margin-top: 10px">
                <el-button
                  type="default"
                  size="mini"
                  icon="el-icon-refresh"
                  @click="allret"
                  >{{ $t("settings.reset") }}</el-button
                >
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <van-dialog
      v-model="dialog.show"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
      confirm-button-color="rgb(51, 143, 248)"
      cancel-button-color="red"
      :close-on-click-overlay="true"
      :lock-scroll="false"
    >
      <van-button
        size="mini"
        round
        class="dialog_close_btn"
        @click="dialog.show = false"
        ><van-icon name="cross"
      /></van-button>
      <div style="text-align: center">
        <h6>{{ $t(dialog.title) }}</h6>
      </div>
      <el-form
        :model="dialog.data"
        :rules="dialog.rules"
        ref="win_ruleForm"
        label-width="0px"
        class="demo-ruleForm"
      >
        <el-form-item prop="rpc">
          <el-input
            v-model="dialog.data.rpc"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <div style="text-align: center">
            <el-button style="width: calc(50% - 25px)" @click="dialogInspect"
              ><img :src="nodetestPng" width="12px" height="12px" />{{
                $t("settings.test")
              }}</el-button
            >
            <el-button type="primary" style="width: 50%" @click="subDialog">{{
              $t("table.confirm")
            }}</el-button>
          </div>
        </el-form-item>
      </el-form>
    </van-dialog>
  </div>
</template>
        
  <script>
import nodetestPng from "@/assets/images/nodetest.png";
import nodetestNotPng from "@/assets/images/nodetestNot.png";
import nodetestOkPng from "@/assets/images/nodetestOk.png";
import utils from "@/utils/utils";
import { createWebsocket } from "@/utils/websocket.js";
import { Toast, Dialog } from "vant";
export default {
  data() {
    let baseConfig = window.$config.BASE_CONFIG();
    let _this_ = this;
    return {
      nodetestPng,
      nodetestNotPng,
      nodetestOkPng,
      loading: false,
      baseConfig,
      baseData: {},
      utg_chain_urls: [],
      inspectMap: {},
      dialog: {
        show: false,
        title: "",
        editCd: null,
        data: { rpc: "" },
        rules: {
          rpc: [
            {
              validator: (rule, value, callback) => {
                if (utils.isEmpty(value)) {
                  callback(new Error(_this_.$t("settings.pleaseUrl")));
                  return;
                }
                value = value.trim();

                if (
                  /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(
                    value
                  )
                ) {
                  if (_this_.rpcIsBase(value) && _this_.rpcIslist(value)) {
                    callback(new Error(_this_.$t("settings.urlalready")));
                  } else {
                    callback();
                  }
                } else {
                  callback(new Error(_this_.$t("settings.pleaseUrl")));
                }
              },
              trigger: "change",
            },
          ],
        },
      },
      clicks: {},
    };
  },
  mounted() {
    this.loadinConfig();
  },
  methods: {
    getNewWork(chain_id) {
      let re = `${chain_id}`;
      if (chain_id == 118) {
        re = this.$t("settings.testNetwork");
      }

      if (chain_id == 188) {
        re = this.$t("settings.mainNetwork");
      }
      return re;
    },
    allret() {
      let message = this.$t("settings.configreset");
      let msgColor = "";
      let configId = this.baseConfig.chain_id;
      let baseId = this.baseData.chain_id;
      if (configId != baseId) {
        let baseIdName = this.getNewWork(baseId);
        let configIdName =this.getNewWork(configId);// this.getNewWork(configId);
        message = this.$t("messages.chainnotTwo", [
          baseIdName,
          configIdName,
          configIdName,
        ]);
        msgColor = "orange";
      }
      Dialog.confirm({
        title: `${this.$t("settings.reset")} `,
        message: `<span style="color:${msgColor}">${message}</span>`,
      })
        .then(() => {
          let message = { utg_config: this.baseConfig };
          this.setConfig(message, true);
        })
        .catch(() => {
          // on cancel
        });
    },
    loadinConfig() {
      let cmd = 1;
      this.loading = true;
      this.webSocketTo({}, cmd, (re) => {
        if (re.isok) {
          this.loading = false;
          let data = re.data || {};
          let utg_config = data.utg_config || {};
          if (utils.isEmpty(utg_config.chain_id)) {
            let message = { utg_config: this.baseConfig };
            this.setConfig(message, false);
          } else {
            this.configDatas(utg_config);
          }
        }
      });
    },
    configDatas(utg_config = {}) {
      this.baseData = utg_config;
      let utg_chain_urls = utg_config.utg_chain_urls || [];
      let clicks = {};
      utg_chain_urls.forEach((rpc, cd) => {
        clicks[cd] = false;
      });
      this.clicks = clicks;
      this.utg_chain_urls = utg_chain_urls;
    },
    setConfig(message = {}, showMsg = true) {
      let cmd = 2;
      this.loading = true;

      this.webSocketTo(message, cmd, (re) => {
        if (re.isok) {
          showMsg && Toast.success(this.$t("settings.configurationsaved"));
          this.loadinConfig();
        }
      });
    },
    inspectAll(rpc) {
      rpc = rpc || this.utg_chain_urls;
      this.inspect(rpc, (re) => {
        let isok = re.isok;
        let data = re.data || {};
        let utg_chain_urls = data.utg_chain_urls || [];
        if (isok) {
          let inspectMap = {};
          utg_chain_urls.forEach((item) => {
            inspectMap[item.rpc_url] = item.check_result;
          });
          this.inspectMap = inspectMap;
        } else {
          this.inspectMap = {};
        }
      });
    },
    inspect(rpc, fun) {
      let cmd = 13;
      let message = { utg_chain_urls: Array.isArray(rpc) ? rpc : [rpc] };
      let toast = Toast.loading({
        message: this.$t("settings.checkingRPC"),
        forbidClick: true,
        duration: 100000,
      });
      this.webSocketTo(message, cmd, (re) => {
        toast.close();
        if (fun) {
          fun(re);
          return;
        }

        if (re.isok) {
          let data = re.data || {};
          let utg_chain_urls = data.utg_chain_urls || [];
          let item = utg_chain_urls.length > 0 ? utg_chain_urls[0] : {};
          let check_result = item.check_result;
          if (check_result) {
            Toast.success(this.$t("settings.rpcavailable"));
          } else {
            Dialog.alert({
              title: this.$t("settings.invalidRPC"),
              message: `${rpc}`,
              theme: "round-button",
              confirmButtonText: this.$t("table.confirm"),
            }).then(() => {
              // on close
            });
          }
        }
      });
    },
    inspectRPC(rpc) {
      let re = this.inspectMap[rpc];
      if (utils.isEmpty(re)) {
        return false;
      }
      return true;
    },
    inspectRe(rpc) {
      let re = this.inspectMap[rpc];
      return !!re;
    },
    dialogInspect() {
      this.$refs.win_ruleForm.validate((valid) => {
        if (valid) {
          this.inspect(this.dialog.data.rpc);
        }
      });
    },
    addRPC() {
      this.dialog.title = "settings.rpcadd";
      this.dialog.editCd = null;
      this.dialog.data = { rpc: "" };
      this.dialog.show = true;
    },
    upRPC(rpc, cd) {
      this.dialog.title = "settings.rpcedit";
      this.dialog.editCd = cd;
      this.dialog.data = { rpc };
      this.dialog.show = true;
    },
    swapArray(cd, top = true) {
      let arr = [...this.utg_chain_urls];
      if (!top) {
        if (arr.length > cd + 1) {
          cd = cd + 1;
        } else {
          return;
        }
      }

      let cde = cd - 1;
      cde = cde >= 0 ? cde : 0;
      [arr[cde], arr[cd]] = [arr[cd], arr[cde]];

      this.utg_chain_urls = arr;
      this.baseData.utg_chain_urls = arr;
      let setData = { utg_config: { utg_chain_urls: arr } };
      this.setConfig(setData, true);
    },
    subDialog() {
      this.$refs.win_ruleForm.validate((valid) => {
        if (valid) {
          let newRpc = this.dialog.data.rpc.trim();
          let utg_chain_urls = this.utg_chain_urls;
          if (this.dialog.editCd === null) {
            utg_chain_urls.unshift(newRpc);
            this.inspectMap = {};
          } else {
            utg_chain_urls.splice(this.dialog.editCd, 1, newRpc);
          }
          this.dialog.show = false;
          this.baseData.utg_chain_urls = utg_chain_urls;
          let setData = { utg_config: { utg_chain_urls } };
          this.setConfig(setData);
        }
      });
    },
    removeRPC(cd) {
      let rpc = this.utg_chain_urls[cd];
      Dialog.confirm({
        title: `${this.$t("settings.remove")} ?`,
        message: `${rpc}`,
      })
        .then(() => {
          this.utg_chain_urls.splice(cd, 1);
          let setData = { utg_config: { utg_chain_urls: this.utg_chain_urls } };
          this.setConfig(setData);
        })
        .catch(() => {
          // on cancel
        });
    },
    webSocketTo(message, cmd, fun) {
      let autofun = {
        onopen: () => {
          this.socket.sendWSPush(message, cmd, true);
        },
        onmessage: (data) => {
          if (data.cmd == cmd) {
            fun && fun({ isok: true, data: data });
          }
        },
        /* onRepeat: (data) => {
          if (data.cmd == cmd) {
            fun && fun();
          }
        },*/
        onerror: (e) => {
          fun && fun({ isok: false });
        },
      };
      if (this.socket) {
        this.socket.init(undefined, autofun);
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },

    rpcIsBase(rpc) {
      return this.baseConfig.utg_chain_urls.includes(rpc);
    },
    rpcIslist(rpc) {
      return this.utg_chain_urls.includes(rpc);
    },
    chainIdName(id) {
      if (id == 188) {
        return `${this.$t("settings.mainNetwork")}`;
      } else if (id == 118) {
        return `${this.$t("settings.testNetwork")}`;
      } else {
        return id;
      }
    },
  },
};
</script>
<style scoped>
@media (min-width: 600px) {
  .rpc_url {
    float: left;
  }
  .rpc_btns {
    float: right;
  }
  .pc_show {
    display: unset;
  }
  .app_show {
    display: none;
  }
}

@media (max-width: 600px) {
  .rpc_url {
    float: left;
  }
  .rpc_btns {
    float: right;
  }
  .app_show {
    display: unset;
  }
  .pc_show {
    display: none;
  }
}
@media (max-width: 600px) {
  .rpc_url {
    width: 100%;
    text-align: center;
  }
  .rpc_btns {
    width: 100%;
    text-align: center;
  }
}
.demo-ruleForm {
  margin: 10px;
}
.dialog_close_btn {
  position: absolute;
  right: 5px;
  top: 5px;
}
</style>
  <style >
.el-button--primary {
  background-color: #23cbe0;
  border: 1px solid #23cbe0;
}
.ie_rows_div {
  margin: 0px auto;
  max-width: 500px;
}
.ie_rows_div .el-form-item__content {
  text-align: right;
  font-weight: 600;
}

.ie_rows_div .el-form-item {
  border-bottom: 1px solid #eee;
}
.app_popver_btns {
  width: 100%;
}
</style>