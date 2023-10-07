<template>
  <div>
    <div class="header-bg">
      <!-- Navigation Bar-->
      <header id="topnav">
        <div class="topbar-main">
          <div class="container-fluid">
            <div style="float: left; padding-right: 40px">
              <a href="#" class="logo">
                <img :src="imgs.logodark" class="logo-lg" alt="" height="40" />
              </a>
            </div>
            <transition name="el-zoom-in-top">
              <div
                id="navigation"
                :style="{
                  'z-index': 2,
                  float: 'right',
                  padding: '10px',
                  display: menus.main ? 'block' : '',
                }"
              >
                <ul
                  class="navigation-menu"
                  style="width: 100%"
                  :class="[menus.main ? 'showtranform' : 'hidetranform']"
                >
                  <li class="has-submenu">
                    <a @click="handleSelect('home')">{{ $t("overview") }} </a>
                  </li>
                  <li class="has-submenu">
                    <a @click="handleSelect('pledge')"
                      >{{ $t("equipmentPledge") }}
                    </a>
                  </li>

                  <li
                    class="has-submenu"
                    v-if="MODUL_SWHITCH.show_rent && showSetting"
                  >
                    <a @click="handleSelect('market')"
                      >{{ $t("market.market") }}
                    </a>
                  </li>

                  <li class="has-submenu" v-if="showSetting">
                    <a @click="handleSelect('Settings')"
                      >{{ $t("settings.setting") }}
                    </a>
                  </li>

                  <li
                    class="has-submenu"
                    v-if="showLogs && MODUL_SWHITCH.show_logs"
                  >
                    <a @click="handleSelect('logs')">{{ $t("logs.log") }} </a>
                  </li>

                  <li class="has-submenu" style="float: right"></li>

                  <li class="has-submenu" style="padding: 0 6px">
                    <el-popover
                      v-if="$store.getters.account"
                      placement="bottom"
                      trigger="hover"
                      :content="$store.getters.account"
                    >
                      <h6
                        slot="reference"
                        v-if="$store.getters.account"
                        style="padding-left: 24px"
                      >
                        {{ addrFormat($store.getters.account) }}
                      </h6>
                    </el-popover>
                    <button
                      v-else
                      @click="initNetwork"
                      class="btn btn-primary btn-sm waves-effect waves-light"
                      style="margin-top: 5px; margin-bottom: 5px; width: 100%"
                    >
                      {{ $t("layout.connectWallet") }}
                    </button>
                  </li>
                  <li class="has-submenu" style="padding: 0 6px">
                    <button
                      @click="handleSelect('passwordReset')"
                      class="btn btn-primary btn-sm waves-effect waves-light"
                      style="margin-top: 5px; margin-bottom: 5px; width: 100%"
                    >
                      {{ $t("resetPassword") }}
                    </button>
                  </li>
                  <li class="has-submenu" style="padding: 0 6px">
                    <el-button @click="cancellation" type="text"
                      ><span style="color: orange">{{
                        $t("logout")
                      }}</span></el-button
                    >
                  </li>
                  <li class="has-submenu">
                    <ul class="navigation-menu">
                      <li
                        :class="['has-submenu', , menus.language ? 'open' : '']"
                      >
                        <a @click="menus.language = !menus.language"
                          >{{ $t("language") }}
                          <i class="on ion-ios-arrow-down"></i
                        ></a>
                        <ul :class="['submenu', menus.language ? 'open' : '']">
                          <li><a @click="language('en')">English</a></li>
                          <li><a @click="language('zh')">CN</a></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div style="clear: both; height: 20px"></div>
              </div>
            </transition>
            <ul class="navbar-right ml-auto list-inline float-right mb-0">
              <li
                class="menu-item dropdown notification-list list-inline-item"
                style="padding: 20px 10px"
              >
                <a
                  @click="menus.main = !menus.main"
                  :class="[
                    'navbar-toggle',
                    'nav-link',
                    menus.main ? 'open' : '',
                  ]"
                >
                  <div class="lines">
                    <span></span> <span></span> <span></span>
                  </div>
                </a>
              </li>
            </ul>
            <div class="clearfix"></div>
          </div>
        </div>
      </header>
    </div>

    <div style="width: 100%; height: auto">
      <div
        class="ie-mask"
        v-show="menus.main"
        @click="menus.main = !menus.main"
      ></div>
      <div
        :style="
          'background: url(' +
          imgs.banner +
          ') top center no-repeat; background-size:100% 80%;min-height:335px ; position: absolute;width:100%'
        "
      ></div>
      <div
        style="
          line-height: 80px;
          color: #ffffff;
          text-align: center;
          font-size: 22pt;
          padding: 40px 0;
          position: relative;
        "
      >
        {{ $t($route.meta.title) }}
      </div>
      <div>
        <transition name="el-fade-in" mode="out-in">
          <router-view @upSend="upSend" />
        </transition>
      </div>
    </div>
    <footer
      class="footer"
      :style="
        'background: url(' +
        imgs.ftbg +
        ') no-repeat center;background-size: cover;height: 260px;  color: #ffffff; padding: 40px 0 0px 0px;'
      "
    >
      <div class="container-fluid">
        <div
          class="media"
          style="
            display: -webkit-flex;
            display: flex;
            -webkit-align-items: center;
            align-items: center; //-webkit-justify-content: center; //justify-content: center; padding:10px 20px; //border-bottom: 1px solid #EBEBEB; padding: 30px 0 0 0px;
          "
        >
          <img class="d-flex mr-3 thumb-sm" :src="imgs.coinlog" />
          <h4 class="font-22 m-1">Powered by UltronGlow</h4>
        </div>
        <div
          class="col-md-4 col-sm-12"
          style="padding: 10px 0 0 0px; text-align: left"
        >
          Ultronscan is a Blockchain Explorer and Analytics Platform for
          Ultronscan is a Blockchain Explorer and Analytics Platform for
        </div>
        <div style="font-size: 10px; padding: 8px 0 0 0px; text-align: left">
          Version :{{ webVersion }}
        </div>
      </div>
    </footer>

    <loading-sub />
  </div>
</template>
<script>
import FMenu from "@/views/modules/menu.vue";
import BassContract from "@/utils/BassContract.js";
import webSdk from "@/utils/webSdk.js";
import localstorage from "@/utils/localstorage.js";
import headerBgimg from "@/assets/header_background.png";
import loadingSub from "@/components/modules/loadingSubPan.vue";
import logodark from "@/assets/images/logo-dark.png";
import ftbg from "@/assets/images/ftbg.png";
import coinlog from "@/assets/images/coin-logo_bai.png";
import banner from "@/assets/images/banner.png";
import utils from "@/utils/utils";
import { Dialog, Toast } from "vant";
import { createWebsocket } from "@/utils/websocket.js";

//const { createWebsocket }= require(window.$config.SOCKET_TWO?"@/utils/socket.js":"@/utils/websocket.js")
export default {
  components: { FMenu, loadingSub },

  data() {
    let baseConfig = window.$config.BASE_CONFIG();
    let MODUL_SWHITCH = window.$config.MODUL_SWHITCH;
    return {
      webVersion: "1.0.7",
      MODUL_SWHITCH,
      test: true,
      timeObj: null,
      menus: {
        main: false,
        dev: false,
        store: false,
        language: false,
      },
      imgs: { logodark, ftbg, coinlog, banner },
      asset: {
        headerBgimg,
      },
      sdk: null,
      initBtnLoading: false,
      netId: window.$config.netId,
      start_inspect: false,
      setting_loading: false,
      socket_setConfig: null,
      showSetting: false,
      showLogs: false,
      baseConfig,
    };
  },
  mounted() {},
  created() {
    this.active = this.$route.name;
    if (this.$store.getters.getsdk) {
      this.initSdk();
    } else {
      this.initNetwork();
    }
    this.localItem();

    this.intervals();
  },
  activated() {
    this.initSdk();
  },
  beforeDestroy() {
    if (this.timeObj) {
      clearInterval(this.timeObj);
      this.timeObj = null;
    }
    this.socket && this.socket.closeSocket();
    this.socket_setConfig && this.socket_setConfig.closeSocket();
  },
  methods: {
    setConfigBlock(data) {
      let dataL = JSON.parse(JSON.stringify(data || {}));
      dataL.utg_retrieve_block_number =
        this.baseConfig.utg_retrieve_block_number;
      return dataL;
    },

    startInspect(data) {
      this.showLogs = utils.docVersion(this, "0.6664", data);

      let showSetting = utils.docVersion(this, "0.6548", data);
      this.showSetting = showSetting;
      if (!showSetting) return;

      let utg_config = data.utg_config || {};
      let setConfig = this.baseConfig;
      if (utg_config.chain_id) {
        if (
          utg_config.utg_retrieve_block_number ==
          setConfig.utg_retrieve_block_number
        ) {
          this.start_inspect = true;
          return;
        } else {
          setConfig = this.setConfigBlock(utg_config);
        }
      }
      if (this.setting_loading) return;

      this.setting_loading = true;
      let cmd = 2;
      let toast = Toast.loading({
        message: this.$t("settings.initialization"),
        forbidClick: true,
        duration: 30000,
      });
      let message = { utg_config: setConfig };

      this.initDev(message, cmd, (re) => {
        toast.close();
        if (re.isok) {
          setTimeout(() => {
            this.setting_loading = false;
          }, 15000);
        } else {
          this.setting_loading = false;
        }
      });
    },
    initDev(message, cmd, fun) {
      let autofun = {
        onopen: () => {
          this.socket_setConfig.sendWSPush(message, cmd, true);
        },
        onmessage: (data) => {
          if (data.cmd == cmd) {
            fun && fun({ isok: true, data: data });
          }
        },

        onerror: (e) => {
          fun && fun({ isok: false });
        },
      };
      if (this.socket_setConfig) {
        this.socket_setConfig.init(undefined, autofun);
      } else {
        this.socket_setConfig = createWebsocket("devicectl", autofun);
      }
    },

    intervals() {
      this.initSocket();
      if (this.timeObj) {
        clearInterval(this.timeObj);
        this.timeObj = null;
      }
      this.timeObj = setInterval(() => {
        if (!this.socket || !this.socket.linkOk) {
          this.initSocket();
        }
      }, 20000);
    },
    upSend() {
      if (this.socket) {
        this.socket &&
          this.socket.linkOk &&
          this.socket.sendWSPush({}, 1, true);
      }
    },
    initSocket() {
      if (this.socket) {
        this.socket.init();
        return;
      }

      let autofun = {
        onopen: () => {
          this.socket.sendPing({
            time: 10000,
            message: {},
            cmd: 1,
            setTicket: true,
            cd: 0,
          });
        },
        onmessage: (data) => {
          if (data.utg_addr) {
            data.utg_addr = this.hashToNX(data.utg_addr);
          }

          this.$store.dispatch("setDevice", data);
          if (!this.start_inspect) {
            this.startInspect(data);
          }
        },
        onerror: (e) => {
          this.$store.dispatch("setDevice", null);
        },
        onclose: (c) => {
          this.$store.dispatch("setDevice", null);
        },
      };
      this.socket = createWebsocket("devicectl", autofun);
    },
    language(type) {
      this.$i18n.locale = type || "en";
      localstorage.setLocal(this.$i18n.locale);
    },
    hashToNX(val, dFix = false) {
      return webSdk.sdkUtils.hashToNX(val, dFix);
    },
    addrFormat(val, num = 11) {
      if (!val) {
        return val;
      }
      val = this.hashToNX(val);
      return utils.getAddrFormat(val, num);
    },
    localItem() {
      let itemStr = localstorage.getItem();
      let item = null;
      try {
        item = JSON.parse(itemStr);
      } catch (error) {
        this.removeloca();
      }
      if (!item) {
        this.toLogin();
        return;
      }
    },
    toLogin() {
      this.$router.push("/login");
    },
    initSdk(isup = false) {
      try {
        utils.isONes();
      } catch (error) {}

      if (webSdk.sdkUtils.netWorkOk()) {
        let sdk =
          this.$store.getters.getsdk || new webSdk.sdk(new BassContract());
        let account = webSdk.sdkUtils.getSelectAddress();

        if (account) {
          account = this.hashToNX(account);
          this.$store
            .dispatch("setAccount", { _this_: this, account, isup })
            .then(() => {
              this.sdk = sdk;
            })
            .catch((err) => {
              this.sdk = null;
              this.$store.dispatch("setSdk", null);
              this.initBtnLoading = false;
            });
          this.$store.dispatch("setSdk", sdk);
        } else {
          this.sdk = null;
          this.initBtnLoading = false;
        }
      } else {
        this.initBtnLoading = false;
      }
    },
    initNetwork() {
      this.initBtnLoading = true;
      let netIdInt = parseInt(this.netId, 16);
      webSdk.sdkUtils
        .getEnable(() => {
          this.initBtnLoading = false;
        })
        .then(() => {
          this.initBtnLoading = false;
          if (webSdk.sdkUtils.netWorkOk()) {
            this.initSdk();
          } else {
            this.sdk = null;
            this.$store.dispatch("setSdk", null);
          }

          webSdk.sdkUtils.networkChanged((network) => {
            if (netIdInt == network) {
              this.initSdk();
            } else {
              this.sdk = null;
              this.$store.dispatch("setSdk", null);
            }
          });

          webSdk.sdkUtils.accountsChanged((address) => {
            if (webSdk.sdkUtils.netWorkOk()) {
              this.initSdk(true);
            } else {
              this.sdk = null;
              this.$store.dispatch("setSdk", null);
            }
          });

          this.initSdk();
        })
        .catch((err) => {
          this.initBtnLoading = false;
          this.$store.dispatch("setSdk", null);
        });
    },
    cancellation() {
      Dialog.confirm({
        title: `${this.$t("logout")}`,
        message: `${this.$t("messages.logoutin")}`,
        cancelButtonText: `${this.$t("comm.close")}`,
        confirmButtonText: `${this.$t("logout")}`,
      })
        .then(() => {
          this.removeloca();
        })
        .catch(() => {
          // on cancel
        });
    },
    removeloca() {
      localstorage.removeItem();
      this.toLogin();
    },
    languageChange() {
      this.$i18n.locale = this.$i18n.locale == "zh" ? "en" : "zh";
    },
    handleSelect(index, val) {
      if (index && this.$route.name != index) {
        this.$router.push({ name: index });
      }
      this.menus.main = false;
    },
  },
  computed: {
    sdkIsok() {
      return !!this.$store.getters.account;
    },
    /* settingVersion(){
      return utils.docVersion(this,"0.6548",false)
    }*/
  },
};
</script>

<style scoped>
@media (max-width: 991px) {
  #topnav .navigation-menu > li {
    border-bottom: 1px solid #eee;
  }
}

@media (min-width: 992px) {
  #navigation {
    display: block !important;
  }
}
.testetranform {
  animation-name: likes;
  animation-direction: alternate;
  animation-timing-function: linear;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-duration: 0.8s;
}
.hidetranform {
  animation-name: likes;
  animation-direction: alternate;
  animation-timing-function: linear;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-duration: 0.8s;
}
.ie-mask {
  height: 100%;
  position: fixed;
  width: 100%;
  z-index: 1;
}
</style>