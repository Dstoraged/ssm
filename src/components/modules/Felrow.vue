<template>
  <div
    style="overflow: hidden"
    class="bgwhite borderradius"
    :style="{ 'background-color': bgcolor }"
  >
    <div class="top-wrapper" v-if="showTop || title">
      <div class="left-wrapper">
        <span v-show="!!title">{{ $t(title) }}</span>
        <span v-show="!!subtitle">{{ $t(subtitle) }}</span>
      </div>
    </div>

    <el-row class="ie_row" :gutter="10">
      <el-col
        v-for="(item, cd) in titles"
        :key="cd"
        :class="[
          'ie_el_col',
          item.bootomLine || bootomLine ? 'bootomLine' : '',
        ]"
        :style="{ 'text-align': position }"
        :xs="24"
        :sm="item.colWidth || colWidth"
        :md="item.colWidth || colWidth"
        :lg="item.colWidth || colWidth"
        :xl="item.colWidth || colWidth"
        ><div class="item-wrapper">
          <slot :name="'colrow_' + item.name" :data="datas">
          
            <div
              class="tran-title"
              :style="{
                width: item.titleWidth || titleWidth,
                'text-align': item.titleAlign || titleAlign,
              }"
            >
              {{ item.notT ? item.title : $t(item.title) }}
            </div>
            <div
              class="equal-width"
              :style="`width:calc(100% - ${item.titleWidth || titleWidth})`"
            >
              <slot :name="'colData_' + item.name" :data="datas">
                {{
                  item.isT ? $t(datas[item.name || ""]) : datas[item.name || ""]
                }}
              </slot>
            </div>
          </slot>
        </div></el-col
      >
    </el-row>

    <slot name="ie_bottom"> </slot>
  </div>
</template>
<script>
export default {
  props: {
    showTop: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    colWidth: {
      type: Number,
      default: 12,
    },
    titles: {
      type: Array,
      default() {
        return [];
      },
    },
    position: {
      type: String,
      default: "left",
    },
    bgcolor: {
      type: String,
      default: "",
    },
    titleWidth: {
      type: String,
      default: "auto",
    },
    bootomLine: {
      type: Boolean,
      default: false,
    },
    titleAlign: {
      type: String,
      default: "left",
    },
    datas: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {};
  },
  computed: {
    phoneTitles() {
      let titles = [];
      (this.titles || []).forEach((element) => {
        (element.titles || []).forEach((item) => {
          titles.push(item);
        });
      });

      return titles;
    },
  },
};
</script>
<style scoped>
.ie_el_col {
  margin: 3pt auto;
}
.tran-title,
.equal-width {
  display: inline-block;
  vertical-align: top;
}
.equal-width {
  color: #888;
  padding-left: 5pt;
}
.item-wrapper {
  padding-bottom: 3pt;
}
.tran-title {
  color: #333;
  display: inline-block;
}

.content-container {
  padding: 10pt;
  margin-bottom: 5pt;
}
</style>
 