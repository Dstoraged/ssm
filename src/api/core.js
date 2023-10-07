

 export function newdata(data) {
    return {
        timestamp: Date.now().toString(),
        data
    }
}

export default {
    newdata
}