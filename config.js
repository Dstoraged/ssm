
window.$config = {
  testAddr: "",
  windowTitle: 'comm.deviceManagement',
  netUrl:"https://rpc.ultronglow.io",
  netId: "0xbc", 
  baseUrl: "https://super.ultronscan.io",
  rpcBaseUrl:"https://super.ultronscan.io",
  ajaxRe: true,
  ERROR_TYPES: {
    4: "comm.versionMismatch",
    5: "comm.protocolError",
    7: "comm.invalidName",
    8: "comm.invalidPassword",
    23: "comm.loading",
    24: "comm.statusConformance",
    35: "comm.tooAttempts",
    46: "comm.loginExpired",
    1001: "comm.parameterError",
  },

  DEVUCE_TYPES: {
    1: "comm.WaitingEncapsulation",
    2: "comm.capacityEncapsulation",
    3: "comm.capacityCompleted",
    4: "comm.WaitingEncapsulation",
    5: "comm.pledged",
    6: "comm.unpacking",
    7: "comm.unpacking",

  },
  SOCKET_PATH: {
    login: "wss://*/utglogin",
    devicectl: "wss://*/utgdevicectl",
  },
  avgBlockTime: 4


}


