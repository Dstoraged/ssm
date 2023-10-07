<template>
    <div class="cels-div">
        <el-form-item size="mini" v-for="(item, tCd) in heards" :key="`default_${tCd}`"
                v-show="!notHeards.includes(item.name)">
                <div class="el-form-item__label" style="font-weight: 700">
                    {{ item.titleNotT ? item.title : $t(item.title) }}
                </div>


                <template v-if="!!item.popover">
                    <el-popover placement="bottom" trigger="hover" :content="dataItem[item.name]">
                        <span slot="reference">
                            {{
                                getTableHeard(
                                    item.name,
                                    dataItem[item.name],
                                    dataItem,
                                    item
                                )
                            }}</span>
                    </el-popover>
                </template>
                <div v-else-if="!!item.isHtml" v-html="getTableHeard(
                    item.name,
                    dataItem[item.name],
                    dataItem,
                    item
                )
                    "></div>

                <div v-else>
                    {{
                        getTableHeard(
                            item.name,
                            dataItem[item.name],
                            dataItem,
                            item
                        )
                    }}
                </div>
            </el-form-item>
    </div>
</template>
<script>
import utils from "@/utils/utils.js";

export default {
    components: {},
    props: {
        heards: {
            type: Array,
            default() {
                return []
            }
        },
        notHeards: {
            type: Array,
            default() {
                return []
            }
        },
        dataItem: {
            type: Object,
            default() {
                return null
            }
        }
    },
    data() {
        return { tableValsMap: {} }
    },
    methods: {
        getAddrFormat(val, num = 10) {
            if (val && val.length <= num) {
                return val;
            }
            return utils.getAddrFormat(val, num);
        },
        getTableValsMap() {
            var map = {};
            this.heards.forEach((element) => {
                if (element.valMap) {
                    map[element.name] = element.valMap;
                }

            });
            return map;
        },
        getTableHeard(key, val, row, citem, fnum = 10) {
            if (this.tableValsMap[key]) {
                if (typeof this.tableValsMap[key] == "function") {
                    val = this.tableValsMap[key](val, row, citem);
                } else {
                    val = this.tableValsMap[key][val];
                }
            }

            if (citem.format) {
                fnum = citem.fnum || fnum;
                val = this.getAddrFormat(val, fnum);
            }


            if (citem.type == "time") {
                val = this.formatTime(val);
            }

            if (citem.type == "timimg") {
                val = this.formatTimimg(val);
            }

            if (citem.valT) {
                val = this.$t(val);
            }

            if (!utils.isEmpty(val) && !utils.isEmpty(citem.units)) {
                val += "" + citem.units;
            }
            return val;
        },
    },
    watch: {
        heards: {
            immediate: true,
            handler: function () {
                //newV, oldV
                this.tableValsMap = this.getTableValsMap();
            },
        },
    }
};

</script>
<style scoped>
.cels-div {
    border-left: solid 0px orange;
}
</style>