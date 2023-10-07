<template>
  <div
    class="col-md-12"
    style="overflow-x: auto; scroll-behavior: smooth"
    ref="flowDiv"
  >
    <div class="flow" style="min-width: 400pt">
      <div class="flowListBox">
        <div
          v-for="(item, cd) in steps"
          :key="cd"
          :class="['flowList', 'for-cur', 'step-div', getClass(cd)]"
          :style="`width:${divWidth}%`"
        >
          <em :class="['step-num', getClass(cd)]">{{ cd + 1 }}</em
          ><br />
        </div>
      </div>
      <div
        class="row"
        style="text-align: center; padding: 20px 0px; font-size: 12pt"
      >
        <div
          :class="`col-md-${colNum} col-${colNum}`"
          v-for="(item, cd) in steps"
          :key="cd"
        >
          {{ $t(item.title) }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    active: {
      type: Number,
      default: 0,
    },
    steps: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  mounted() {
    this.showScroll();
  },
  methods: {
    getClass(cd) {
      if (this.active > cd) {
        return "action";
      } else if (this.active < cd) {
        return "noaction";
      } else {
        return "";
      }
    },
    showScroll() {
      let dev = this.$refs.flowDiv;
      if (dev) {
        let length = this.steps.length;
        if (length) {
          let dWidth = dev.offsetWidth / length ;
          dWidth = dWidth * (this.active+1) -dWidth / 2;
          dWidth = dWidth > dev.offsetWidth ? dev.offsetWidth : dWidth;
          dev.scrollTo(dWidth, 0);
        }
      }
    },
  },
  computed: {
    colNum() {
      let length = this.steps.length;
      if (length) {
        return 12 / length;
      } else {
        return 12;
      }
    },
    divWidth() {
      let length = this.steps.length;
      if (length) {
        return (100 / length).toFixed(5);
      } else {
        return 99;
      }
    },
  },
  watch: {
    active: {
      immediate: true,
      handler: function () {
         this.showScroll()
      },
    },
  },
};
</script>
<style scoped>
.step-div {
  position: relative;
  background-color: rgb(51, 143, 248);
  border: 2px solid rgb(51, 143, 248);
  text-align: center;
}
.step-div.noaction {
  border: 2px solid #ccc;
  background: #ccc;
}
.step-div.action {
  border: 2px solid rgb(51, 143, 248);
  background-color: rgb(51, 143, 248);
}
.step-num {
  background-color: rgb(51, 143, 248);
  border: 0px none rgb(51, 143, 248);
}
.step-num.noaction {
  border: 2px solid #ccc;
  background: #ccc;
}
.step-num.action {
  background-color: rgb(51, 143, 248);
  border: 0px none rgb(0, 0, 0);
}
</style>