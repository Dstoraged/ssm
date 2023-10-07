<template>
  <div class="loadingSub">
    <el-dialog
      :close-on-click-modal="false"
      :visible="getWin"
      @close="closeWin"
      :close-on-press-escape="false"
      :show-close="false"
      width="90%"
      lock-scroll
      custom-class="dialog_auto"
    >
      <div slot="title" class="ie_title">
        {{ getItem.title || "" }}
      </div>
    <div class="ie_loadingContext">
      <div v-html="getItem.context"></div>
      <div style="border-bottom: 1px solid #eee; margin-bottom: 5px">
        {{ getItem.time }}
      </div>
      <div v-html="getItem.subContext" ></div>

      <div class="ie_textarea" >
        {{ $t("loadingSubPan.state") }}：<span
          ><i :style="'color:' + typesColor[getItem.status]">{{
            $t(typesText[getItem.status] || "")
          }}</i
          ><i v-if="getItem.status == 1" class="el-icon-loading"></i
        ></span>
        <div v-show="!!getItem.errMsg" class="error_msg">
          {{ getItem.errMsg }}
        </div>
      </div>
      </div>
      <div
        
        v-show="getItem.closebtnshow || getItem.status != 1"
      >
        <el-button
          style="width: 100%"
          :type="getItem.status == 2 ? 'primary' : 'default'"
          @click="closeWin"
          >{{
            getItem.status == 2
              ? $t("messages.confirm")
              : $t("loadingSubPan.close")
          }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
    closeWin() {
      this.$store.dispatch("setWinStatus", false);
      if (this.getItem.closewin) {
        this.getItem.closewin(this.getItem.status);
      }
    },
  },
  computed: {
    getWin() {
      return this.$store.getters.publicWin;
    },
    getItem() {
      return this.$store.getters.publicItem || {};
    },
    typesColor() {
      return this.$store.getters.typesColor || {};
    },
    typesText() {
      return this.$store.getters.typesText || {};
    },
  },
};
</script>
<style scoped>
.ie_title {
  background: linear-gradient(to right, #348cf8 0%, #06e6e9 100%);
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-weight: 600;
}

.error_msg {
  color: red;
  border-top: solide 1px #eee;
  padding: 10px;
  margin-bottom: 10px;
}
.ie_textarea{
  margin-bottom: 5px; min-height: 80px;
}
.ie_loadingContext{
  line-height: 30px;
  padding:10px;
  font-weight: bold;
}
</style>
<style >
.dialog_auto {
  max-width: 450px;
}
.dialog_auto .el-dialog__body {
  padding: 0px;
}

.loadingSub .el-dialog__header {
  padding: 0px;
}
</style>