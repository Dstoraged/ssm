import { ethers, BigNumber } from "ethers";
import { Decimal } from 'decimal.js'
import Vue from 'vue'
import store from "@/store/index.js"
import i18n from '@/lang'
import { Toast } from 'vant';
import { Notification } from 'element-ui';
import webSdk from "@/utils/webSdk";
import * as api from "@/api/api";
import { buffer } from "js-md5";
const avgBlockTimeNum = window.$config.avgBlockTime;
const BLOCK_DAY = window.$config.BLOCK_DAY;
let totalBlockNumber = null
let globalDatas = {}
const utils = {}

utils.globalDatas_get = function (name) {
  return name ? globalDatas[name] : globalDatas
}
utils.totalBlockNumber_get = function () {
  return totalBlockNumber
}

utils.goTheUrl = function (_that, url, params) {

  _that.navIndex = url
  _that.$router.push({
    name: url,
    params: params
  })
}

utils.goPathUrl = function (_that, url, selector) {

  _that.navIndex = url
  url = url.toLowerCase()
  _that.$router.push({
    path: '/' + url + '/' + selector
  })
}

utils.getNumber = function (val, tokenA, tokenB, isOrd = true) {




  if (isOrd) {
    return utils.getNumberA(val, tokenA, tokenB);
  } else {
    return utils.getNumberB(val, tokenA, tokenB)
  }
}
utils.formatTime = function (timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
  if (!timestamp) return "";
  const newDate = new Date(timestamp)
  // eslint-disable-next-line
  Date.prototype.format = function (format) {
    var date = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      'S+': this.getMilliseconds()
    }

    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (var key in date) {
      if (new RegExp('(' + key + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? date[key] : ('00' + date[key]).substr(('' + date[key]).length))
      }
    }
    return format
  }

  return newDate.format(format)
}



utils.formatTimimg = function (updateTime) {
  if (updateTime === null) {
    return ''
  }

  var tips = {
    just: 'comm.just',
    second: 'comm.second',
    minute: 'comm.minute',
    hour: 'comm.hour',
    day: 'table.day',
    week: 'comm.week',
    month: 'comm.month',
    year: 'comm.year'
  }

  const now = new Date().getTime()
  const second = Math.floor((now - updateTime) / (1000))
  const minute = Math.floor(second / 60)
  const hour = Math.floor(minute / 60)
  const day = Math.floor(hour / 24)
  const month = Math.floor(day / 30)
  const year = Math.floor(month / 12)
  if (year > 0) {
    // const t = month - (year * 12)
    // return year + tips.year + t + tips.month
    return year + i18n.t(tips.year)
  } else if (month > 0) {
    // const t = day - (month * 31)
    // return month + tips.month + t + tips.day
    return month + i18n.t(tips.month)
  } else if (day > 0) {
    // const t = hour - (day * 24)
    // const ret = day + tips.day + t + tips.hour
    const ret = day + i18n.t(tips.day)

    return ret
  } else if (hour > 0) {
    // const t = minute - (hour * 60)
    // return hour + tips.hour + t + tips.minute
    return hour + i18n.t(tips.hour)
  } else if (minute > 0) {
    // const t = second - (minute * 60)
    return minute + i18n.t(tips.minute)
    // return minute + tips.minute + t + tips.second
  } else if (second > 0) {
    return second + i18n.t(tips.second)
  } else {
    return 0 + i18n.t(tips.second)
  }
}
utils.getNumberA = function (val, tokenA, tokenB) {
  let amountIn =
    BigNumber.from(utils.weedDecimals(
      val,
      utils.numberF
    ));
  let reserveIn = tokenA;
  let reserveOut = tokenB;
  let amountInWithFee = amountIn.mul(BigNumber.from("997"))
  let numerator = amountInWithFee.mul(reserveOut);
  let denominator = reserveIn.mul(BigNumber.from("1000")).add(amountInWithFee);
  return ethers.utils.formatUnits(numerator.div(denominator), utils.numberF);
}

utils.getNumberB = function (val, tokenA, tokenB) {

  let amountOut = BigNumber.from(utils.weedDecimals(
    val,
    18
  ));
  let reserveIn = tokenA
  let reserveOut = tokenB;
  let numerator = reserveIn.mul(amountOut).mul(BigNumber.from("1000"));
  let denominator = reserveOut.sub(amountOut).mul(BigNumber.from("997"));
  let reVal = denominator.isZero() ? '0' : numerator.div(denominator).add(BigNumber.from("1"));
  return ethers.utils.formatUnits(reVal, utils.numberF);

}

utils.numberF = 18;
utils.initGoods = function (countObj) {
  let blockNum = parseFloat(ethers.utils.formatUnits(countObj.blockNum || 0, 0))
  let onlineTime = parseFloat(ethers.utils.formatUnits(countObj._onlineTime || 0, 0))
  let lockTime = parseFloat(ethers.utils.formatUnits(countObj.lockdays || 0, 0))
  let lockupamount = ethers.utils.formatUnits(countObj.lockupamount || 0, utils.numberF)
  let releaseamount = ethers.utils.formatUnits(countObj.releaseamount || 0, utils.numberF)

  let balance = parseFloat(lockupamount) - parseFloat(releaseamount)
  let lockNumber = parseFloat(blockNum) - parseFloat(onlineTime) - parseFloat(lockTime)
  let item = {
    lockupamount,
    releaseamount,
    awaitRelease: lockNumber > 0 && balance > 0,
    isAllOut: lockNumber > 0 && balance == 0 && lockupamount > 0
  };
  return item;
}





utils.getAddrFormat = function (data, number = 16) {
  if (!data || data.length === 0) {
    return
  }
  if (data.length <= number * 2) {
    return data
  }
  const str1 = data.substr(0, number)
  const str2 = data.substr(data.length - number)
  return str1 + '...' + str2
}

utils.addrSplit = function (addr, left = true) {
  if (!addr) {
    return ""
  }
  addr = addr.trim()
  let length = addr.length;
  let bnum = length - Math.floor(length / 2);
  if (left) {
    return addr.substring(0, bnum);
  }
  return addr.slice(bnum)
}

utils.isEmpty = function (val) {
  if (val === undefined || val === null || (val + '').trim() === '') {
    return true
  } else {
    return false
  }
}

utils.getUrlParams = function (str) {
  let strs = str.split('&')
  let result = new Object()
  for (var i = 0; i < strs.length; i++) {
    result[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
  }
  return result
}

utils.isInt = function (val) {
  let regPos = /^\+?[0-9][0-9]*$/
  if (regPos.test(val)) {
    return true
  } else {
    return false
  }
}

utils.isNumber = function (val) {

  let regPos = /^\d+(\.\d+)?$/
  let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
  if (regPos.test(val) || regNeg.test(val)) {
    return true
  } else {

    return false
  }
}





utils.rules = function (arr) {
  let json = {}
  arr.forEach(function (item) {
    let colL = []
    let triggerL = item.trigger || "change"
    if (item.required && !item.hide) {
      colL.push({ required: true, trigger: triggerL })
    }

    if (item.fun && typeof item.fun == 'function') {
      colL.push({ validator: item.fun, trigger: triggerL })
    }
    if (item.rules) {
      colL.push(...item.rules);
    }

    if (colL.length > 0) {
      json[item.name] = colL
    }
  })
  return json
}

utils.defaultVals = function (arr) {
  let json = {}
  arr.forEach(function (item) {
    if (item.type == 'title') {
      return
    }
    if (item.defaultVal !== undefined) {
      json[item.name] = item.defaultVal
      return
    }
    if (item.type == "fUpImg") {
      json[item.name] = null;
      return;
    }
    json[item.name] = ''
  })
  return json
}
utils.autoFormWinSelect = function (key, vobj, item) {
  switch (key) {
    case "orgid":
      Object.assign(item, {
        tableHeard: [{ name: 'orgname', title: 'manufacturer' }],
        selectConfig: {
          value: 'orgid',
          title: 'orgname'
        },
        winWinth: '500px',
        queryApi: vobj.$api.tools.orgPage,
        getApi: vobj.$api.tools.orgGet
      });
      break;
    case "osid":
      Object.assign(item, {
        tableHeard: [{ name: 'osname', title: 'Equipment model(OS)' }, { name: 'orgname', title: 'manufacturer' }],
        selectConfig: {
          value: 'osid',
          title: 'osname',

        },
        winWinth: '600px',
        queryApi: vobj.$api.tools.deviceosPage,
        getApi: vobj.$api.tools.deviceosGet
      }
      );



      break;
  }
}




utils.getHashCode = function (str, caseSensitive) {
  if (!caseSensitive) {
    str = str.toLowerCase();
  }
  var hash = 1315423911, i, ch;
  for (i = str.length - 1; i >= 0; i--) {
    ch = str.charCodeAt(i);
    hash ^= ((hash << 5) + ch + (hash >> 2));
  }

  return (hash & 0x7FFFFFFF);
}


utils.formInputHide = function (formArr, names = [], hide = true, formData, valL) {
  formArr.forEach((item, cd) => {
    if (names.includes(item.name)) {

      let itemL = {};
      for (let key in item) {
        itemL[key] = item[key];
      }
      itemL.hide = hide;
      if (formData && valL !== undefined) {
        Vue.set(formData, item.name, valL)
      }
      // formArr[cd]=itemL
      Vue.set(formArr, cd, itemL)
    }
  })
}


utils.setFormInputItem = function (formArr, names = [], name, valL) {
  formArr.forEach((item, cd) => {
    if (names == "all" || names.includes(item.name)) {
      let itemL = {};
      for (let key in item) {
        itemL[key] = item[key];
      }
      itemL[name] = valL;
      Vue.set(formArr, cd, itemL)
    }
  })
}



utils.weedDecimals = function (val, decimals = 0) {
  if (utils.isEmpty(val)) {
    return ""
  }
  val = new Decimal(val || 0).toFixed()
  let valL = (val + "").replace(/[^\d.]/g, "").trim()
  let valArr = valL.split(".")
  let toStr = ""
  let toStrArr = (valArr.length > 1 ? valArr[1] : "").split("")
  toStrArr.forEach(item => {
    if (toStr.length < decimals) {
      toStr += item
    }
  })

  while (toStr.length < decimals) {
    toStr += "0"
  }

  return (valArr[0] || "") + toStr
}

utils.weedZero = function (val, decimals = 0) {

  if (utils.isEmpty(val)) {
    return ""
  }
  if (typeof val == "string") {
    val = val.trim()
  }
  val = new Decimal(val || 0).toFixed()
  let valL = (val + "").replace(/[^\d.]/g, "").trim()
  let valArr = valL.split(".")
  let first = ""
  let toStr = ""
  let firstArr = valArr[0];
  let toStrArr = (valArr.length > 1 ? valArr[1] : "").split("")
  let zero = false;
  for (let cd = 0; cd < firstArr.length; cd++) {
    if (zero || firstArr[cd] != "0") {
      first += firstArr[cd];
      zero = true;
    }
  }
  zero = false;

  for (let cd = toStrArr.length - 1; cd >= 0; cd--) {
    if (cd < decimals) {
      if (zero || toStrArr[cd] != "0") {
        toStr = toStrArr[cd] + toStr
        zero = true;
      }

    }
  }



  return (first || "0") + (toStr.length > 0 ? ("." + toStr) : "")


}



utils.NumberDiv = function (arg1, arg2, digit) {
  var t1 = 0, t2 = 0, r1, r2;
  try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
  try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
  r1 = Number(arg1.toString().replace(".", ""))
  r2 = Number(arg2.toString().replace(".", ""))

  var result = ((r1 / r2) * Math.pow(10, t2 - t1)).toString()
  var result2 = result.split(".")[1];
  result2 = result2.substring(0, digit > result2.length ? result2.length : digit);

  return result.split(".")[0] + "." + result2;
}



utils.getPathTool = function (tokenMap, notTokens, addrin, addrout) {
  let list = tokenMap[addrin] || [];
  let listTo = [];
  if (list.includes(addrout)) {
    listTo.push([addrin, addrout]);
  }

  list.forEach((keyL) => {
    if (keyL != addrout && !notTokens[keyL]) {
      let notTokenL = {};
      notTokenL[keyL] = true;
      Object.assign(notTokenL, notTokens);

      let relist = utils.getPathTool(tokenMap, notTokenL, keyL, addrout);
      relist.forEach((tokens) => {
        listTo.push([addrin, ...tokens]);
      });
    }
  });

  return listTo;
}
utils.random = function (cd = 8) {
  var re = '';
  for (var i = 0; i < cd; i++) {
    re += Math.floor(Math.random() * 10);
  }
  return re;
}
utils.toNumber = function (val, decimals = 0) {
  decimals = decimals > 0 ? decimals - 1 : 0
  let dec = new Decimal(decimals > 0 ? val * Number(`10e${decimals}`) : val)
  return dec.toFixed()
}
utils.getDevice = function (key = "utg_addr") {
  let item = store.getters.getDevice
  return item[key]
}


utils.clearZero = function (value, num = 4) {

  if (utils.isEmpty(value)) {
    return "0"
  }
  if (typeof value == "string") {
    value = value.trim()

  }
  value = new Decimal(value || 0).toFixed()

  try {
    value = ethers.utils.formatUnits(BigNumber.from((value || 0) + ""))
    let minus = ""
    if (value < 0) {
      minus = "-"
    }
    value = minus + utils.weedZero(value, num)
  } catch (error) {
  }
  return value
}

utils.price = function (val, num = 18) {
  return utils.clearZero(val, num)
}

const storageTypes = ['b', 'k', 'm', 'g', 't', 'p', 'e']
const storageType = {
  'b': { name: "Byte" },
  'k': { name: "KB" },
  'm': { name: "MB" },
  'g': { name: "GB" },
  't': { name: "TB" },
  'p': { name: "PB" },
  'e': { name: "EB" }
}

utils.storage = function (val, type = 'b-g') {

  let pypes = type.split("-")
  if (pypes.length < 2) {
    return 0
  }
  let start = pypes[0];
  let end = pypes[1];

  if (!storageTypes.includes(start) || !storageTypes.includes(end)) {
    return 0
  }
  let difference = storageTypes.indexOf(start) - storageTypes.indexOf(end);
  let num = Math.pow(1024, Math.abs(difference))
  if (difference >= 0) {
    val = val ? (val * num) : 0
  } else {
    val = val ? (val / num) : 0
  }

  return new Decimal(val).toFixed();
}

utils.getSdk = function (_this_, message = true) {
  let sdk = _this_.$store.getters.getsdk;
  if (!sdk) {
    message && _this_.$notify.error(i18n.t(`messages.pleaseWalletFirst`));
    return null;
  }
  return sdk
}
utils.loadGlobalDatas = async function () {
  return new Promise((resolve, reject) => {
    api
      .postJson("/platform/getStorageBasicSet", {})
      .then((response) => {
        const data = response.result || {};
       
        globalDatas = data
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

utils.getNowHeight = async function () {
  return new Promise((resolve, reject) => {

    api
      .postJson("/platform/getBlockNumber", "")
      .then((response) => {
        const data = response.result || {};
        totalBlockNumber = data.totalBlockNumber || 0
      
        resolve(totalBlockNumber)
      }).catch(err => {
        resolve(err)
      })


  });

}

utils.lockingTime = function (startTime, avgBlockTime = avgBlockTimeNum, unlocknumber, releaseHeigth) {
  avgBlockTime = avgBlockTime === null ? avgBlockTimeNum : avgBlockTime;
  let lockTime = totalBlockNumber/* Math.floor(
    (new Date().getTime() - startTime) / (avgBlockTime * 1000)
  );*/
  let nowNumber = unlocknumber + releaseHeigth - lockTime;

  if (nowNumber > 0) {

    return Math.ceil(nowNumber / BLOCK_DAY);


  }

  return 0;
}

utils.jsonProve = function (json = {}, names) {
  let finName = names.find(name => {
    if (utils.isEmpty(json[name])) {
      return name
    }
  })
  if (finName) {
    Notification.error(i18n.t("messages.lackInformation"));
    return false
  }
  return true;


}

utils.mobileVersion = async function (showMsg = true, ver = 18) {
  let msg = "messages.appupdate"
  return new Promise((resolve, reject) => {
    if (utils.isMobile() && window.ethereum.isIeMetas) {
      if (!ethereum) {
        showMsg && Toast.fail({
          position: 'top',
          message: i18n.t(msg)
        });
        resolve(false);
        return
      }

      let timeOk = true;
      setTimeout(() => {
        if (timeOk) {
          if (showMsg && window.ethereum.isIeMetas) {
            Toast.fail({
              position: 'top',
              message: i18n.t(msg)
            })
          }
          resolve(false)
        }
        timeOk = false;
      }, 500)

      ethereum.request({ method: "get_app_version", params: [] })
        .then(re => {
          timeOk = false;
          let ok = re >= ver;
          if (!ok) {
            if (showMsg && window.ethereum.isIeMetas) {
              Toast.fail({
                position: 'top',
                message: i18n.t(msg)
              }
              );
            }
          }
          resolve(ok)
        }).catch(() => {
          timeOk = false;
          resolve(false)
        })

    } else {
      resolve(true)
    }
  })
}
utils.testNetwork = async function () {
  let verOk = await utils.mobileVersion();


  let url = i18n.locale == "zh"
    ? window.$config.OPEN_URL_CN
    : window.$config.OPEN_URL;

  if (utils.isMobile()) {
    if (verOk && window.ethereum.isIeMetas) {
      alert(`OPEN_WINDOW:${url}`);
    }

  } else {
    if (window.open) { window.open(url, "_blank"); }
  }

}

utils.isMobile = function () {

  let info = navigator.userAgent || "";
  let agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
  for (let i = 0; i < agents.length; i++) {
    if (info.indexOf(agents[i]) >= 0) return true;
  }
  return false;
}

utils.randomArr = function (arr = []) {
  return arr.sort(function () {
    return Math.random() - 0.5;
  })
}

utils.docVersion = function (_this_, ver = "", dev) {

  dev = dev || _this_.$store.getters.getDevice || {};
  ver = ver || "0";
  let version = dev.version || '0';
  ver = ver.replace(/[^\d.]/g, "");
  version = version.replace(/[^\d.]/g, "");
  let re = false
  try {
    re = new Decimal(version).gte(ver);
  } catch (error) {

  }

  return re
  /*if(utils.isEmpty(dev.utg_config)){
    return false
  }else{
    return true;
  }*/
}



/*utils.getBandwidthRewardRatio = function (bandwidth) {
  if (!bandwidth) {
    return 0;
  }
  let bwroleval = 2.5;
  let correctVal = 0.3;

  if (bandwidth >= 100) {
    bwroleval = 3;
    correctVal = 0.1;
  }
  let plbwRatio = utils.getBandwidthPledgeRatio(bandwidth)
  let rewardRatio = plbwRatio.div(bwroleval);
  rewardRatio = rewardRatio.sub(correctVal);
  return rewardRatio.toFixed(5)
}
utils.getBandwidthPledgeRatio = function (bandwidth) {
  let logindex = 0.6532125137753437;
  if (bandwidth >= 100) {
    logindex = 0.6020599913279624;
  }
  let bwRatio = new Decimal(Math.log10(bandwidth)).div(logindex);
  return bwRatio
}
*/








utils.getBandwidthRewardRatio = function (bandwidth) {

  let bwroleval = 2.5;
  let correctVal = 0.3;
  if (bandwidth >= 1024) {
    return '1.32639'
  }
  if (bandwidth < 20) {
    return '0'
  }


  let plbwRatio = new Decimal(utils.getBandwidthPledgeRatio(bandwidth))
  let rewardRatio = plbwRatio.div(bwroleval);
  rewardRatio = rewardRatio.sub(correctVal);

  return rewardRatio.toFixed(5)
}

utils.getBandwidthPledgeRatio = function (bandwidth) {
  if (bandwidth >= 1024) {
    return '4.06598';
  }
  let logindex = 0.7403626894942439
  let bw = new Decimal(Math.log10(bandwidth))

  let bwRatio = bw.div(logindex);
  return bwRatio.toFixed(4)
}




utils.calStorageNewRatio = function (totalCapacity) {


  totalCapacity = new Decimal(utils.storage(totalCapacity, 'g-b') || 0);
  let tb1b = utils.storage(1, 't-b');

  let log2Value = "0.3010299956639812";
  let storageRatio = new Decimal(0);


  if (totalCapacity.gt(tb1b)) {
    let tbcapity = totalCapacity.div(tb1b);
    storageRatio = new Decimal(Math.log10(tbcapity.toNumber())).div(log2Value)
  }
  return storageRatio.div(11).add(0.02).toFixed(6);
}


utils.pledgeYear = function (pledgeNumber = 0) {

  let subNumber = new Decimal(totalBlockNumber || 0).sub(pledgeNumber);

  if (subNumber.gt(0)) {
    let days = subNumber.div(BLOCK_DAY)
    return days.gt(365);
  }
  return false;

}

utils.isONes = function () {
  if (!window.ethereum) {
    return;

  };
  window.ethereum.isIeMetas = !!window.ethereum.wrapResults;


}

utils.computeMap = {
  '+': "add",
  '-': "sub",
  '*': 'mul',
  '/': 'div'
}
utils.uumbersHandle = function (numbers = [], handles = [], num) {
  let first = numbers.length > 0 ? new Decimal(numbers[0] || 0) : null;
  let re = "";

  if (first) {
    numbers.splice(0, 1);
    numbers.forEach((nul, cd) => {
      let handle = handles[cd];
      handle = utils.computeMap[handle];
      first = first[handle](nul || 0);
    })
    re = first.toFixed();
    if (!utils.isEmpty(num)) {
      re = utils.weedZero(re, num)
    }

  }
  return re;
}

utils.walletSelect = function (_this_, addr, msg = "messages.pleaseAdministrative") {
  let sdk = utils.getSdk(_this_);
  if (!sdk) {
    return false;
  }

  //DOTO---
  //addr = "0x6257cE45e2a1f0660F894399DD56a28DA93E636a"

  if (!addr) {
    _this_.$dialog.alert({
      message: `${_this_.$t("messages.invalidAddress")}`, //messages.pleaseminer
      theme: "round-button",
      confirmButtonText: _this_.$t("table.confirm"),
    }).then(() => { });
    return false;
  }
  let selectAddr = _this_.$store.getters.account;

  try {
    addr = webSdk.sdkUtils.hashToNX(addr, true);
    selectAddr = webSdk.sdkUtils.hashToNX(selectAddr, true);

  } catch (error) {

    return false
  }
  if (selectAddr != addr) {
    _this_.$dialog.alert({
      message: `${_this_.$t(msg)} : ${utils.getAddrFormat(addr, 10)}`, //messages.pleaseminer
      theme: "round-button",
      confirmButtonText: _this_.$t("table.confirm"),
    }).then(() => { });
    return false;
  }
  return { selectAddr, addr, sdk };
}






utils.bytesToSize = function (bytes) {
  if (bytes === null) return "";
  if (bytes === 0) return "0 B";
  var k = 1024, // or 1000
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(4)) + " " + sizes[i];
};



utils.timeDifference = function (current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerSecond = 1000;
  var elapsed = current - previous;
  var seconds = Math.floor((elapsed / msPerSecond) % 60);
  var minutes = Math.floor((elapsed / msPerMinute) % 60);
  var hours = Math.floor((elapsed / (msPerMinute * 60)) %
    24);
  var days = Math.floor(elapsed / (msPerMinute * 60 *
    24));
  return {
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
};
/*utils.heightDifference = function (current, days = 0) {
  let maxHeight = current + days * window.$config.BLOCK_DAY
 console.log("maxHeight-totalBlockNumber",maxHeight,totalBlockNumber)
  return (totalBlockNumber || 0) > maxHeight
}*/

utils.heightDifference = function (current, type, day = true) {
  
  let numL = globalDatas[type] || 0
  if (day) {
    numL *= window.$config.BLOCK_DAY
  }
  let maxHeight = Number(current) + Number(numL)
  console.log("current-maxHeight-totalBlockNumber", current, maxHeight, totalBlockNumber)
  return (totalBlockNumber || 0) > maxHeight
}
export default utils
