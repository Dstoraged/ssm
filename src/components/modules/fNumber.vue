<template>
  <el-input
    type="tel"
    :disabled="disabled"
    v-model="dataStr"
    @input="onChangeData"
   @keydown.enter.native="changeData"
    @focus="onFocus($event)"
    @blur="changeData"
    :placeholder="placeholder"
  >
    <template slot="prepend" v-if="!!prepend">
      <slot name="prepend">{{ prepend }}</slot>
    </template>
    <template slot="append" v-if="!!units">
      <div class="appBtn_div" v-if="control"  v-show="!disabled">
        <div role="button" @click="onControl(true)" >
          <i class="el-icon-arrow-up" ></i>
        </div>
        <div role="button" @click="onControl(false)">
          <i class="el-icon-arrow-down"></i>
        </div>
      </div>
      <slot name="units">
        {{ units }}
      </slot>
    </template>
  </el-input>
</template>
<script>
import utils from "@/utils/utils";
import { Decimal } from "decimal.js";
export default {
  name: "fNumber",
  props: {
    control: {
      type: Boolean,
      default: false,
    },
    controlStep: {
      type: [Number, String],
      default: "1",
    },
    placeholder: "",
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [Number, String],
      default: undefined,
    },
    step: {
      type: [Number, String],
      default: "1",
    },
    placeholder: {
      type: String,
      default: "",
    },
    max: [String, Number],
    min: [String, Number],
    units: [String, Number],
    prepend: [String, Number],
    reValType:{
      type:String,
      default:"string"
    }
  },
  data() {
    return {
      timeout: null,
      data: undefined,
      dataStr: "",
    };
  },
  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  },
  methods: {
    onFocus(event) {
      event.currentTarget.select();
    },
    onChangeData() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.timeout = setTimeout(() => {
        this.changeData();
      }, 1000);
    },
    changeData() {
      this.data = this.dataStr;
    },
    getNumberStr(newVal) {
      let valL = "0";
      try {
        valL = utils.weedZero(newVal, this.getPrecision);
      } catch (error) {}

      /* if (valL == "0") {
        return valL;
      }*/

      let stepD = this.getStep;
      let valD = new Decimal(valL || 0);
      let modulo = valD.modulo(stepD);
      if (!modulo.isZero()) {
        valL = utils.weedZero(valD.sub(modulo).toFixed(), this.getPrecision);
      }

      if ((!utils.isEmpty(this.max))&&valD.gt(this.max)) {
        valL = utils.weedZero(this.max, this.getPrecision);
      }

      if ((!utils.isEmpty(this.min))&&valD.lt(this.min)) {
        valL = utils.weedZero(this.min, this.getPrecision);
      }
      return valL;
    },
    onControl(add) {
      let val = new Decimal(this.dataStr || "0");
      if (add) {
        val = val.add(this.controlStep);
      } else {
        val = val.sub(this.controlStep);
      }
      this.dataStr = val.toFixed();
      this.changeData()
    },
  },
  computed: {
    getPrecision() {
     let step= new Decimal(this.step || "0").toFixed();
      let steps = `${step}`.split(".");
      return steps.length > 1 ? steps[steps.length - 1].length : 0;
    },
    getStep() {
      return new Decimal(this.step || "1");
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (this.dataStr !== newVal) {
          this.dataStr = newVal;
          this.changeData();
        }
      },
    },
    data: function (newVal) {
      // this.dataStr = this.getNumberStr(newVal);
      
      this.dataStr = this.getNumberStr(newVal);
      this.data = utils.isEmpty(this.dataStr) ? undefined : this.dataStr;
      let reData=this.data;
     reData= this.reValType=="number"?Number(reData):reData;
      this.$emit("input", reData);
      this.$emit("change", reData);
    },
  },

  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  },
};
</script>
<style scoped>
.appBtn_div {
  position: absolute;
  left: -40px;
  top: 0px;
}
.appBtn_div div {
  text-align: center;
  width: 40px;
  border-radius: 0 4px 0 0;
  border: 1px solid #dcdfe6;
  border-top: 0px;

  height: auto;
  line-height: 19px;
  cursor: pointer;
}

.appBtn_div div:hover {
  background-color: #eee;
}
</style>

