
<template>
  <div>
    <slot name="topContext">
      <div v-if="!heardAllHid">
        <el-col :span="16">
          <div class="grid-content bg-purple">
            <slot name="qLeft" :data="tableQuery">
              <el-input
                v-if="!!tableQuery"
                class="search-text"
                placeholder="query"
                suffix-icon="el-icon-search"
                v-model="tableQuery.query"
              ></el-input>
            </slot>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            v-if="topRightToolsShow"
            class="grid-content bg-purple-light"
            style="text-align: right"
          >
            <slot name="qRight" :data="{ tableQuery, tableData }">
              <el-button
                class="filter-item"
                size="mini"
                type="primary"
                icon="el-icon-plus"
                @click="topTools('add')"
                style="margin-right: 5px"
              >
                {{ $t("table.add") }}
              </el-button>
            </slot>
          </div>
        </el-col>
      </div>
    </slot>

    <el-table
      :row-class-name="rowClassName"
      :border="border"
      v-if="isRouterAlive"
      :data="tableData"
      style="width: 100%"
      ref="multipleTable"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
      @expand-change="expandChange"
      :row-key="rowKey"
      :expand-row-keys="expandRowKeys"
      :show-summary="showSummary"
      :summary-method="summaryMethod"
    >
      <template slot="empty">
        {{ $t("comm.noData")
        }}<el-button icon="el-icon-refresh" type="text" @click="load(1)" />
      </template>
      <el-table-column v-if="expand" type="expand">
        <template slot-scope="props">
          <slot name="scope_ie" :data="props.row"> </slot>
        </template>
      </el-table-column>

      <el-table-column
        v-if="showCheckbox"
        type="selection"
        :selectable="selectInit"
        width="50"
      >
      </el-table-column>

      <template v-for="(item, cd) in tableHeard">
        <el-table-column
          :show-overflow-tooltip="showOverflowTooltip || item.showOverflow"
          :key="cd"
          :prop="item.name"
          :label="item.titleNotT ? item.title : $t(item.title)"
          :width="item.width"
          :sortable="item.sortable"
          v-if="!item.hide"
        >
          <template slot-scope="scope">
            <template v-if="item.type == 'img'">
              <el-image
                v-show="!!scope.row[item.name]"
                style="width: 40px; height: 40px"
                :src="imgurl + scope.row[item.name]"
                :preview-src-list="[imgurl + scope.row[item.name]]"
              >
              </el-image>
            </template>
            <template v-else-if="item.type == 'imgArr'">
              <img
                v-for="(itemImg, key) in scope.row[item.name] || []"
                :key="key"
                :src="imgurl + itemImg"
                width="30"
                height="30"
                class="head_pic"
                alt=" "
              />
            </template>
            <template v-else-if="item.type == 'address'">
              <el-popover
                placement="bottom"
                trigger="hover"
                :content="scope.row[item.name]"
              >
                <el-button
                  slot="reference"
                  type="text"
                  :style="{ color: item.color ? item.color : '#555' }"
                  @click="onAddr(item, scope.row)"
                >
                  {{ getAddrFormat(scope.row[item.name]) }}
                </el-button>
              </el-popover>
            </template>

            <template v-else>
              <slot :name="'table_cell_' + item.name" :row="scope.row">
                <div
                  v-if="!!item.isHtml"
                  v-html="
                    getTableHeard(
                      item.name,
                      scope.row[item.name],
                      scope.row,
                      item
                    )
                  "
                ></div>
                <div v-else>
                  {{
                    getTableHeard(
                      item.name,
                      scope.row[item.name],
                      scope.row,
                      item
                    )
                  }}
                </div>
              </slot>
            </template>
          </template>
        </el-table-column>
      </template>
      <slot name="rightCol">
        <el-table-column
          :label="$t('table.operation')"
          :width="rightBtnColWidth"
          v-if="showRightTools"
        >
          <template slot-scope="scope">
            <slot name="rightToolsCol" :data="scope">
              <slot name="qRight_l" :data="scope"></slot>
              <el-button
                :size="rightBtnSize"
                type="primary"
                icon="el-icon-edit"
                v-show="rightBtnMap['edit']"
                @click="rightTools('edit', scope)"
              />

              &nbsp;
              <slot name="qRight_c" :data="scope"></slot>

              <slot name="qRight_r" :data="scope"></slot>
            </slot>
          </template>
        </el-table-column>
      </slot>
    </el-table>
    <el-pagination
      :page-sizes="[10, 20, 50, 100]"
      v-if="!!tableQuery && showPage"
      class="py-md"
      layout="total,sizes, prev, pager, next"
      @size-change="load"
      @current-change="load"
      :current-page.sync="tableQuery.pageNum"
      :total="tableQuery.total"
      :page-size.sync="tableQuery.pageSize"
      background
    ></el-pagination>
  </div>
</template>

<script>
import tableUtils from "@/utils/table";
import request from "@/tboot/ajax.js";
import utils from "@/utils/utils.js";
export default {
  name: "fTable",
  props: {
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
      type: Number,
      default: 120,
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
  },

  data() {
    const tableQuery = tableUtils.newTableData().query;
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
    load(page) {
      this.tableQuery.pageNum = page || this.tableQuery.pageNum;
      this.$emit("load", this.tableQuery);
    },
    getTableHeard(key, val, row, citem) {
      if (this.tableValsMap[key]) {
        if (typeof this.tableValsMap[key] == "function") {
          val = this.tableValsMap[key](val, row);
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
    setTableQuery(data = {}) {
      //Object.assign(this.tableQuery, data);
      this.tableQuery.pageNum = data.pageNum;
      this.tableQuery.total = data.total;
      this.tableQuery.pageSize = data.pageSize;
    },

    expandChange(row, arrs) {
      this.$emit("expand-change", row, arrs);
    },
    onAddr(item, row) {
      this.$emit("onAddr", item, row);
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
