<template>
  <div>
    <van-dialog
      v-model="show"
      close-on-popstate
      :close-on-click-overlay="false"
      :title="getItem.title || ''"
      lock-scroll
      custom-class="dialog_auto"
      :overlay-style="{ 'background-color': 'rgba(0,0,0,0.1)' }"
      :show-confirm-button="
        getItem.closebtnshow || (getItem.status != 1 && getItem.status != 3)
      "
      @confirm="closeWin"
      :confirm-button-color="getItem.status == 2 ? 'green' : 'red'"
      :confirm-button-text="
        getItem.status == 2
          ? $t('loadingSubPan.finish')
          : $t('loadingSubPan.close')
      "
    >
      <div style="padding: 8px">
        <div
          v-if="!!getItem.context"
          v-html="getItem.context"
          style="margin-bottom: 8px"
        ></div>
        <div style="border-bottom: 1px solid #eee; margin-bottom: 5px">
          {{ getItem.time }}
        </div>
        <div
          v-if="!!getItem.subContext"
          v-html="getItem.subContext"
          style="margin-bottom: 8px"
        ></div>
        <div style="min-height: 80px">
          {{ $t("loadingSubPan.state") }}：<span
            ><i :style="'color:' + typesColor[getItem.status]">{{
              $t(typesText[getItem.status] || "")
            }}</i>
            <i v-if="getItem.status == 1" class="el-icon-loading"></i>
          </span>
          <div
            v-show="!!getItem.errMsg"
            style="
              color: red;
              background-color: #eee;
              padding: 10px;
              margin-bottom: 10px;
            "
          >
            {{ getItem.errMsg }}
          </div>
          <div style="text-align: center" v-show="false">
            <el-button @click="closeWin">{{
              getItem.status == 2
                ? $t("messages.well")
                : $t("loadingSubPan.close")
            }}</el-button>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      show: this.$store.getters.publicWin,
    };
  },
  methods: {
    closeWin() {
      this.show = false;
      this.$store.dispatch("setWinStatus", false);
      if (this.getItem.closeWin) {
        this.getItem.closeWin(this.getItem.status);
      }
    },
  },
  computed: {
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
  watch: {
    "$store.getters.publicWin": function (newVal) {
      this.show = !!newVal;
    },
  },
};
</script>
<style >
.dialog_auto {
  max-width: 450px;
}
.dialog_auto .el-dialog__body {
  padding: 10px;
}
</style>