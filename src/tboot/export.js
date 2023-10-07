

let exrport={}


exrport.convertRes2Blob=function(response,fileName="doc.xlsx") {
 
   fileName = fileName||response.headers['content-disposition'].match(
    /filename=(.*)/
  )[1]
  
 
  const blob = new Blob([response.data], { type: 'application/octet-stream' })
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
  
    window.navigator.msSaveBlob(blob, decodeURI(fileName))
  } else {
   
    const blobURL = window.URL.createObjectURL(blob)
    
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', decodeURI(fileName))
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
   
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    window.URL.revokeObjectURL(blobURL)
  }
}

export default exrport;