import Vue from "vue"
export function newTableData() {
  return {
    query: {
     
      query: '',
      starttime: '',
      endtime: '',
      sortBy: '', 
      descending: false, 
      pageNum: 1, 
      page_total:0,
      total: 0, 
      pageSize: 10 
    },
    data: []
  }
}

export function setPagination(table, pagination) {
  table.query.pageNum = pagination.page
  table.query.total = pagination.total
  table.query.pageSize = pagination.pageSize
}


export function setPageQuery(query, pagination) {
  if (query && pagination) {
    let names = ["pageNum", "page_total","total", "pageSize"]
    let keys={
      "pageSize":"size",
      "pageNum":"current",
      "page_total":"pages"
    }

    names.forEach(key => {
      let keyL=keys[key]||key
      let val = Number(pagination[keyL] || 0)
      
      Vue.set(query, key, val)
    })
  }


}

export default {
  newTableData,
  setPagination
}
