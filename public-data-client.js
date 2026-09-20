(function(root){
 let token=async()=>'';
 async function init(app,version){
  const sdk=await import(`https://www.gstatic.com/firebasejs/${version}/firebase-app-check.js`);
  const check=sdk.initializeAppCheck(app,{provider:new sdk.ReCaptchaEnterpriseProvider('6LdrLrItAAAAAG5KQoJM5Qci6y3trwbmj3a4TesH'),isTokenAutoRefreshEnabled:true});
  token=async()=>{const result=await sdk.getToken(check,false);return result.token;};
 }
 async function read(path,params={}){
  const headers={'Accept':'application/json'},value=await token();if(value)headers['X-Firebase-AppCheck']=value;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch(`https://us-central1-pric-60f50.cloudfunctions.net/api/public/${path}?${new URLSearchParams(params)}`,{headers,signal:controller.signal});const data=await response.json();if(!response.ok||!data.ok)throw Error('No se pudo consultar la información pública.');return data;}finally{clearTimeout(timer);}
 }
 root.PRICPublic={init,read};
})(window);
