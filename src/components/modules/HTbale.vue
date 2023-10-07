<template>
  <div
    v-loading="tableQuery.table_loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <slot name="top_title">
      <div class="sub-title" v-show="showSubtitle">
        <slot name="sub-title" :tableQuery="tableQuery">
          {{ $t("table.total", [tableQuery.total || 0]) }}
        </slot>
      </div>
    </slot>
    <div class="table-responsive pc_table">
      <table class="table table-hover mb-0">
        <thead>
          <tr style="background-color: #f8fafd">
            <template v-for="(item, cd) in tableHeard">
              <th
                scope="col"
                :key="cd"
                :style="{
                  width: item.width || 'auto',
                  'min-width': item.minWidth || '80px',
                }"
                v-if="!item.hide"
              >
                {{ item.titleNotT ? item.title : $t(item.title) }}
              </th>
            </template>

            <th
              scope="col"
              :style="{ 'min-width': '80px', width: rightBtnColWidth }"
              v-if="showRightTools"
            >
              {{ $t("table.operation") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(dataL, dataCd) in tableData">
            <tr :key="`${dataCd}_tr`">
              <template v-for="(item, cd) in tableHeard">
                <td :key="cd">
                  <slot
                    :name="'table_cell_' + item.name"
                    :row="dataL"
                    :config="item"
                    :reval="
                      getTableHeard(item.name, dataL[item.name], dataL, item)
                    "
                  >
                    <div
                      @click="item.isClick ? colClick(item, dataL) : null"
                      :class="item.isClick ? ['cursor', 'clickColor'] : ''"
                    >
                      <div :style="`color:${item.color}`">
                        <template v-if="item.type == 'address'">
                          <el-popover
                            placement="bottom"
                            width="250"
                            trigger="hover"
                            :content="dataL[item.name]"
                          >
                            <span slot="reference">
                              {{
                                item.format
                                  ? getAddrFormat(
                                      getTableHeard(
                                        item.name,
                                        dataL[item.name],
                                        dataL,
                                        item
                                      )
                                    )
                                  : getTableHeard(
                                      item.name,
                                      dataL[item.name],
                                      dataL,
                                      item
                                    )
                              }}</span
                            >
                          </el-popover>
                        </template>
                        <span
                          v-else-if="!!item.isHtml"
                          v-html="
                            getTableHeard(
                              item.name,
                              dataL[item.name],
                              dataL,
                              item
                            )
                          "
                        ></span>
                        <span v-else-if="!!item.valT">
                          {{
                            $t(
                              getTableHeard(
                                item.name,
                                dataL[item.name],
                                dataL,
                                item
                              )
                            )
                          }}
                        </span>
                        <span v-else>
                          {{
                            getTableHeard(
                              item.name,
                              dataL[item.name],
                              dataL,
                              item
                            )
                          }}
                        </span>
                        <slot
                          :name="`table_cell_right_${item.name}`"
                          :row="dataL"
                          :config="item"
                        >
                        </slot>
                      </div>
                    </div>
                  </slot>
                </td>
              </template>
              <td v-if="showRightTools">
                <div class="button-items">
                  <slot name="rightCol" :data="dataL"> </slot>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="phone_table_div">
      <div class="phone_table">
        <div
          class="table_item"
          v-for="(dataL, dataCd) in tableData"
          :key="dataCd"
        >
          <div class="table_row" v-if="false">
            <div class="phone_label" :style="`width:${phoneLableWidth}`">#</div>
            <div
              class="phone_val"
              :style="`width:calc(100% - ${phoneLableWidth})`"
            >
              <b>{{ dataCd + 1 }}</b>
            </div>
          </div>
          <div class="table_row" v-for="(item, tCd) in tableHeard" :key="tCd">
            <div class="phone_label" :style="`width:${phoneLableWidth}`">
              {{ item.titleNotT ? item.title : $t(item.title) }}
            </div>
            <div
              class="phone_val"
              :style="`width:calc(100% - ${phoneLableWidth})`"
            >
              <slot
                :name="'table_cell_' + item.name"
                :reval="getTableHeard(item.name, dataL[item.name], dataL, item)"
                :row="dataL"
                :config="item"
              >
                <div :style="`color:${item.color}`">
                  <template v-if="item.type == 'address'">
                    <el-popover
                      placement="bottom"
                      trigger="hover"
                      :content="dataL[item.name]"
                    >
                      <span slot="reference">
                        {{
                          item.format
                            ? getAddrFormat(
                                getTableHeard(
                                  item.name,
                                  dataL[item.name],
                                  dataL,
                                  item
                                ),
                                8
                              )
                            : getTableHeard(
                                item.name,
                                dataL[item.name],
                                dataL,
                                item
                              )
                        }}</span
                      >
                    </el-popover>
                  </template>
                  <span
                    v-else-if="!!item.isHtml"
                    v-html="
                      getTableHeard(item.name, dataL[item.name], dataL, item)
                    "
                  ></span>
                  <span v-else-if="!!item.valT">
                    {{
                      $t(
                        getTableHeard(item.name, dataL[item.name], dataL, item)
                      )
                    }}
                  </span>
                  <span v-else>
                    {{
                      getTableHeard(item.name, dataL[item.name], dataL, item)
                    }}
                  </span>
                  <slot
                    :name="`table_cell_right_${item.name}`"
                    :row="dataL"
                    :config="item"
                  >
                  </slot>
                </div>
              </slot>
            </div>
          </div>
          <div v-if="showRightTools" class="table_row phone_btns">
            <slot name="rightCol" :data="dataL"> </slot>
          </div>
        </div>
      </div>
    </div>
    <div class="row" v-if="tableQuery.total > 0">
      <div
        class="col-md-5 col-sm-12"
        style="font-size: 9pt; margin: 0px; padding: 0px"
      >
        <ul class="pagination" style="justify-content: left; font-size: 9pt">
          <li class="page-item">
            <a
              class=""
              style="
                padding: 10px;
                border: none;
                border-radius: 6px;
                display: block;
              "
              >{{ $t("table.show") }}</a
            >
          </li>
          <li class="page-item">
            <div class="col-sm-12" style="margin: 0px; padding: 0px">
              <select
                v-model.number="tableQuery.pageSize"
                class="custom-select"
                @change="load()"
              >
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </li>
          <li class="page-item">
            <a
              class=""
              style="
                padding: 10px;
                border: none;
                border-radius: 6px;
                display: block;
              "
              >{{ $t("table.records") }}</a
            >
          </li>
        </ul>
      </div>

     
      <div
        class="col-md-7 col-sm-12 justify-content-end"
        style="font-size: 9pt; margin: 0px; padding: 0px"
      >
        <ul
          class="pagination fyright"
          style="//justify-content:right;// text-align: right; float:right;"
        >
          <li class="page-item">
            <a
              class="page-link"
              @click="load(1)"
              href="javascript:void(0)"
              style="
                padding: 10px;
                margin: 4px;
                border: none;
                background-color: #eaf8f9;
                border-radius: 6px;
                color: #41c0cb;
                font-size: 9pt;
              "
              >{{ $t("table.first") }}</a
            >
          </li>
          <li class="page-item">
            <a
              @click="tableQuery.pageNum > 1 && load(tableQuery.pageNum - 1)"
              class="page-link"
              href="javascript:void(0)"
              style="
                padding: 10px;
                margin: 4px;
                border: none;
                background-color: #eaf8f9;
                border-radius: 6px;
                color: #41c0cb;
              "
              ><i class="mdi mdi-chevron-left"></i
            ></a>
          </li>
          <li class="page-item">
            <a
              class="page-link"
              style="
                padding: 10px;
                margin: 4px;
                border: none;
                background-color: #eaf8f9;
                border-radius: 6px;
                color: #757575;
              "
            >
              {{ tableQuery.pageNum }} /<span>{{ tableQuery.page_total }}</span>
            </a>
          </li>
          <li class="page-item">
            <a
              @click="
                tableQuery.pageNum < tableQuery.page_total &&
                  load(tableQuery.pageNum + 1)
              "
              href="javascript:void(0)"
              class="page-link"
              style="
                padding: 10px;
                margin: 4px;
                border: none;
                background-color: #eaf8f9;
                border-radius: 6px;
                color: #41c0cb;
              "
              ><i class="mdi mdi-chevron-right"></i
            ></a>
          </li>
          <li class="page-item">
            <a
              @click="tableQuery.page_total > 0 && load(tableQuery.page_total)"
              href="javascript:void(0)"
              class="page-link"
              style="
                padding: 10px;
                margin: 4px;
                border: none;
                background-color: #eaf8f9;
                border-radius: 6px;
                color: #41c0cb;
              "
              >{{ $t("table.last") }}</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div
      v-else-if="!tableData || tableData.length === 0"
      style="text-align: center; color: #555; line-height: 50pt; clear: both"
    >
      {{ $t("comm.noData")
      }}<el-button icon="el-icon-refresh" type="text" @click="load(1)" />
    </div>
  </div>
</template>
<script>
import tableUtils from "@/utils/table";
import request from "@/tboot/ajax.js";
import utils from "@/utils/utils.js";
export default {
  name: "fTable",
  props: {
    title: {
      type: String,
      default: "",
    },
    showSubtitle: {
      type: Boolean,
      default: false,
    },
    rowClassName: {
      type: Function,
      default() {
        return undefined;
      },
    },
    tableHeard: {
      type: Array,
      default() {
        return [];
      },
    },
    tableData: {
      type: Array,
      default() {
        return [];
      },
    },
    rowKey: {
      type: [String, Number],
      default: null,
    },
    expandRowKeys: {
      type: Array,
      default() {
        return null;
      },
    },
    rightBtnMap: {
      type: Object,
      default() {
        return {
          edit: true,
          delete: true,
        };
      },
    },
    heardAllHid: {
      type: Boolean,
      default: false,
    },
    showSummary: {
      type: Boolean,
      default: false,
    },
    summaryMethod: {
      type: Function,
      default() {
        return null;
      },
    },

    border: {
      type: Boolean,
      default: false,
    },
    expand: {
      type: Boolean,
      default: false,
    },
    rightBtnSize: {
      type: String,
      default: "mini",
    },
    rightBtnColWidth: {
      type: String,
      default: "120px",
    },

    showCheckbox: {
      type: Boolean,
      default: false,
    },
    showRightTools: {
      type: Boolean,
      default: false,
    },
    showPage: {
      type: Boolean,
      default: true,
    },
    topRightToolsShow: {
      type: Boolean,
      default: true,
    },
    optionMap: {
      type: Object,
      default() {
        return {
          value: "key",
          label: "value",
        };
      },
    },
    showOverflowTooltip: {
      type: Boolean,
      default: false,
    },
    selectInit: {
      type: Function,
      default() {
        return null;
      },
    },
    phoneLableWidth: {
      type: String,
      default: "80px",
    },
  },

  data() {
    let tableQuery = tableUtils.newTableData().query;
    tableQuery.table_loading = false;
    return {
      isRouterAlive: true,
      tableQuery,
      tableValsMap: this.getTableValsMap(),
      imgurl: (window.$url || {}).imgUrl || "",
      allDelete: true,
    };
  },
  methods: {
    getAddrFormat(val, num = 12) {
      if (val && val.length <= num) {
        return val;
      }
      return utils.getAddrFormat(val, num);
    },
    ieUpdate() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
    handleSelectionChange() {
      if (
        this.$refs.multipleTable.selection == null ||
        this.$refs.multipleTable.selection.length == 0
      ) {
        this.allDelete = true;
      } else {
        this.allDelete = false;
      }
      this.$emit("select-change", this.$refs.multipleTable.selection);
    },
    sortChange(column) {
      //prop, order
      this.tableQuery.sortBy = column.prop;
      this.tableQuery.descending = column.order == "descending" ? true : false;
      this.$emit("load", this.tableQuery);
    },
    rightTools(type, scope) {
      this.$emit("right-tools", type, scope);
    },
    topTools(type) {
      this.$emit("top-tools", type);
    },
    load(page = this.tableQuery.pageNum) {
      this.tableQuery.pageNum = page;
      this.$emit("load", this.tableQuery);
    },
    getTableHeard(key, val, row, citem) {
      if (this.tableValsMap[key]) {
        if (typeof this.tableValsMap[key] == "function") {
          val = this.tableValsMap[key](val, row, citem);
        } else {
          val = this.tableValsMap[key][val];
        }
      }
      if (!utils.isEmpty(val) && !utils.isEmpty(citem.units)) {
        val += "" + citem.units;
      }
      return val;
    },
    getTableValsMap() {
      var map = {};
      this.tableHeard.forEach((element) => {
        if (element.valMap) {
          map[element.name] = element.valMap;
        } else if (element.optionUrl) {
          let optionMap = element.optionMap || this.optionMap;
          let namesL = [];
          if (!utils.isEmpty(optionMap.label)) {
            let ynames = optionMap.label.split(",");
            ynames.forEach((key) => {
              if (!utils.isEmpty(key)) {
                namesL.push(key.trim());
              }
            });
          }

          let index = element.optionUrl.lastIndexOf("?");
          let rdata = {};
          if (index >= 0) {
            let str = element.optionUrl.substring(
              index + 1,
              element.optionUrl.length
            );
            rdata = utils.getUrlParams(str);
          }

          request({
            url: element.optionUrl,
            method: "post",
            rdata,
          })
            .then((response) => {
              let arr = response || [];
              let valMap = {};
              arr.forEach((item) => {
                let labelsL = "";
                namesL.forEach(function (nameL) {
                  let labelL = item[nameL];
                  if (!utils.isEmpty(labelL)) {
                    labelsL += labelsL.length > 0 ? "  " + labelL : labelL;
                  }
                });
                let valL = item[optionMap.value];
                if (
                  element.vaType == "number" &&
                  valL !== null &&
                  valL !== undefined
                ) {
                  valL = parseFloat(valL);
                }
                valMap[valL] = labelsL;
              });

              //   map[element.name] = valMap
              this.$set(map, element.name, valMap);
              //this.ieUpdate()
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
      return map;
    },
    
    expandChange(row, arrs) {
      this.$emit("expand-change", row, arrs);
    },
    onAddr(item, row) {
      this.$emit("onAddr", item, row);
    },
    colClick(item, dataL) {
      this.$emit("colClick", { col: item, row: dataL });
    },
  },
  mounted() {
    this.$emit("inint-ok", this.tableQuery);
  },
  watch: {
    tableHeard: {
      handler: function () {
        //newV, oldV
        this.tableValsMap = this.getTableValsMap();
      },
    },
    "tableQuery.query": function () {
      this.tableQuery.pageNum = 1;
      if (this.loadTime) {
        clearTimeout(this.loadTime);
        this.loadTime = null;
      }
      this.loadTime = setTimeout(() => {
        this.load();
      }, 700);
    },
  },
};
</script>
<style scoped>
.clickColor {
  color: #2ebac6;
}

@media (min-width: 1100px) {
  .pc_table {
    display: table;
  }
}

@media (max-width: 1100px) {
  .pc_table {
    display: none;
  }
}
@media (min-width: 1100px) {
  .phone_table {
    display: none;
  }
}
@media (max-width: 1100px) {
  .phone_table {
    display: unset;
  }
}
.phone_table_div {
  text-align: center;
}
.phone_table {
  background-color: #fff;
  width: 100%;
  margin: 0px auto;
  max-width: 600px;
  text-align: left;
}
.phone_label,
.phone_val {
  display: inline-block;
  padding: 5px;
  vertical-align: top;
}
.phone_label {
  font-weight: 600;
  color: #555;
}
.phone_btns {
  text-align: center;
  border-top: solid 1px #eee;
  padding-top: 3px;
}
.table_item {
  box-shadow: 0px 0px 13px 0px rgba(236, 236, 241, 1);
  margin-bottom: 20px;
  clear: both;
  background-color: #fff;
  padding: 10px;
}

.phone_val {
  word-wrap: break-word;
  word-break: normal;
}
</style>