<template>
  <div>
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

                <div>
                  <div
                    style="
                      width: 70%;
                      font-size: 16pt;
                      font-weight: bold;
                      float: left;
                    "
                  >
                    {{ $t("rPassword.modifyPassword") }}
                  </div>
                  <div style="float: right">
                    <span type="text" @click="toHome" class="cursor" style="color:#23cbe0">{{
                      $t("rPassword.return")
                    }}</span>
                  </div>
                </div>
                <div style="clear: both"></div>
                <div class="form-horizontal mt-4">
                  <el-form
                    :model="form.data"
                    :rules="form.rules"
                    ref="ruleForm"
                    label-width="auto"
                    class="ie_form"
                  >
                    <el-form-item size="mini">
                      <div class="form_label">{{ $t("rPassword.connectedServer") }}</div>
                      {{ local.url }}
                    </el-form-item>
                    <el-form-item prop="password">
                      <div class="form_label">
                        {{ $t("rPassword.newPassword") }}
                      </div>
                      <el-input v-model="form.data.password" type="password" />
                    </el-form-item>
                    <el-form-item prop="passwordt">
                      <div class="form_label">
                        {{ $t("rPassword.confirmPassword") }}
                      </div>
                      <el-input v-model="form.data.passwordt" type="password" />
                    </el-form-item>
                  </el-form>

                  <div class="form-group text-center mt-3">
                    <div class="col-12">
                      <el-button
                        type="primary"
                        class="btn btn-primary"
                        @click="submitForm"
                        v-loading="form.loading"
                      >
                        {{ $t("rPassword.confirmModification") }}
                      </el-button>
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
import { createWebsocket } from "@/utils/websocket.js";
import localstorage from "@/utils/localstorage.js";
import CryptoJS from "@/utils/CryptoJS.js";
import log_dark from "@/assets/images/logo-dark.png";
export default {
  data() {
    let _this_ = this;
    return {
      istest: false,
      log_dark,
      socket: null,
      form: {
        loading: false,
        rules: {
          password: [{ required: true, trigger: "blur" }],
          passwordt: {
            validator: (rule, value, callback) => {
              if (_this_.form.data.password == value) {
                callback();
              } else {
                callback(new Error(`${_this_.$t("rPassword.twopassword")}`));
              }
            },
            trigger: "blur",
          },
        },
        data: {
          password: "",
          passwordt: "",
        },
      },
      errors: window.$config.ERROR_TYPES,
      user: {
        login: "",
        options: [],
      },
      local: {},
    };
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.local = localstorage.getTicket();
    },
    toHome() {
      this.$router.push("/");
    },
    toLogin() {
      this.$router.push("/login");
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.form.loading = true;
          let _this_ = this;
          let autofun = {
            onopen: () => {
              let ticket = localstorage.getTicket(_this_).ticket;
              let md5T = CryptoJS.md5(ticket);
              md5T = CryptoJS.hexToString(md5T);

              let password = _this_.form.data.password;

              let newpasswd = CryptoJS.toHexString(
                CryptoJS.rc4(password, md5T)
              );
              let newpasswd_md5 = CryptoJS.md5(password);

              _this_.socket.sendWSPush({ newpasswd, newpasswd_md5 }, 100, true);
            },
            onmessage: (data) => {
              if (data.cmd == 100) {
                _this_.form.loading = false;
                _this_.$notify({
                  title: $t("comm.success"),
                  message: $t("messages.needLogin"),
                  type: "success",
                });
                _this_.removeloca();
                _this_.toLogin();
              }
            },
            onerror: (e) => {
              _this_.form.loading = false;
            },
            onclose: () => {
              _this_.loading = false;
            },
          };
          if (_this_.socket) {
            _this_.socket.init();
          } else {
            _this_.socket = createWebsocket("devicectl", autofun);
          }
        }
      });
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
.btn-primary {
  width: 100%;
}
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
.btn-primary {
  background-color: #23cbe0 !important;
  border: 1px solid #23cbe0 !important;
}
</style>