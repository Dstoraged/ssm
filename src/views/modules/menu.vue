<template>
  <div>
    <el-menu
      :default-active="$route.name"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="rgba(1,32,99,0.3)"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="home">home</el-menu-item>
      <el-menu-item index="pledge">pledge</el-menu-item>
      <el-menu-item index="market">market</el-menu-item>

      <el-menu-item v-if="false" @click="openWeb"><a>---</a></el-menu-item>
      <div style="clear: both"></div>
    </el-menu>
  </div>
</template>
<script >
export default {
  data() {
    return {};
  },
  created() {
    //this.initSocket()
  },
  beforeDestroy() {
    // closeSocket();
  },
  methods: {
    handleSelect(index, val) {
      if (index && this.$route.name != index) {
        this.$router.push({ name: index });
      }
    },
    toLogin() {
      this.$router.push("/login");
    },
    openWeb() {
      window.open("http://192.168.9.101:8803/web/nfc/#/");
    },

    removeloca() {
      localstorage.removeItem();
      this.toLogin();
    },
  },
};
</script>
<style scoped>
.el-menu-demo {
  position: inherit;
}
</style>
<style >
.el-submenu__title:hover {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
.el-menu-item:focus,
.el-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.5) !important;
}
.el-menu.el-menu--horizontal {
  border-bottom: solid 0px #e6e6e6 !important;
}
</style>