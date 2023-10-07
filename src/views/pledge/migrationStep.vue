<template>
  <div class="container-fluid">
    <div class="card" style="">
      <div class="card-body">
        <div>
          <div>
            <div class="model-content">
              <div class="main" v-loading="loading">
                <f-step :steps="steps" :active="active" />
                <transition name="el-fade-in" mode="out-in">
                  <upload
                    v-if="active == 0"
                    @upload="onUpload"
                    :auto-next="true"
                    :show-jump="true"
                  />
                  <encapsulation
                    v-else-if="active == 1"
                    @jumpUpload="jumpUpload"
                    :is-pledge="true"
                    @upSend="upSend"
                    :address="$store.getters.deviceAddr"
                    :ancestorNode="pageItem"
                    @encapsulation="onEncapsulation"
                    :autoJump="enAutoJump"
                  />
                  <migration v-else  :ancestorNode="pageItem"/>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script >
import encapsulation from "./encapsulation.vue";
import FStep from "./FStep.vue";
import upload from "./upload.vue";
import utils from "@/utils/utils.js";
import migration from "./migration.vue";
export default {
  components: { encapsulation, FStep, upload, migration },
  props: {
    pageItem: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      loading: false,
      active: 0,
      steps: [
        { title: "pledge.upkey", name: "upload" },
        { title: "pledge.encapsulation", name: "encapsulation" },
        { title: "newManage.migration", name: "move" },
        // { title: "pledge.bindaddr", name: "bindaddr" },
      ],
    };
  },
  methods: {
    jumpUpload() {
      this.upStep(0);
    },
    upSend() {
      this.$emit("upSend");
    },
    onEncapsulation() {
      this.upSend();
      this.upStep();
    },
    onUpload() {
      this.upSend();
      this.upStep();
    },
    upStep(setNum) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        if (utils.isEmpty(setNum)) {
          this.active++;
        } else {
          this.active = setNum;
        }
      }, 1000);
    },
  },
  created(){
     this.$emit("upSend");
  },
  computed:{
    enAutoJump(){
      let dev_status = this.$store.getters.getDevice.utg_status;
      return dev_status!=1&&dev_status!=2
    }
  },
  mounted() {},
  watch: {},
};
</script>