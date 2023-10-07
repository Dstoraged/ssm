<template>
  <div v-loading="loading" class="context">
    <transition name="el-fade-in" mode="out-in">
      <migration-step
        v-if="isMigration"
        :page-item="pageItem"
        @upSend="upSend"
      />
      <pledge-step v-else @upSend="upSend" />
    </transition>
  </div>
</template>
<script>
import pledgeStep from "./pledgeStep.vue";
import migrationStep from "./migrationStep.vue";
export default {
  components: { pledgeStep, migrationStep },
  data() {
    return {
      loading: true,
      pageItem: {},
      deviceAddr: "",
    };
  },
  created() {
    this.loadPledge();
  },
  activated() {
    this.loadPledge();
  },
  methods: {
    upSend() {
      this.$emit("upSend");
      console.log("upSend---");
      this.loadPledge();
    },
    loadPledge(addr) {
       console.log("loadPledge---");
      this.loading = true;
      addr = addr || this.$store.getters.deviceAddr;
      if (!addr) return (this.loading = false);
      this.$api.home
        .getStorageSpaceInfo(addr)
        .then((re) => {
          this.loading = false;
          if (re.statusCode == 0) {
            this.pageItem = re.result || {};
          }
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
  },
  computed: {
    isMigration() {
      if (this.pageItem.pledgeStatus !== 0 && this.pageItem.pledgeStatus !== 7)
        return false;
      let dev_status = this.$store.getters.getDevice.utg_status;
      if (
        dev_status === 1 ||
        dev_status === 2 ||
        dev_status === 3 ||
        dev_status === 5
      ) {
        let maxDate =
          this.pageItem.instime + window.$config.migrationMinute * 60000;
        return Date.now() > maxDate;
      }

      return false;
    },
  },
  watch: {
    "$store.getters.deviceAddr": function (newAddr) {
      this.loadPledge();
    },
  },
};
</script>

<style  scoped>
.context {
  min-height: 400px;
}
</style>