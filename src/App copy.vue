<template>
  <div id="app">
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
    window.document.title = window.$config.windowTitle || "web";
  },
};
</script>
<style>
html,
body {
  min-height: 500px;
  height: 100%;
  background-color: #f3f6fb;
}
.cursor {
  cursor: pointer;
}
.font_b {
  font-weight: 600;
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
</style>
<style scoped>
#app {
  height: 100%;
  overflow-y: auto;
}
</style>
