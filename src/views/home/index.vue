<template>
  <div>
    <div class="container-fluid">
      <div class="top_context">
        <div class="card" style="">
          <div class="card-body">
            <div class="media-body align-self-center">
              <f-elrow
                :titles="basics"
                :col-width="24"
                :title-width="$i18n.locale == 'en' ? '90pt' : '80pt'"
                ref="top_felrow"
              >
                <el-popover
                  placement="bottom"
                  trigger="click"
                  :content="localItem.url"
                  slot="colData_url"
                >
                  <div class="overflow" slot="reference">
                    {{ localItem.url || "----:--" }}
                  </div>
                </el-popover>

                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="$store.getters.deviceAddr"
                  slot="colData_dev_addr"
                >
                  <div
                    class="overflow"
                    slot="reference"
                    v-loading="!$store.getters.deviceOk"
                  >
                    <span
                      type="text"
                      @click="upDev"
                      :style="{
                        color: upkeyd ? '#23cbe0' : 'orange',
                        cursor: 'pointer',
                      }"
                    >
                      <i
                        :class="
                          upkeyd
                            ? 'el-icon-edit-outline'
                            : 'el-icon-warning-outline'
                        "
                      ></i>
                      {{
                        getAddrFormat($store.getters.deviceAddr) ||
                        $t("pledge.upkey")
                      }}
                    </span>
                  </div>
                </el-popover>

                <el-popover
                  placement="bottom"
                  trigger="hover"
                  :content="revenue_address"
                  slot="colData_rev_addr"
                >
                  <div
                    @click="bindaddr"
                    slot="reference"
                    class="overflow"
                    v-loading="revenue_loading || !$store.getters.deviceOk"
                    :style="
                      $store.getters.deviceAddr
                        ? 'color: #23cbe0; cursor: pointer'
                        : ''
                    "
                  >
                    <i
                      class="el-icon-edit-outline"
                      v-show="$store.getters.deviceAddr"
                    ></i>

                    {{
                      getAddrFormat(revenue_address) ||
                      ($store.getters.deviceAddr
                        ? $t("pledge.bindaddr")
                        : "-----")
                    }}
                  </div>
                </el-popover>

                <template slot="colData_upimgOrUrl">
                  <el-popover
                    placement="bottom"
                    trigger="hover"
                    style="margin-right: 10px"
                    v-if="pledgeData.attachPic || pledgeData.attachText"
                  >
                    <el-button
                      type="text"
                      slot="reference"
                      style="padding: 0px"
                    >
                      <van-icon name="share" />
                    </el-button>
                    <div style="maring: 5px; text-align: center">
                      <img
                        v-show="pledgeData.attachPic"
                        wdith="150px"
                        height="150px"
                        :src="pledgeData.attachPic"
                      /><br />
                      <em type="text">{{ pledgeData.attachText }}</em>
                    </div>
                  </el-popover>

                  <el-popover
                    placement="bottom"
                    trigger="hover"
                    style="margin-right: 10px"
                    v-else
                  >
                    <el-button
                      type="text"
                      slot="reference"
                      style="color: red; padding: 0px"
                    >
                      <van-icon name="warning-o" />
                    </el-button>
                    <div style="maring: 5px; text-align: center; color: red">
                      {{ $t("market.noLink") }}
                    </div>
                  </el-popover>

                  <el-button
                    v-if="$store.getters.deviceAddr"
                    style="margin-right: 5px; padding: 0px"
                    type="text"
                    :title="$t('market.uploadLink')"
                    icon="el-icon-setting"
                    size="mini"
                    @click="uploadImg"
                    >{{ $t("market.configure") }}</el-button
                  >
                </template>

                <div
                  slot="colData_dev_state"
                  class="overflow"
                  v-loading="!$store.getters.deviceOk"
                  :style="{ color: stateTypeItem.color }"
                >
                  {{ stateTypeItem.title ? $t(stateTypeItem.title) : "" }}
                </div>
              </f-elrow>
              <van-button
                size="mini"
                type="danger"
                @click="onUnbind"
                v-if="revenue_address"
                >{{ $t("home.unbind") }}</van-button
              >
            </div>
          </div>
        </div>
        <div class="card" style="">
          <div class="card-body">
            <h5 style="margin: 0 0 0px 0">CPU</h5>
            <span style="margin: 0 0 10px 0"
              >{{ $t("comm.utilization") }}(%)</span
            >
            <div
              class="media"
              style="
                display: -webkit-flex;
                display: flex;
                -webkit-align-items: center;
                align-items: center;
                -webkit-justify-content: center;
                justify-content: center; //padding:0 0 20px 0;
              "
            >
              <img class="d-flex mr-3" :src="imgs.iconCpu" />
              <div class="media-body align-self-center">
                <h4 class="font-26 m-1">
                  {{ dataFormat(divData.cpu, "%") }}
                </h4>
                <h4 class="font-16 m-1">
                  <div class="progress progress-mini">
                    <div
                      class="progress-bar progress-bar-info"
                      role="progressbar"
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      :style="'width: ' + (divData.cpu || 0) + '%'"
                    ></div>
                  </div>
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="">
          <div class="card-body">
            <h5 style="margin: 0 0 0px 0">{{ $t("home.memoryUsage") }}</h5>
            <span style="margin: 0 0 10px 0"
              >{{ $t("comm.utilization") }}(%)</span
            >
            <div
              class="media"
              style="
                display: -webkit-flex;
                display: flex;
                -webkit-align-items: center;
                align-items: center;
                -webkit-justify-content: center;
                justify-content: center; //padding:0 0 20px 0;
              "
            >
              <img class="d-flex mr-3" :src="imgs.iconRam" />
              <div class="media-body align-self-center">
                <h4 class="font-26 m-1">
                  {{ dataFormat(divData.mem, "%") }}
                </h4>
                <h4 class="font-16 m-1">
                  <div class="progress progress-mini">
                    <div
                      class="progress-bar progress-bar-info"
                      role="progressbar"
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      :style="'width: ' + (divData.mem || 0) + '%'"
                    ></div>
                  </div>
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wrapper">
      <div class="container-fluid">
        <div class="top_context">
          <div class="card" v-show="false">
            <div class="card-body">
              <h5 style="margin: 0 0 20px 0">
                {{ $t("home.storageSpace") }}
              </h5>

              <ul class="list-inline widget-chart mt-4 mb-3 text-center">
                <li class="list-inline-item">
                  <h5>{{ volume_total }}{{ ` ${$IEDATA.capacity}` }}</h5>
                  <p class="text-muted">{{ $t("home.total") }}</p>
                </li>
                <li class="list-inline-item">
                  <h5>{{ utg_volume }}{{ $IEDATA.capacity }}</h5>
                  <p class="text-muted">{{ $t("home.encapsulated") }}</p>
                </li>

                <li class="list-inline-item">
                  <h5>{{ volume }}{{ $IEDATA.capacity }}</h5>
                  <p class="text-muted">{{ $t("home.remainingSpace") }}</p>
                </li>
              </ul>

              <div
                id="simple-pie"
                class="ct-chart ct-golden-section simple-pie-chart-chartist"
              >
                <ve-pie
                  height="300px"
                  :data="chartData"
                  :extend="chartExtend"
                  :settings="chartSettings"
                ></ve-pie>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <h5 style="margin: 0 0 20px 0; float: left">
                {{ $t("home.pledgeStatus") }}
              </h5>
              <el-button
                style="float: right"
                size="mini"
                type="primary"
                :disabled="$store.getters.getDevice.utg_status != 8"
                @click="onresetSpace"
              >
                {{ $t("home.resetSpace") }}</el-button
              >
              <div v-if="showMakeUp" style="color: orange; font-size: 12px">
                <van-notice-bar
                  @click="onMakeUp"
                  class="cursor"
                  color="red"
                  background="#fff"
                  :delay="1"
                  left-icon="volume-o"
                  :text="$t('messages.spaceTimeDestroyed')"
                />
              </div>
              <div
                v-for="(item, cd) in pledges"
                :key="cd"
                :class="['pledge_dev', isClick(item) ? 'cursor' : '']"
                :style="isClick(item) ? 'color:#23cbe0;' : ''"
                @click="isClick(item) ? onPledgeI(item) : null"
                v-show="
                  !item.hidden && (pledgeOK || item.name == 'pledgeStatus')
                "
                v-loading="item.name == 'pledgeStatus' && pledgeLoading"
              >
                <div
                  class="pledge_label overflow"
                  :style="`width:${pledgeWidth}`"
                >
                  <el-popover
                    placement="right"
                    trigger="hover"
                    :content="$t(item.label)"
                  >
                    <span slot="reference">
                      {{ $t(item.label) }}
                    </span>
                  </el-popover>
                </div>

                <div
                  :style="{
                    width: `calc(100% - ${pledgeWidth})`,
                    color: getDataColor(item, pledgeData),
                  }"
                  :class="['overflow', item.class || 'pledge_text']"
                >
                  <template v-if="item.tooltip">
                    <el-popover
                      placement="left"
                      trigger="hover"
                      :content="getDataVal(item, pledgeData)"
                    >
                      <span slot="reference">
                        <i
                          v-if="isClick(item)"
                          :class="item.icon || 'el-icon-edit-outline'"
                        ></i>
                        {{ getDataVal(item, pledgeData, false) }}</span
                      >
                    </el-popover>
                  </template>
                  <template v-else>
                    {{ getDataVal(item, pledgeData) }}
                  </template>
                </div>
                <div
                  v-if="item.name == 'bwSize' && showMakeUp"
                  class="bwSize_btns"
                >
                  <div class="button_group_div">
                    <el-popover
                      placement="top"
                      trigger="hover"
                      :content="$t('messages.bandwidthChangeMsg')"
                    >
                      <van-icon
                        slot="reference"
                        name="question-o"
                        class="button_group_warning"
                      />
                    </el-popover>
                    <el-button type="text" @click="adjustBandwidth">{{
                      $t("home.adjustTitle")
                    }}</el-button>
                  </div>
                  <div class="button_group_div" v-if="showOriginalBtn">
                    <el-popover
                      placement="top"
                      trigger="hover"
                      :content="$t('messages.bandwidthAppendMsg')"
                    >
                      <van-icon
                        slot="reference"
                        name="question-o"
                        class="button_group_warning"
                      />
                    </el-popover>
                    <el-popover
                      placement="bottom"
                      trigger="hover"
                      :content="$t('home.confirmOriginal')"
                      slot="reference"
                    >
                      <el-button
                        type="text"
                        slot="reference"
                        @click="onMakeUp"
                        >{{ $t("home.confirmBandwidth") }}</el-button
                      >
                    </el-popover>
                  </div>
                </div>
              </div>

              <div class="pledge_btns" v-loading="revenue_loading">
                <van-button
                  type="primary"
                  v-show="pledgeOK"
                  size="small"
                  @click="onSubmitValidation"
                  :disabled="nowVaildStatus"
                >
                  <i class="el-icon-s-check" />{{ $t("home.spaceTimeProve") }}
                </van-button>
                <van-button
                  type="danger"
                  v-show="pledgeOK"
                  @click="quitPledge"
                  :disabled="!snJoinSpday()"
                  size="small"
                >
                  <i class="el-icon-delete" />
                  {{ $t("comm.withdrawalPledge") }}
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-dialog
      :title="$t(win.title)"
      v-model="win.show"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
      confirm-button-color="rgb(51, 143, 248)"
      cancel-button-color="red"
      :close-on-click-overlay="false"
      :lock-scroll="false"
      :close-on-popstate="true"
    >
      <div
        style="padding-left: 15px; padding-right: 15px"
        class="dialog_update_div"
      >
        <el-form
          :rules="win.rules"
          :model="win.data"
          ref="wind_Form"
          label-width="0px"
          label-position="left"
        >
          <template v-if="win.action == 'dayPrice'">
            <el-form-item
              prop="dayPrice"
              v-loading="win.loading || win.numberLoading"
            >
              <div style="text-align: center">
                {{ `${getDayPriceMin}~${getDayPriceMax}` }}
              </div>
              <f-number
                :step="dayPriceAccuracy"
                v-model="win.data.dayPrice"
                :min="getDayPriceMin"
                :max="getDayPriceMax"
                reValType="number"
                :control="true"
                :control-step="getDayPriceMin"
                :placeholder="`<=${getDayPriceMax}`"
                :units="`${$IEDATA.currency} / 1${$IEDATA.capacity}·${$t(
                  'comm.day'
                )}`"
              />
              <el-slider
                v-if="!win.numberLoading"
                v-model="win.data.dayPrice"
                :step="getDayPriceMinNum"
                :tooltip="false"
                :show-tooltip="false"
                :min="getDayPriceMinNum"
                :max="getDayPriceMaxNum"
              />
            </el-form-item>
          </template>
          <template v-else-if="win.action == 'bwSize'">
            <el-form-item label-width="0px" prop="bwSize">
              <f-number
                :style="`min-width: 180px; max-width: calc(100% - ${
                  $i18n.locale == 'zh' ? '75px' : '0px'
                })`"
                v-model="win.data.bwSize"
                :step="1"
                reValType="number"
                :control="true"
                :control-step="10"
                :min="20"
                :max="9999"
                units="Mbps"
                :disabled="!win.clickSpeed"
              />
              <el-button
                type="text"
                @click="testNetwork"
                style="margin-left: 8px"
                >{{ $t("messages.BandwidthTest") }}</el-button
              >
              <div
                style="
                  color: orange;
                  line-height: 20px;
                  text-align: left;
                  font-size: 14px;
                "
                v-if="!win.clickSpeed"
              >
                {{ $t("messages.pleaseclickTest") }}

                <!-- {{ $t("messages.pleaseSlashed") }}
              <el-button type="text" @click="testNetwork">{{
                $t("messages.BandwidthTest")
              }}</el-button>-->
              </div>
              <el-slider
                v-show="win.clickSpeed"
                v-model="win.data.bwSize"
                :step="1"
                :tooltip="false"
                :show-tooltip="false"
                :min="20"
                :max="9999"
                :disabled="!win.clickSpeed"
              />
            </el-form-item>
            <el-form-item
              :label="$t('home.estimatedAddition')"
              size="mini"
              v-loading="win.priceLoading"
              label-width="150px"
            >
              <span style="font-weight: 600">
                {{ `${win.data.price} ${$IEDATA.suffix}` }}</span
              >
            </el-form-item>
            <el-form-item
              :label="$t('home.pledgedAmount')"
              size="mini"
              label-width="150px"
            >
              {{ `${pledgedAmount} ${$IEDATA.suffix}` }}
            </el-form-item>

            <el-form-item
              :label="$t('pledge.bandwidthCoefficient')"
              size="mini"
              v-loading="win.priceLoading"
              label-width="150px"
            >
              {{ bandwidthVal }}
            </el-form-item>
          </template>
          <template v-if="win.action == 'entrustRate'">
            <el-form-item
              prop="entrustRate"
              v-loading="win.loading || win.entrustRateLoading"
            >
              <div style="text-align: center">0~100</div>
              <f-number
                :step="dayPriceAccuracy"
                v-model="win.data.entrustRate"
                min="0"
                max="100"
                reValType="number"
                :control="true"
                control-step="1"
                placeholder="0~100"
                units=" %"
              />
              <el-slider
                v-if="!win.entrustRateLoading"
                v-model="win.data.entrustRate"
                :step="1"
                :tooltip="false"
                :show-tooltip="false"
                :min="0"
                :max="100"
              />
            </el-form-item>
          </template>
          <template v-if="win.action == 'havAmount'">
            <el-form-item
              prop="havAmount"
              v-loading="win.loading || win.havAmountLoading"
            >
              <div style="text-align: center">
                {{ toPrice(pledgeData.havAmount) }}+(0~{{ pledgeMax }})
              </div>
              <f-number
                :step="dayPriceAccuracy"
                v-model="win.data.havAmount"
                :min="0"
                :max="pledgeMax"
                reValType="number"
                :control="true"
                control-step="1"
                :placeholder="`0~${pledgeMax}`"
                :units="$IEDATA.suffix"
              />
              <el-slider
                v-if="!win.havAmountLoading"
                v-model="win.data.havAmount"
                :step="1"
                :tooltip="false"
                :show-tooltip="false"
                :min="0"
                :max="pledgeMax"
              />
            </el-form-item>
          </template>
        </el-form>
      </div>
      <div class="van-hairline--top van-dialog__footer" v-loading="win.loading">
        <button
          @click="win.show = false"
          class="van-button van-button--default van-button--large van-dialog__cancel"
          style="color: red"
        >
          <div class="van-button__content">
            <span class="van-button__text">{{ $t("messages.cancel") }}</span>
          </div>
        </button>

        <button
          :disabled="!win.clickSpeed"
          @click="onWinSub"
          class="van-button van-button--default van-button--large van-dialog__confirm van-hairline--left"
          :style="{ color: win.clickSpeed ? 'rgb(51, 143, 248)' : '#eee' }"
        >
          <div class="van-button__content">
            <span class="van-button__text">{{ $t("messages.confirm") }}</span>
          </div>
        </button>
      </div>
    </van-dialog>

    <van-dialog
      v-model="makeUpWin.show"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-confirm-button="false"
      :show-cancel-button="false"
      confirm-button-color="rgb(51, 143, 248)"
      cancel-button-color="red"
      :close-on-click-overlay="false"
      :lock-scroll="false"
      :confirm-button-text="$t('messages.nowMakeUp')"
      :cancel-button-text="$t('loadingSubPan.close')"
      @cancel="closeMakeUpWin"
      @confirm="onMakeUp"
      :close-on-popstate="true"
    >
      <h5 style="text-align: center">{{ $t(makeUpWin.title) }}</h5>
      <div style="color: orange; font-size: 14px; padding: 10px">
        {{ $t("messages.spaceTimeDestroyed") }}
      </div>
      <div class="win_button_groups">
        <div class="button_group">
          <el-button type="text" @click="adjustBandwidth">{{
            $t("home.adjustTitle")
          }}</el-button>
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$t('messages.bandwidthChangeMsg')"
            class="button_group_warning_dialog"
          >
            <van-icon slot="reference" name="question-o" />
          </el-popover>
        </div>
        <div class="button_group" v-if="showOriginalBtn">
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$t('home.confirmOriginal')"
          >
            <el-button type="text" slot="reference" @click="onMakeUp">{{
              $t("home.confirmBandwidth")
            }}</el-button>
          </el-popover>
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$t('messages.bandwidthAppendMsg')"
            class="button_group_warning_dialog"
          >
            <van-icon slot="reference" name="question-o" />
          </el-popover>
        </div>
        <div class="button_group">
          <el-button type="text" style="color: #333" @click="closeMakeUpWin">{{
            $t("home.allselections")
          }}</el-button>
          <el-popover
            placement="bottom"
            trigger="hover"
            :content="$t('messages.bandwidthIgnoreMsg')"
          >
            <van-icon
              slot="reference"
              name="question-o"
              class="button_group_warning_dialog"
            />
          </el-popover>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import utils from "@/utils/utils";
import fElrow from "@/components/modules/Felrow.vue";
import { createWebsocket } from "@/utils/websocket.js";
import webSdk from "@/utils/webSdk";

import VePie from "v-charts/lib/pie.common";
import iconCpu from "@/assets/images/icon_cpu.png";
import iconRam from "@/assets/images/icon_ram.png";
import iconTime from "@/assets/images/icon_time.png";
import { Dialog } from "vant";
import localstorage from "@/utils/localstorage.js";
import FNumber from "@/components/modules/fNumber.vue";
import { Decimal } from "decimal.js";
import { Toast } from "vant";
export default {
  components: { fElrow, VePie, FNumber },
  data() {
    let _this_ = this;
    let MODUL_SWHITCH = window.$config.MODUL_SWHITCH;
    return {
      MODUL_SWHITCH,
      imgs: { iconCpu, iconRam, iconTime },
      localItem: {},
      socket: null,
      socket_validation: null,
      socket_resetSpace: null,
      loadTime: null,
      pledgeLoading: false,
      basics: [
        {
          title: "home.serverAddress",
          name: "url",
        },
        {
          title: "home.serverAccount",
          name: "dev_addr",
        },
        {
          title: "home.revenueAccount",
          name: "rev_addr",
        },
        {
          title: "market.linkAddress",
          name: "upimgOrUrl",
        },
        {
          title: "home.deviceState",
          name: "dev_state",
        },
      ],
      revenue_address: "",
      revenue_loading: false,
      pledgeType: {
        10000: { label: "comm.waitingPledge", color: "#333" },
        0: { label: "comm.pledged", color: "#3ea2ff" },
        1: { label: "comm.withdrawalPledge", color: "red" },
        5: { label: "comm.removing", color: "#888" },
        6: { label: "comm.pledgeReturned", color: "#888" },
        7: { label: "comm.inactive", color: "red" },
      },
      pledges: [
        {
          label: "home.status",
          name: "pledgeStatus",
          class: "pledge_status",
          type: "pledgeStatus",
          tooltip: true,
        },
        {
          label: "lock.pledgeAddress",
          name: "pledgeAddr",
          type: "Address",
          tooltip: true,
        },
        {
          label: "newManage.managedAccount",
          name: "managerAddr",
          type: "Address",
          isClick: true,
          tooltip: true,
        },
        {
          label: "newManage.owningStoragePool",
          name: "spHash",
          type: "Address",
          isClick: true,
          tooltip: true,
        },
        {
          label: "home.pledgeAmount",
          name: "pledgeAmount",
          tooltip: true,
          type: "pledgeAmount",
          suffix: _this_.$IEDATA.suffix,
        },
        {
          label: "newManage.amountPledged",
          name: "havAmount",
          tooltip: true,
          type: "pledgeAmount",
          isClick: true,
          suffix: _this_.$IEDATA.suffix,
        },
        {
          label: "home.pledgeCapacity",
          name: "declareSpace",
          type: "storage",
          //suffix: _this_.$IEDATA.capacity,
          tooltip: true,
        },
        {
          label: "newManage.rewardRatio",
          name: "entrustRate",
          tooltip: true,
          //  type: "pledgeAmount",
          isClick: true,
          suffix: " %",
        },
        {
          label: "pledge.serverBandwidth",
          name: "bwSize",
          type: "bwSize",
          suffix: "Mbps",
          isClick: MODUL_SWHITCH.edit_bandwidth,
          tooltip: true,
        },

        {
          label: "home.spacealready",
          name: "spacealready",
          type: "storage",
          //  suffix: _this_.$IEDATA.capacity,
          hidden: !MODUL_SWHITCH.show_rent,
          tooltip: true,
        },

        {
          label: "home.rentableSpace",
          name: "freeSpace",
          type: "storage",
          //  suffix: _this_.$IEDATA.capacity,
          tooltip: true,
          hidden: !MODUL_SWHITCH.show_rent,
        },
        {
          label: "pledge.rentalPrice",
          isClick: true,
          name: "rentPrice",
          suffixFun: () => {
            return `${_this_.$IEDATA.currency}/1${
              _this_.$IEDATA.capacity
            }·${_this_.$t("table.days")}`;
          },
          type: "price",
          tooltip: true,
          hidden: !MODUL_SWHITCH.show_rent,
        },
        {
          label: "home.rentalIncome",
          name: "rentAmount",
          suffix: _this_.$IEDATA.suffix,
          type: "price",
          tooltip: true,
          profit: true,
          isClick: true,
          icon: "el-icon-view",
          hidden: !MODUL_SWHITCH.show_rent,
        },
        {
          label: "home.spaceIncome",
          name: "storageAmount",
          suffix: _this_.$IEDATA.suffix,
          type: "price",
          tooltip: true,
          profit: true,
          isClick: true,
          icon: "el-icon-view",
        },

        {
          label: "home.totalRevenue",
          name: "totalAmount",
          suffix: _this_.$IEDATA.suffix,
          type: "price",
          tooltip: true,
          profit: true,
          hidden: !MODUL_SWHITCH.show_rent,
        },

        {
          label: "home.pledgeTime",
          name: "instime",
          type: "time",
          tooltip: true,
        },
        {
          label: "home.Lastinspection",
          name: "vaild24Status",
          type: "vaildStatus",
          tooltip: true,
        },
        {
          label: "home.InspectionProgress",
          name: "vaildProgress",
          type: "progress",
          tooltip: true,
        },
        /* {
          label: "home.spaceTimeProve",
          name: "vaildStatus",
          type: "vaildStatus",
          tooltip: true,
        },*/
        {
          label: "home.vaildTime",
          name: "vaildTime",
          type: "time",
          tooltip: true,
        },
      ],
      pledgeData: {},
      divData: {},
      chartExtend: {
        color: ["#26A0DA", "#ACACAC"],
        legend: {
          left: "5px",
          orient: "vertical",
          show: true,
          /* formatter: (vitem) => {
            return _this_.$t(vitem);
          },*/
        },
        /* tooltip: {
          formatter: (vitem) => {
            return `${vitem.marker} ${_this_.$t(vitem.name)} : ${
              vitem.percent
            }% (${vitem.value} ${_this_.$IEDATA.capacity})`;
          },
        },*/
      },
      chartSettings: {
        type: "pie",
        offsetY: 160,
        radius: 120,
        labelLine: { show: false, length: "0px" },
        label: {
          position: "inside",
          formatter: "{d}%",
          color: "#fff",
          fontWeight: "bolder",
          fontStyle: "italic",
          fontSize: "18px",
        },
      },
      configListW: [],
      win: {
        show: false,
        clickSpeed: false,
        title: "",
        action: "",
        loading: false,
        numberLoading: false,
        priceLoading: false,
        entrustRateLoading: false,
        havAmountLoading: false,
        data: {
          dayPrice: 0,
          bwSize: 20,
          price: "",
          entrustRate: 0,
          havAmount: 0,
        },
        rules: {
          dayPrice: [
            {
              validator: (rule, value, callback) => {
                if (value > 0) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.notAvailable")));
                }
              },
              trigger: "change",
            },
          ],
          bwSize: [
            {
              validator: (rule, value, callback) => {
                /*  if (value == _this_.pledgeData.bwSize) {
                  callback(
                    new Error(_this_.$t("messages.pleaseOriginalBandwidth"))
                  );
                  return;
                }*/

                if (value > 0) {
                  callback();
                } else {
                  callback(new Error(_this_.$t("messages.notAvailable")));
                }
              },
              trigger: "change",
            },
          ],
        },
      },
      makeUpWin: {
        show: false,
        title: "comm.tips",
      },
      properts: {},
      errors: window.$config.ERROR_TYPES,
      vaildStatusTypes: {
        1: { label: "comm.success", color: "#3ea2ff" },
        0: { label: "comm.fail", color: "red" },

        // 2: { label: "comm.fail", color: "red" },
      },
      stateType: {
        1: { title: "comm.WaitingEncapsulation", color: "#888" },
        2: { title: "comm.capacityEncapsulation", color: "#888" },
        3: { title: "comm.capacityCompleted", color: "#888" },
        4: { title: "comm.capacityEncapsulation", color: "#888" },
        5: { title: "comm.normalService", color: "#888" },
        6: { title: "comm.reclaimingCapacity", color: "#888" },
        7: { title: "comm.unpacking", color: "#888" },
        8: { title: "comm.withdrawalPledge", color: "#888" },
      },
    };
  },
  created() {
    this.inits();

    this.loadTime = setInterval(() => {
      utils.loadGlobalDatas().then(() => {
        utils.getNowHeight().then(() => {
          this.loadPledge();
          this.loadRevenue();
        });
      });
    }, 30000);
  },
  mounted() {
    this.$emit("upSend");
  },
  activated() {
    this.$emit("upSend");
  },
  beforeDestroy() {
    this.socket && this.socket.closeSocket();
    this.socket_validation && this.socket_validation.closeSocket();
    this.socket_resetSpace && this.socket_resetSpace.closeSocket();
    this.loadTime && clearTimeout(this.loadTime) && (this.loadTime = null);
  },
  activated() {
    this.socket && this.socket.sendWSPush({}, 9, true);
    this.loadPledge();
    this.loadRevenue();
  },
  methods: {
    inits() {
      utils.loadGlobalDatas().then(() => {
        utils.getNowHeight().then(() => {
          this.loadPledge();
          this.loadRevenue();
        });
      });

      this.localItem = localstorage.getTicket(this);

      let autofun = {
        onopen: () => {
          this.socket.sendPing({
            time: 40000,
            message: {},
            cmd: 9,
            setTicket: true,
            cd: 0,
          });
        },
        onmessage: (data) => {
          if (data.cmd == 9) {
            //  data.volume = utils.storage(data.volume, "g-g");
            this.divData = data;
          }
        },
      };
      if (this.socket) {
        this.socket.init();
      } else {
        this.socket = createWebsocket("devicectl", autofun);
      }
    },

    loadRevenue(addr) {
      addr = addr || this.$store.getters.deviceAddr;
      if (!addr) {
        return;
      }
      this.revenue_loading = true;
      addr = webSdk.sdkUtils.hashToNX(addr);
      this.$api.consoleApi
        .getMiner(addr)
        .then((re) => {
          re = re.result || {};
          this.revenue_address = re.revenue_address;
          this.revenue_loading = false;
        })
        .catch(() => {
          this.revenue_address = "";
        });
    },
    loadPledge(addr) {
      addr = addr || this.$store.getters.deviceAddr;

      if (!addr) return;
      this.pledgeLoading = true;
      utils.getNowHeight().then((re) => {
        this.$api.home
          .getStorageSpaceInfo(addr)
          .then((re) => {
            let statusCode = re.statusCode;
            if (statusCode === 0) {
              this.pledgeLoading = false;
              let result = re.result || {};
              //DOTO--
              // result.prepledgeAmount=8888888888888888888888888;
              result.entrustRate = result.entrustRate || 0;
              this.pledgeData = result;
            }
            if (statusCode === 1) {
              this.pledgeData = { pledgeStatus: 10000 };
              this.pledgeLoading = false;
            }
            if (this.showMakeUp && this.makeUpNotice()) {
              this.makeUpWin.show = true;
            }
          })
          .catch((err) => {
            console.log("error", err);
          });
      });
    },

    onSubmitValidation() {
      Dialog.confirm({
        title: this.$t("home.spaceTimeProve"),
        message: this.$t("messages.submitProve"),
        cancelButtonText: `${this.$t("table.cancel")}`,
        confirmButtonText: `${this.$t("table.confirm")}`,
      })
        .then(() => {
          // on confirm
          this.submitValidation();
        })
        .catch(() => {
          // on cancel
        });
    },
    submitValidation() {
      let autofun = {
        onopen: () => {
          this.socket_validation.sendPing({
            //DOTO--
            message: { poc_type: 6 }, //4
            cmd: 12,
            setTicket: true,
            cd: 0,
          });
        },
        onmessage: (data) => {
          if (data.cmd == 12) {
            this.$notify({
              message: this.$t("messages.spaceMessageSent"),
              type: "success",
            });
            this.socket_validation.closeSocket();
          }
        },
        onerror: () => {
          this.socket_validation.closeSocket();
        },
      };
      if (this.socket_validation) {
        this.socket_validation.init();
      } else {
        this.socket_validation = createWebsocket("devicectl", autofun);
      }
    },
    getAddrFormat(val, num) {
      num = num ? num : utils.isMobile() ? 8 : 12;
      return utils.getAddrFormat(val, num);
    },
    passwordReset() {
      this.$router.push("/passwordReset");
    },
    dataFormat(val, fix) {
      val = utils.isEmpty(val) ? "--" : val;
      return `${val}${fix}`;
    },
    getDataColor(item, datas) {
      let name = item.name;
      let valL = datas[name];

      /*  if (utils.isEmpty(valL)) {
        return "";
      }*/
      switch (item.type) {
        case "vaildStatus":
          let itemL = this.vaildStatusTypes[valL];
          if (itemL) {
            return itemL.color;
          } else {
            return "";
          }

        case "pledgeStatus":
          let typeItem = this.pledgeType[valL] || {};
          return typeItem.color || "";
        case "bwSize":
          return this.showMakeUp ? "red" : "";
        default:
          return "";
      }
    },
    toPrice(val, num = 8) {
      return utils.price(val || 0, num);
    },

    getDataVal(item, datas, all = true) {
      let name = item.name;
      let valL = datas[name];
      /* if (utils.isEmpty(valL)) {
        return "";
      }*/
      switch (item.type || "") {
        case "time":
          if (valL) {
            valL = utils.formatTime(valL || 0);
          }

          break;
        case "pledgeAmount":
          valL = this.toPrice(valL, 8);
          break;

        case "price":
          valL = this.toPrice(valL, 8);
          break;

        case "spacealready":
          valL = (datas.declareSpace || 0) - (datas.freeSpace || 0);

          valL = utils.storage(valL);
          break;
        case "storage":
          valL = utils.bytesToSize(valL || 0); //utils.storage(valL);
          break;
        case "pledgeStatus":
          let typeItem = this.pledgeType[valL] || {};
          valL = this.$t(typeItem.label || "");
          break;
        case "deviceAddr":
          valL = valL || this.$store.getters.deviceAddr;
          if (!all) {
            valL = this.getAddrFormat(valL, 9);
          }

          break;
        case "Address":
          if (!all) {
            valL = this.getAddrFormat(valL, utils.isMobile() ? 7 : 15);
          }
          break;
        case "vaildStatus":
          let itemL = this.vaildStatusTypes[valL];
          if (itemL) {
            return this.$t(itemL.label || "");
          } else {
            return "";
          }

        case "progress":
          valL = `${valL || 0} / 100`;
          break;
      }

      if (item.profit && valL == 0) {
        return "-";
      }

      let suffix = item.suffix || (item.suffixFun && item.suffixFun()) || "";
      return `${utils.isEmpty(valL) ? "-" : valL} ${suffix}`;
    },
    onresetSpace() {
      Dialog.confirm({
        title: `${this.$t("home.resetSpace")}`,
        message: `<span style="color:orange">${this.$t(
          "messages.resetMsg"
        )}</span>`,
        cancelButtonText: `${this.$t("messages.no")}`,
        confirmButtonText: `${this.$t("messages.ok")}`,
      })
        .then(() => {
          // on confirm
          this.resetSpace();
        })
        .catch(() => {
          // on cancel
        });
    },
    resetSpace() {
      let toast = this.$toast.loading({
        message: `${this.$t("home.resetSpace")}`,
        forbidClick: true,
        duration: 60000,
        onClose: () => {},
      });

      let reOk = (data) => {
        if (data.cmd == 8) {
          toast && toast.clear();

          this.$notify({
            message: this.$t("messages.resetSpaced"),
            type: "success",
          });
          //  this.socket_resetSpace.closeSocket();
          this.$emit("upSend");
        }
      };

      let autofun = {
        onopen: () => {
          this.socket_resetSpace.sendPing({
            message: {},
            cmd: 8,
            setTicket: true,
            cd: 0,
          });
        },
        onmessage: (data) => {
          reOk(data);
        },
        onRepeat: (data) => {
          reOk(data);
        },
        onerror: () => {
          toast && toast.clear();
          this.socket_resetSpace.closeSocket();
        },
      };
      if (this.socket_resetSpace) {
        this.socket_resetSpace.init();
      } else {
        this.socket_resetSpace = createWebsocket("devicectl", autofun);
      }
    },
    walletSelect() {
      return utils.walletSelect(this, this.pledgeData.managerAddr);
    },
    onUnbind() {
      let reObj = this.walletSelect();
      if (!reObj) return;
      let { sdk } = reObj;

      let setData = {
        title: `${this.$t("messages.bindinglift")}`,
        closebtnshow: false,
        request: null,
        err(e) {
          console.log("error", e);
        },
      };

      let request = sdk.sendTransactionTo(
        webSdk.typeJson.unbind,
        {
          device_address: this.$store.getters.deviceAddr,
          type: 1,
        },
        setData
      );
      setData.request = request;
      this.$store.dispatch("setNotification", setData);
    },
    quitPledge(data) {
      if (!this.pledgeOK) return;
      let reObj = this.walletSelect();
      if (!reObj) return;

      let msg = "messages.exitingMsg";
      let msgColor = "";
      //DOTO---
      if (this.pledgeData.rentNum > 0) {
        msg = "home.withdrawexit";
        msgColor = "orange";
      }

      Dialog.confirm({
        title: `${this.$t("comm.tips")}`,
        message: `<span style='color:${msgColor}'>${this.$t(msg)}<span>`,
        cancelButtonText: `${this.$t("messages.no")}`,
        confirmButtonText: `${this.$t("messages.ok")}`,
      })
        .then(() => {
          this.aQuitPledge(data);
        })
        .catch(() => {
          // on cancel
        });
    },
    aQuitPledge(data) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;
      let addres = this.$store.getters.deviceAddr;
      let setData = {
        title: `${this.$t("comm.withdrawalPledge")}`,
        closebtnshow: false,
        request: null,
        err(e) {
          console.log("error", e);
        },
      };
      let request = sdk.sendTransactionTo(
        webSdk.typeJson.stexit,
        {
          device_address: addres,
        },
        setData
      );
      setData.request = request;
      this.$store.dispatch("setNotification", setData);
    },
    bindaddr() {
      if (!this.pledgeOK) {
        Dialog.alert({
          message: `${this.$t("messages.pleasePledgeFirst")}`,
          theme: "round-button",
          confirmButtonText: this.$t("table.confirm"),
        }).then(() => {});
        return;
      }

      if (this.$store.getters.deviceOk && this.$store.getters.deviceAddr) {
        this.$router.push("/bindaddr");
      }
    },

    upDev() {
      this.$router.push("/upDev");
    },
    onPledgeI(item) {
      this.win.clickSpeed = true;
      switch (item.name) {
        case "rentPrice":
          let rentPrice = this.pledgeData.rentPrice;
          if (rentPrice) {
            this.win.title = "pledge.setRentalPrice";
            this.win.data.dayPrice = Number(utils.clearZero(rentPrice, 18));
            this.loadProperty();
            this.win.action = "dayPrice";
            this.win.show = true;
          }

          break;
        case "bwSize":
          this.win.title = "pledge.serverBandwidth";
          this.win.action = "bwSize";
          this.win.clickSpeed = false;
          let bwSize = this.pledgeData.bwSize || 20;
          this.win.data.bwSize = Number(bwSize);
          this.win.show = true;
          this.getConfigList();
          break;

        case "storageAmount":
          this.$router.push("/spaceRevenue");

          break;
        case "rentAmount":
          this.$router.push("/rentalRevenue");

          break;
        case "entrustRate":
          this.win.title = "newManage.rewardRatio";
          this.win.action = "entrustRate";
          this.win.data.entrustRate = Number(this.pledgeData.entrustRate || 0);

          //  this.win.clickSpeed = false;

          this.win.show = true;

          break;

        case "havAmount":
          this.win.title = "newManage.adjustmentPledge";
          this.win.action = "havAmount";
          this.win.data.havAmount = 1;
          this.win.show = true;
          break;

        case "spHash":
          this.$router.push("/storagePool");
          break;
        case "managerAddr":
          this.$router.push("/changeManage");
          break;
      }

      console.log(item.name);
    },
    loadProperty() {
      this.win.numberLoading = true;
      this.$api.pledge
        .getSet()
        .then((re) => {
          this.win.numberLoading = false;
          let obj = re.result;
          obj["4"] = utils.clearZero(obj["4"], 18);
          this.properts = obj;
        })
        .catch((err) => {
          console.log("error", err);
        });
    },
    getConfigList() {
      this.$api.consoleApi
        .ConfigList("w")
        .then((re) => {
          this.configListW = re.result || [];
        })
        .catch((err) => {
          console.error(err);
        });
    },
    onWinSub() {
      this.$refs["wind_Form"].validate((valid) => {
        if (valid) {
          let reObj = this.walletSelect();
          if (!reObj) return;

          let title = "";
          let type = "";
          //  let num = null;
          let device_address = this.$store.getters.deviceAddr;

          let reData = {
            device_address,
            dayPrice: null,
            bandwidth: null,
            ratio: null,
            havAmount: null,
          };
          switch (this.win.action) {
            case "dayPrice":
              title = "pledge.setRentalPrice";
              type = "chPrice";
              reData.dayPrice = new Decimal(this.win.data.dayPrice).toFixed();
              //this.onUpPrice();
              break;
            case "bwSize":
              if (!this.win.clickSpeed) {
                Toast(this.$t("messages.pleaseclickTest"));
                return;
              }
              title = "home.adjustTitle";
              type = "chbw";
              reData.bandwidth = new Decimal(this.win.data.bwSize).toFixed();

              this.onUpBandwidth(title, type, reData);
              return;

            case "entrustRate":
              title = "newManage.changeRewardRatio";
              type = "stwtreward";
              reData.ratio = this.win.data.entrustRate * 100;
              break;

            case "havAmount":
              title = "newManage.adjustmentPledge";
              type = "stchpg";
              reData.pledgeAmount = this.win.data.havAmount;
              break;
          }
          if (type) {
            this.onUpwin(title, type, reData);
          }
        }
      });
    },
    onUpBandwidth(title, type, reData) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;
      this.win.show = false;
      let setData = {
        title: `${this.$t(title)}`,
        context: "",
        request: null,
        closebtnshow: false,
      };
      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson[type],
        reData,
        setData
      );
      this.$store.dispatch("setNotification", setData);
    },

    onUpwin(title, type, reData) {
      let sdk = utils.getSdk(this);
      if (!sdk) return;

      this.win.show = false;
      let setData = {
        title: `${this.$t(title)}`,
        context: "",
        request: null,
        closebtnshow: false,
      };
      setData.request = sdk.sendTransactionTo(
        webSdk.typeJson[type],
        reData,
        setData
      );
      this.$store.dispatch("setNotification", setData);
    },
    testNetwork() {
      this.win.clickSpeed = true;
      utils.testNetwork();
    },

    adjustBandwidth() {
      this.closeMakeUpWin();
      this.win.title = "home.adjustTitle";
      this.win.action = "bwSize";
      this.win.clickSpeed = false;
      let bwSize = this.pledgeData.bwSize || 20;
      this.win.data.bwSize = Number(bwSize);
      this.win.show = true;
      this.getBandwidthPrice();
      // this.getConfigList();
    },
    onMakeUp() {
      this.closeMakeUpWin();
      let pledgeAmount = new Decimal(this.pledgeData.pledgeAmount || 0);
      let prepledgeAmount = new Decimal(this.pledgeData.prepledgeAmount || 0);
      let subNumber = prepledgeAmount.sub(pledgeAmount);
      subNumber = subNumber.lt(0) ? new Decimal(0) : subNumber;
      subNumber = utils.price(subNumber.toFixed(), 8);
      //    let prepledgeAmountStr = utils.price(prepledgeAmount.toFixed(), 8);
      //  let pledgeAmountStr = utils.price(pledgeAmount.toFixed(), 8);
      Dialog.confirm({
        title: this.$t("home.confirmBandwidth"),
        message: `${this.$t("home.estimatedsupplementary")}：${subNumber} ${
          this.$IEDATA.suffix
        }`,
        cancelButtonText: `${this.$t("table.cancel")}`,
        confirmButtonText: `${this.$t("table.confirm")}`,
      })
        .then(() => {
          let sdk = utils.getSdk(this);
          if (!sdk) return;
          let select = this.$store.getters.account;
          let pledgeAddr = this.pledgeData.pledgeAddr;

          try {
            pledgeAddr = webSdk.sdkUtils.hashToNX(pledgeAddr, true);
            select = webSdk.sdkUtils.hashToNX(select, true);
          } catch (error) {}
          if (select != pledgeAddr) {
            Dialog.alert({
              message: `${this.$t("messages.pleasetopledge")} : ${pledgeAddr}`,
              theme: "round-button",
              confirmButtonText: this.$t("table.confirm"),
            }).then(() => {});
            return;
          }

          let setData = {
            title: `${this.$t("home.confirmBandwidth")}`,
            context: `${this.$t("home.estimatedsupplementary")}：${subNumber} ${
              this.$IEDATA.suffix
            }`,
            request: null,
            closebtnshow: false,
          };

          //let dayPrice = this.win.data.dayPrice;
          let device_address = this.$store.getters.deviceAddr;
          setData.request = sdk.sendTransactionTo(
            webSdk.typeJson.stcatchup,
            { device_address },
            setData
          );
          this.$store.dispatch("setNotification", setData);
        })
        .catch(() => {
          // on cancel
        });
    },
    closeMakeUpWin() {
      this.makeUpWin.show = false;
      this.$store.dispatch("setMakeUp", false);
    },
    makeUpNotice() {
      return this.$store.getters.makeUpWindow;
    },
    isClick(item) {
      if (!item.isClick) return false;

      switch (item.name) {
        case "bwSize":
          return !this.showMakeUp;
        case "havAmount":
          return this.pledgeMax > 0;
        case "entrustRate":
          return true; //this.managePledgeMax > 0;
        case "managerAddr":
          console.log(
            "pledgeNumber---",
            this.pledgeData.pledgeNumber,
            utils.globalDatas_get("utgv2number")
          );
          return (
            this.pledgeData.managerAddr == this.pledgeData.pledgeAddr &&
            this.pledgeData.pledgeNumber <=
              (utils.globalDatas_get("utgv2number") || 0)
          );
        case "spHash":
          return this.snJoinSpday();
        default:
          return item.isClick;
      }
    },
    snJoinSpday() {
      if (utils.isEmpty(this.pledgeData.spHeight)) {
        return true;
      }
      return utils.heightDifference(this.pledgeData.spHeight, "snJoinSpday");
    },
    getBandwidthPrice() {
      this.win.priceLoading = true;
      this.win.data.price = "0";
      let volume = utils.storage(this.pledgeData.declareSpace, "b-b");
      let bandwidth = new Decimal(this.win.data.bwSize || 0).toFixed();
      let request = { bandwidth, declare_space: volume };
      this.$api.pledge
        .getVolume(request)
        .then((response) => {
          try {
            this.win.priceLoading = false;

            let price = new Decimal(response.result.utg || 0);
            let pledgeAmount = this.pledgeData.pledgeAmount || 0;
            price = price.sub(pledgeAmount);
            price = price.lt(0) ? new Decimal(0) : price;
            price = utils.price(price.toFixed(), 8);
            this.win.data.price = price;
          } catch (error) {}
        })
        .catch(() => {
          //this.form.priceLoading = false;
        });
      setTimeout(() => {
        this.$refs["wind_Form"].validate((valid) => {});
      }, 800);
    },

    uploadImg() {
      this.$router.push(`/uploadURL`);
    },
  },
  computed: {
    pledgedAmount() {
      return utils.price(this.pledgeData.pledgeAmount || 0, 8);
    },

    volume_total() {
      return this.$store.getters.getDevice.volume_total || 0;
    },
    utg_volume() {
      return this.$store.getters.getDevice.utg_volume || 0;
    },
    volume() {
      return this.$store.getters.getDevice.volume || 0;
    },
    chartData() {
      return {
        columns: ["key", "value"],
        rows: [
          { key: this.$t("home.encapsulated"), value: this.utg_volume },
          { key: this.$t("home.remainingSpace"), value: this.volume },
        ],
      };
    },
    pledgeOK() {
      return (
        this.pledgeData.pledgeStatus === 0 || this.pledgeData.pledgeStatus === 7
      );
    },
    getDayPrice() {
      return this.properts["4"] || 0;
    },
    getDayPriceMin() {
      return new Decimal(this.getDayPrice).div(10).toFixed();
    },
    getDayPriceMax() {
      return new Decimal(this.getDayPrice).mul(10).toFixed();
    },
    getDayPriceMinNum() {
      return new Decimal(this.getDayPrice).div(10).toNumber();
    },
    getDayPriceMaxNum() {
      return new Decimal(this.getDayPrice).mul(10).toNumber();
    },
    dayPriceAccuracy() {
      return `${1 / utils.toNumber(1, this.properts["10"] || 5)}`;
    },
    upkeyd() {
      let utg_prikey_exsit = this.$store.getters.getDevice.utg_prikey_exsit;
      return utils.isEmpty(utg_prikey_exsit) ? true : !!utg_prikey_exsit;
    },
    bandwidthVal() {
      let bandwidth = this.win.data.bwSize;

      if (!bandwidth) {
        return 0;
      }
      return utils.getBandwidthRewardRatio(bandwidth);
      /* let configList = this.configListW || [];
      let item = configList.find((item) => {
        if (bandwidth > item.min && (!item.max || bandwidth <= item.max)) {
          return item;
        }
      });
      return item ? item.value : 0;*/
    },
    stateTypeItem() {
      let utg_status = this.$store.getters.getDevice.utg_status;
      return utils.isEmpty(utg_status) ? {} : this.stateType[utg_status] || {};
    },
    nowVaildStatus() {
      //DOTO--
      // return false;
      return this.pledgeData.vaildProgress == 100;
      //return  this.pledgeData.vaildStatus===0
    },
    showMakeUp() {
      //DOTO--
      //return true;

      let prepledgeAmount = new Decimal(this.pledgeData.prepledgeAmount || 0);
      if (prepledgeAmount.isZero()) {
        return false;
      }
      // let bwSize = new Decimal(this.pledgeData.bwSize || 0);
      // let bwChanged = this.pledgeData.bwChanged || 0;
      let edit_bandwidth = this.MODUL_SWHITCH.edit_bandwidth;
      return (
        this.pledgeOK &&
        // prepledgeAmount.gt(this.pledgeData.pledgeAmount || 0) &&
        // bwSize.gt(100) &&
        // bwChanged == 0 &&
        edit_bandwidth
      );
    },
    showOriginalBtn() {
      //DOTO--
      //return true;
      let prepledgeAmount = new Decimal(
        `${this.pledgeData.prepledgeAmount || 0}`
      );
      if (prepledgeAmount.isZero()) {
        return false;
      }

      return prepledgeAmount.gt(this.pledgeData.pledgeAmount || 0);
    },
    pledgeWidth() {
     //DOTO--
      //return this.$i18n.locale == "en" ? "100pt" : "85pt";
    },
    managePledgeMax() {
      return Number(
        utils.uumbersHandle(
          [this.pledgeData.pledgeAmount, this.pledgeData.managerAmount],
          ["-"],
          0
        )
      );
    },
    pledgeMax() {
      return Number(
        utils.uumbersHandle(
          [
            this.toPrice(this.pledgeData.pledgeAmount, 18),
            this.toPrice(this.pledgeData.havAmount, 18),
          ],
          ["-"],
          0
        )
      );
    },
  },
  watch: {
    "$store.getters.deviceAddr": function (newVal) {
      this.loadPledge(newVal);
      this.loadRevenue(newVal);
    },
    "win.data.bwSize": function () {
      this.getBandwidthPrice();
    },
  },
};
</script>

<style scoped>
.pledge_btns {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  padding-top: 20px;
  padding-bottom: 20px;
  margin: 0px auto;
  width: 80%;
}
.top_context {
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(166px, 1fr));
}
.top_div {
  padding: 10px;
  text-align: left;
}

.top_text {
  padding: 10px;
  white-space: normal;
  word-break: break-all;
  word-wrap: break-word;
  font-size: 16px;
  font-family: Microsoft YaHei;
  font-weight: 300;
  color: #868686;
}

.top_center {
  font-size: 30px;
  font-family: Microsoft YaHei;
  font-weight: bold;
  color: #419ffe;
  text-align: center;
  display: table;
  width: 100%;
  height: calc(100% - 35px);
  min-height: 80px;
}
.top_center .child {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
.pledge_dev {
  width: 80%;
  margin: 0 auto;

  border-bottom: 1px solid #e9e9e9;
  clear: both;
}

.pledge_label,
.pledge_text,
.pledge_status {
  display: inline-block;
  line-height: 35px;
}
.pledge_label {
  padding-right: 10px;
  text-align: left;
}
.pledge_text {
  font-weight: bold;
  float: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}
.pledge_status {
  font-size: 16pt;
  font-weight: bold;
  float: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}
@media (max-width: 700px) {
  .pledge_dev {
    font-size: 13px;
  }
  .pledge_label{
    width: 100pt;
  }
}
.bwSize_btns {
  text-align: right;

  text-align: center;
}
.bwSize_btns button {
  margin: 0px 5px;
}

.win_button_groups {
  text-align: center;
}

.button_group {
  width: 100%;
  border-bottom: 1px solid #eee;
  margin: 3px 0px;
  display: inline-block;
  min-width: 80px;
  text-align: center;
}
.button_group_div {
  margin: 3px 10px;
  display: inline-block;
  min-width: 80px;
}
.button_group_div:last-child {
  border-left: 1px solid #fff;
}
.button_group:last-child {
  border-bottom: 0px solid #fff;
}
.button_group_warning {
  color: orange;
  position: relative;
  left: -5px;
  top: -5px;
}
.button_group_warning_dialog {
  color: orange;
  float: right;
  margin-right: 10px;
  margin-top: 10px;
}
</style>
<style>
.top_text .el-form-item--mini.el-form-item {
  margin-bottom: 5px;
  width: 100%;
  border-bottom: 1px #eee solid;
}
.el-button--primary {
  color: #fff;
  background-color: rgb(35, 203, 224);
  border-color: rgb(35, 203, 224);
}
.el-popover.el-popover--plain {
  max-width: 800px;

  word-break: break-word;
}
.van-dialog__header {
  padding: 15px 0px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.dialog_update_div .el-form-item__label {
  font-weight: 500;
}
.dialog_update_div .el-form-item {
  border-bottom: solid 1px #eee;
}

.van-button--successx {
  color: #fff;
  background-color: #20c997;
  border: 1px solid #20c997;
}
</style>
