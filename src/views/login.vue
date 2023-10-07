<template>
  <div >
    <div class="accountbg"></div>

    <div class="wrapper-page-test">
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-lg-5">
            <div class="card card-pages shadow-none mt-4">
              <div class="card-body">
                <div class="text-center mt-0 mb-3">
                  <a class="logo logo-admin">
                    <img :src="log_dark" class="mt-3" alt="" height="50"
                  /></a>
                </div>

                <div >
                  <div
                    style="
                      
                      font-size: 18pt;
                      font-weight: bold;
                      float: left;
                     
                    "
                  >
                    {{ $t("login.connectServer") }}
                  </div>
                  <div
                    style="float: right; padding-right: 30px"
                  >
                    <el-dropdown trigger="click" v-if="user.options.length > 0">
                      <span class="el-dropdown-link cursor">
                        {{ $t("login.quickLogin") }}<i
                          class="el-icon-arrow-down el-icon--right"
                        ></i>
                      </span>

                      <el-dropdown-menu
                        slot="dropdown"
                        style="max-height: 60%; overflow-y: auto"
                      >
                        <el-dropdown-item
                          divided
                          v-for="(item, cd) in user.options"
                          :key="cd"
                        >
                          <div @click="setItemAndTo(item)">
                            <div class="font_b">
                              {{ item.name }}
                            </div>
                            <div>
                              {{ `${$t("login.link")}: ${item.url}` }}
                            </div>
                            <div>
                              {{ `${$t("login.saveTime")}: ${item.time}` }}
                            </div>
                          </div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <el-button v-show="false" type="text" @click="onTest"
                      >TEST</el-button
                    >
                  </div>
                </div>
                <div style="clear:both"></div>

                <div class="form-horizontal mt-4">
                  <el-form
                    :model="form.data"
                    :rules="form.rules"
                    ref="ruleForm"
                    label-width="auto"
                    class="ie_form"
                    ><el-form-item prop="url">
                      <div class="form_label">{{$t("login.pleaseserver")}}</div>
                      <el-input
                        v-model="form.data.url"
                        placeholder="192.168.100.1:1234"
                        @keyup.enter.native="submitForm"
                      />
                    </el-form-item>
                    <el-form-item prop="password">
                      <div class="form_label">{{$t("login.pleasepassword")}}</div>
                      <el-input v-model="form.data.password" type="password">
                      </el-input>
                    </el-form-item>
                    <el-form-item style="text-align: left">
                      <el-checkbox v-model="form.data.saves">{{
                        $t("login.remember")
                      }}</el-checkbox>

                      <el-input
                        v-if="form.data.saves"
                        style="width: 150px; margin-left: 5px"
                        v-model="form.data.saveName"
                        :placeholder="$t('login.mnemonicName')"
                         @keyup.enter.native="submitForm"
                      />
                    </el-form-item>
                  </el-form>

                  <div class="form-group text-center mt-3">
                    <div class="col-12">
                      <button
                        class="
                          btn btn-primary btn-block
                          waves-effect waves-light
                        "
                        @click="submitForm"
                        v-loading="form.loading"
                      >
                        {{$t("login.login")}}
                      </button>
                    </div>
                  </div>

                  <div class="form-group text-center mt-4" v-if="false">
                    <div class="col-12">
                      <div class="float-left">
                        <a href="#" class="text-muted"
                          ><i class="fa fa-lock mr-1"></i> Forget password?</a
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end row -->
      </div>
    </div>
  </div>
</template>
<script>
import { websocket } from "@/utils/websocket.js";
import localstorage from "@/utils/localstorage.js";
import CryptoJS from "@/utils/CryptoJS.js";
import log_dark from "@/assets/images/logo-dark.png";

export default {
  data() {
    return {
      log_dark,
      socket: null,
      form: {
        loading: false,
        rules: {
          password: [{ required: true, trigger: "blur" }],
          url: [{ required: true, trigger: "blur" }],
        },
        data: {
          url: "", //"10.117.0.60:1234", //"192.168.1.172:1234",
          password: "admin@utg", //"1234567",//
          saves: false,
          saveName: "",
        },
      },
      errors: window.$config.ERROR_TYPES,
      user: {
        login: "",
        options: [],
      },
    };
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
  },
  created() {
    this.inits();
  },
  methods: {
    inits() {
      try {
        this.user.options = localstorage.getList() || [];
      } catch (error) {}
      this.toLocal();
    },
    toLocal() {
      let id = this.$route.params.id;
      if (id) {
        let options=this.user.options||[];
        let itemL = options.find((item) => {
          if (item.random == id) {
            return item;
          }
        });
        itemL && this.setItemAndTo(itemL);
      }
    },
    toHome() {
      this.$router.push("/");
    },
    submitForm() {
      if(this.form.loading){
        return;
      }
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.form.loading = true;
          let item = this.form.data;
          
          let md5P = CryptoJS.md5(item.password);
          md5P = CryptoJS.hexToString(md5P);
          let rePassword = CryptoJS.encrypt(md5P);

          this.socket = this.socket || new websocket();

          let autofun = {
            onopen: () => {
              this.socket.sendWSPush(rePassword, null, false);
            },
            onmessage: (data) => {
              let enc_ticket = data.enc_ticket;

              enc_ticket = CryptoJS.hexToString(enc_ticket);
              let ticket = CryptoJS.rc4(enc_ticket, md5P);
              let setItem = {
                name: `${item.saveName}`,
                url: `${item.url}`,
                ticket,
              };
              this.setList(setItem, item.saves);
              this.setItemAndTo(setItem);
              this.$store.dispatch("setMakeUp", true);
            },
            onerror: (e) => {
              this.form.loading = false;
            },
            onclose: (c) => {
              this.form.loading = false;
            },
          };

          this.socket.init(item.url, autofun, "login");
        }
      });
    },
    onTest() {
      let item = {
        ticket: "xxxxxxxxx",
        url: "192.168.1.172:1234",
      };
      this.setItemAndTo(item);
    },
    setItemAndTo(item) {
      localstorage.setItem(JSON.stringify(item));
      this.toHome();
    },

    setList(item, saves = false) {
      localstorage.setList(item, saves);
    },
    setMsg() {
      sendWSPush(this.message);
    },

    removeloca() {
      localstorage.removeItem();
    },
  },
};
</script>
<style scoped src="@/assets/css/style.css"></style>
<style scoped src="@/assets/css/bootstrap.min.css"></style>
<style scoped>
.form_label {
  display: inline-block;
  font-weight: 700;
}
* {
  font-family: "Nunito", sans-serif;
  color: #354558;
  font-size: 14px;
}
.ie_page {
  height: 100%;
  text-align: center;
}
.ie_title {
  height: 24px;
  font-size: 20px;
  font-family: Microsoft YaHei;
  font-weight: 500;
  color: #000;
  border-bottom: 2px #eee solid;
  padding: 3px 5px 5px;
  margin-bottom: 5px;
}
.demo-ruleForm {
  max-width: 450px;
  box-shadow: 0px 0px 13px 0px rgba(236, 236, 241, 0.44);
  margin: 0px auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-top: 10%;
}

.wrapper-page-test{
  margin-top:7.5em;
}
@media (max-width:768px) {
  .accountbg {
  background: #fff;
  }
  .card{
    border: none;
  }
  .wrapper-page-test{
    margin-top: 0px;
  }
  
}
</style>
<style >
.el-dropdown-menu__item {
  line-height: 25px;
}
</style>