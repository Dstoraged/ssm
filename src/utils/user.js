
const user={
    data:{
        account:"",
        sdk:null
    },
    fun:{
        getSdk:function(){
           return user.data.sdk
        },
        setSdk:function(sdk){
             user.data.sdk=sdk
         },
         getAccount:function(){
            return user.data.account
         },
         setAccount:function(account){
              user.data.account=account
          },
     
    }
 
}
export  default user


