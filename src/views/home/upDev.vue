<template>
  <div>
    <div class="card" style="">
      <div class="card-body">
        <div v-if="isPledge" class="pledged_text">
          {{ $t("messages.norepeatedpledgeDev") }}
          <div
            style="
              margin: 0px auto;
              max-width: 500px;
              font-size: 10pt;
              font-weight: 400;
            "
            v-if="$store.getters.deviceAddr"
          >
            {{ $t("pledge.deviceAddressNow") }}
            <el-popover
              placement="bottom"
              trigger="hover"
              :content="$store.getters.deviceAddr"
            >
              <div
                class="overflow"
                slot="reference"
                v-loading="!$store.getters.deviceOk"
              >
                {{ $store.getters.deviceAddr }}
              </div>
            </el-popover>
            <el-form v-if="false">
              <el-form-item
                prop="privateKey"
                class="privateKey_item"
                style="margin-bottom: 0px"
                label-width="130px"
                :label="$t('pledge.deviceAddressNow')"
              >
                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="$store.getters.deviceAddr"
                >
                  <div
                    class="overflow"
                    slot="reference"
                    v-loading="!$store.getters.deviceOk"
                  >
                    {{ $store.getters.deviceAddr }}
                  </div>
                </el-popover>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div v-else-if="stateNo" class="pledged_text">
          {{ $t("messages.notDeviceAddress") }}
          <div style="margin: 0px auto; max-width: 500px; font-size: 10pt">
            {{ typeText }}
          </div>
          {{ $t("pledge.deviceAddressNow") }}
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$store.getters.deviceAddr"
          >
            <div
              class="overflow"
              slot="reference"
              v-loading="!$store.getters.deviceOk"
            >
              {{ $store.getters.deviceAddr }}
            </div>
          </el-popover>
        </div>
        <div class="container-fluid" v-else>
          <div class="card-body">
            <div class="card" style="">
              <upload @upload="upload" :show-jump="false"> </upload>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import upload from "@/views/pledge/upload.vue";
export default {
  components: { upload },
  data() {
    return {
      loading: false,
      isPledge: false,
      DEVUCE_TYPES: window.$config.DEVUCE_TYPES || {},
    };
  },
  created() {
    //this.loadPledge();
  },
  methods: {
    loadPledge(addr) {
      this.loading = true;
      addr = addr || this.$store.getters.deviceAddr;

      if (!addr) {
        if (this.$store.getters.deviceOk) {
          this.loading = false;
        }
        return;
      }

      this.$api.home
        .getStorageSpaceInfo(addr)
        .then((re) => {
          let reObj = re.result || {};
          this.loading = false;
          this.isPledge = reObj.pledgeStatus === 0 || reObj.pledgeStatus === 7;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    upload(w, isOk) {
      if (isOk) {
        this.$notify({
          title: this.$t("comm.success"),
          message: this.$t("pledge.devOk"),
          type: "success",
        });
        this.$router.push("/");
      }
    },
  },
  computed: {
    state() {
      return this.$store.getters.getDevice.utg_status || 0;
    },
    stateNo() {
      if (this.state === 1) {
        return false;
      }
      if (this.state === 3 && !this.$store.getters.getDevice.utg_prikey_exsit) {
        return false;
      }
      return true;
    },
    typeText() {
      return this.$t(this.DEVUCE_TYPES[this.state]);
    },
  },
  watch: {
    "$store.getters.deviceAddr": {
      immediate: true,
      handler(addr) {
        this.loadPledge(addr);
      },
    },
  },
};
</script>
<style scoped>
.pledged_text {
  padding: 5%;
  text-align: center;
  font-size: 15pt;
  font-weight: 600;
}
</style>