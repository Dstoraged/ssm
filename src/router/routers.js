import Vue from 'vue'
import Router from 'vue-router'
import Layout from "@/views/layout.vue"

Vue.use(Router)
const constantRouterMap = [
  {
    path: '/',
    component: Layout,
    children: [{
      path: '',
      name: "home",
      meta: { title: "overview" },
      component: (resolve) => require(['@/views/home/index.vue'], resolve),
    },
    ]


  },
  {
    path: '/uploadURL',
    component: Layout,
    children: [{
    path: '',
    name: "uploadURL",
    meta: { title: "market.uploadLink" },
    component: (resolve) => require(['@/views/home/upload.vue'], resolve),
    }]
  },
  {
    path: '/upDev',
    component: Layout,
    children: [{
      path: '',
      name: "upDev",
      meta: { title: "pledge.upkey" },
      component: (resolve) => require(['@/views/home/upDev.vue'], resolve),
    },
    ]
  },
  {
    path: '/bindaddr',
    component: Layout,
    children: [{
      path: '',
      name: "bindaddr",
      meta: { title: "pledge.bindaddr" },
      component: (resolve) => require(['@/views/home/bindaddr.vue'], resolve),
    },
    ]
  },
  {
    path: '/storagePool',
    component: Layout,
    children: [{
      path: '',
      name: "storagePool",
      meta: { title: "newManage.bindStoragePool" },
      component: (resolve) => require(['@/views/home/storagePool.vue'], resolve),
    },
    ]
  },
  {
    path: '/changeManage',
    component: Layout,
    children: [{
      path: '',
      name: "changeManage",
      meta: { title: "newManage.setManagementAddress" },
      component: (resolve) => require(['@/views/home/changeManage.vue'], resolve),
    },
    ]
  },

  {
    path: '/spaceRevenue',
    component: Layout,
    children: [{
      path: '',
      name: "spaceRevenue",
      meta: { title: "home.spaceIncome" },
      component: (resolve) => require(['@/views/home/spaceRevenue.vue'], resolve),
    },
    ]
  },
  {
    path: '/rentalRevenue',
    component: Layout,
    children: [{
      path: '',
      name: "rentalRevenue",
      meta: { title: "home.rentalIncome" },
      component: (resolve) => require(['@/views/home/rentalRevenue.vue'], resolve),
    },
    ]
  },




  {
    path: '/market',

    component: Layout,
    children: [{
      path: '/',
      name: "market",
      meta: { title: "market.market" },
      component: (resolve) => require(['@/views/market/index.vue'], resolve),
    },
    {
      path: 'examine/:id?',
      name: "examine",
      meta: { title: "market.rentalProcessing" },
      component: (resolve) => require(['@/views/market/view.vue'], resolve),
    },
    {
      path: 'examineview/:id?',
      name: "examineview",
      meta: { title: "market.leaseDetails" },
      component: (resolve) => require(['@/views/market/view.vue'], resolve),
    },
    {
      path: 'uploadURL/:id?',
      name: "uploadURL",
      meta: { title: "market.uploadLink" },
      component: (resolve) => require(['@/views/market/upload.vue'], resolve),
    },


    ]


  },
  {
    path: '/pledge',
    component: Layout,
    children: [{
      path: '',
      name: "pledge",
      meta: { title: "equipmentPledge" },
      component: (resolve) => require(['@/views/pledge/index.vue'], resolve),
    }]
  },

  {
    path: '/logs',
    component: Layout,
    children: [{
      path: '',
      name: "logs",
      meta: { title: "logs.log" },
      component: (resolve) => require(['@/views/logs/index.vue'], resolve),
    }]
  },
  {
    path: '/Settings',
    component: Layout,
    children: [{
      path: '',
      name: "Settings",
      meta: { title: "settings.setting" },
      component: (resolve) => require(['@/views/config/index.vue'], resolve),
    }]
  },

  {
    path: '/passwordReset',
    name: "passwordReset",
    component: (resolve) => require(['@/views/passwordReset.vue'], resolve)
  },



  {
    path: '/login/:id?',
    name: "login",
    component: (resolve) => require(['@/views/login.vue'], resolve)
  },
  {
    path: '*',
    redirect: '/',
    hidden: true
  }
]



export default new Router({
  //mode: 'history',
  mode: 'hash',
  // base: 'cloud',
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})