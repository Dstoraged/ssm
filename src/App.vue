<template>
  <div class="app_main">
    <transition name="el-fade-in" mode="out-in">
      <router-view />
    </transition>
    
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      active: window.$config.webActive || "",
    };
  },

  mounted() {
    window.document.title = this.$t(window.$config.windowTitle || "web");
  },
  watch: {
    "$i18n.locale": function () {
      window.document.title = this.$t(window.$config.windowTitle || "web");
    },
  },
};
</script>
<style>
html{
  height: 100% !important
}

body,
.app_main {
  background-color: #f3f6fb;
  width: 100%;
  overflow-x: hidden;
}
.overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overflow_l {
  display: inline-block;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overflow_r {
  display: inline-block;
  max-width: 50%;
  overflow: hidden;
  white-space: nowrap;
  direction: rtl;
}

@media (max-width: 600px) {
  .overflow_pc {
    display: none;
  }
  .overflow_app {
    display: unset;
  }
}
@media (min-width: 600px) {
  .overflow_pc {
    display: unset;
  }
  .overflow_app {
    display: none;
  }
}

.cursor {
  cursor: pointer;
}
.font_b {
  font-weight: 600;
}
.el-button--primary {
  color: #fff;
  background-color: rgb(35, 203, 224);
  border-color: rgb(35, 203, 224);
}
.hoverbg :hover {
  background: rgba(51, 158, 252, 0.8);
  color: #eee;
}
.bootomLine {
  border-bottom: 1px solid #eee;
}
.bgwhite {
  background-color: #fff;
}
.showbox {
  box-shadow: 0px 2px 16px 0px rgba(0, 49, 209, 0.1);
}
.borderradius {
  border-radius: 5px;
}
.ie_col_test {
  padding-left: 5px;
  padding-right: 5px;
  box-sizing: border-box;
  display: inline-block;
  width: 25%;
}
.top_title {
  text-align: left;
  height: 24px;
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 600;
  color: #777;
}
.navigation-menu > li > a {
  cursor: pointer;
}

.submenu > li > a {
  cursor: pointer;
}
.el-popover--plain{
  z-index: 99999 !important
}
.el-notification{
   z-index: 99999 !important
}
</style>
<style scoped>
#app {
  width: 100%;
}
</style>
<style  src="@/assets/css/bootstrap.min.css"></style>
<style  src="@/assets/css/icons.css"></style>
<style  src="@/assets/css/style.css"></style>
<style  src="@/assets/css/flow.css"></style>
