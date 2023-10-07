<template>
  <div class="van-overlay-ie">
    <van-popup
      closeable
      close-on-popstate
      v-model="show"
      position="left"
      :lock-scroll="true"
      :style="{
        height: '100%',
        'min-width': '50%',
        'max-width': '90%',
      }"
      :overlay="true"
      transition-appear
    >
      <div style="padding: 20px" v-show="false">
        <h6>{{ $t("logs.detailedlist") }}</h6>
        <h-tbale
          :show-subtitle="true"
          :heard-all-hid="true"
          :show-page="true"
          :table-heard="headrs"
          :table-data="datas"
          :show-right-tools="false"
          :phone-lable-width="this.$i18n.locale == 'zh' ?'80px':'110px'"
          ref="hTable"
        >
          <div slot="sub-title">
            {{ $t("table.total", [datas.length]) }}
          </div>
        </h-tbale>
      </div>
    </van-popup>
  </div>
</template>
<script>
import HTbale from "@/components/modules/HTbale.vue";

export default {
  components: { HTbale },
  props: {
    value: false,
    headrs: {
      type: Array,
      default() {
        return [];
      },
    },
    datas: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      show: false,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        this.show = newVal;
      },
    },
    show: {
      immediate: true,
      handler: function (newVal) {
        this.$emit("input", newVal);
      },
    },
  },
};
</script>
<style>
.van-overlay-ie .van-overlay {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
</style>