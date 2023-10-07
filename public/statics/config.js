window.$config = {
  windowTitle: 'comm.deviceManagement', 
  netUrl: "",
  netId: "0xbc",
  baseUrl: "",
  rpcBaseUrl: "",
  SEAL_MIN: 5,        
  SEAL_MAX: 102400,  
  SEAL_RESERVE: 5,
  LEASE_RESERVATION: 5,
  upMaxSize: 30, 
  BLOCK_DAY: 60,   
  OPEN_URL: "https://www.speedtest.net/", 
  OPEN_URL_CN: "https://www.speedtest.cn/",
  
  
  migrationMinute:1,



  BASE_CONFIG: () => {
    let chaninId = parseInt(window.$config.netId)
    return {
      "name": "MAINNET",
      "chain_id": chaninId,
      "utg_retrieve_block_number": 71,
      "utg_one_day_block_number": window.$config.BLOCK_DAY,
      "utg_enquire_pledge_url": `${window.$config.baseUrl.replace(/([\w\W]+)\/$/, "$1")}/platform/getStoragePledgeInfo?device_addr=`,

      "utg_chain_urls": [
        "http://192.168.9.203:8545"
        
      ]

    }
  },

  MODUL_SWHITCH: {
    edit_bandwidth: true, 
    show_rent: true,      
    show_logs: true,       
  },

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
    8: "comm.withdrawalPledge"

  },

  SOCKET_PATH: {
    login: "ws://*/utglogin",
    devicectl: "ws://*/utgdevicectl",
  },

  SOCKET_PATH_TWO: {
    login: "utglogin",
    devicectl: "utgdevicectl"
  },
 
  avgBlockTime: 10,
  delayed_block: 35,   
  IS_TEST: false,
  SOCKET_TWO: false,



}


