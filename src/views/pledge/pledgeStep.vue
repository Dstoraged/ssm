<template>
  <div class="container-fluid">
    <div class="card" style="">
      <div class="card-body">
        <div>
          <div>
            <div class="model-content">
              <div class="main" v-loading="loading || !$store.getters.deviceOk">
                <div v-if="false" class="pledged_text">
                  {{ $t("messages.norepeatedpledge") }}
                </div>
                <div class="row" style="margin: 0px; padding: 0px">
                  <f-step :steps="steps" :active="active" />

                  <div class="col-md-12">
                    <ol id="iList" style="margin: 0px; padding: 0px">
                      <upload
                        v-if="activeName == 'upload'"
                        @upload="onUpload"
                      />
                      <encapsulation
                        @jumpUpload="jumpUpload"
                        :is-pledge="isPledge"
                        @upSend="upSend"
                        :address="address"
                        v-else-if="activeName == 'encapsulation'"
                        @encapsulation="onEncapsulation"
                      />
                      <not-pledge v-else-if="noPledge"></not-pledge>
                      <pledge
                        @jumpUpload="jumpUpload"
                        v-else-if="activeName == 'pledge'"
                        :is-pledge="isPledge"
                        :datas="form.encapsulation"
                        @pledge="next"
                      />
                      <!-- <b-indaddr
                        :address="address"
                        v-else-if="activeName == 'bindaddr'"
                        @bindaddr="onBindaddr"
                      />-->
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import upload from "@/views/pledge/upload.vue";
import encapsulation from "@/views/pledge/encapsulation.vue";
import pledge from "@/views/pledge/pledge.vue";
import FStep from "./FStep.vue";
import BIndaddr from "./bindaddr.vue";
import notPledge from "./notPledge.vue";
export default {
  components: { upload, encapsulation, BIndaddr, pledge, FStep, notPledge },
  data() {
    return {
      istest: true,
      testingTime: null,
      loading: false,
      pledgeStatus: 6,
      address: "",
      revenue_address: "",
      active: 0,
      activeName: "upload",
      stepMap: {
        upload: 0,
        bindaddr: 1,
        encapsulation: 2,
        pledge: 3,
      },
      steps: [
        { title: "pledge.upkey", name: "upload" },
        { title: "pledge.encapsulation", name: "encapsulation" },
        { title: "pledge.pledge", name: "pledge" },
        // { title: "pledge.bindaddr", name: "bindaddr" },
      ],
      form: {
        encapsulation: {},
      },
    };
  },
  created() {
    this.$emit("upSend");
    this.loadPledge();
  },
  activated() {
    this.loadPledge();
  },
  beforeDestroy() {
    this.testingTime && clearInterval(this.testingTime);
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
          if (re.statusCode == 0) {
            let reObj = re.result || {};
            this.loading = false;
            this.pledgeStatus = reObj.pledgeStatus;
          }

          if (re.statusCode == 1) {
            this.loading = false;
            this.pledgeStatus = 10000;
          }
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    jumpUpload() {
      this.active = 0;
      this.activeName = "upload";
    },
    onUpload(wallet) {
      if (wallet.address) {
        this.address = wallet.address;
        this.next();
      }
    },
    onBindaddr(revenue_address) {
      this.revenue_address = revenue_address;
      this.$router.push("/home");
      //this.next();
    },
    onEncapsulation(data) {
      this.form.encapsulation = Object.assign({}, data);
      this.next();
    },
    next(upSend = true) {
      if (this.active < this.steps.length - 1) {
        this.active++;
        this.activeName = this.steps[this.active].name;
      }
      if (upSend) {
        this.upSend();
      }
    },
    upSend() {
      this.$emit("upSend");
    },
  },
  computed: {
    isPledge() {
      return this.pledgeStatus === 0 || this.pledgeStatus === 7;
    },
    noPledge() {
      return (
        this.pledgeStatus !== 6 &&
        this.pledgeStatus !== 0 &&
        this.pledgeStatus !== 10000
      );
    },
  },
  watch: {
    "$store.getters.deviceAddr": function (newVal) {
      this.loadPledge(newVal);
    },
  },
};
</script>
<style scoped>
.ie_forms_div {
  text-align: center;
}
.ie_forms {
  margin: 0px auto;
  max-width: 600px;
  margin-top: 5pt;
  padding: 20pt 20pt;
  padding-left: 0px;
}
.pledged_text {
  padding: 20%;
  text-align: center;
  font-size: 15pt;
  font-weight: 600;
}
</style>
