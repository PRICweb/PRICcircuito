(function(root){
  const PRIVATE_FIELDS=['telefono','celular','whatsapp','email','dni','edad','fechaNacimiento','nacimiento','domicilio','direccion','plataforma','onboardingCompletado','notificacionesPush'];
  function split(data){const shared={},personal={};for(const [key,value] of Object.entries(data||{}))(PRIVATE_FIELDS.includes(key)?personal:shared)[key]=value;return {shared,personal};}
  function wrap(sdk,auth,db){
    function ownProfile(ref){const p=ref.path.split('/');return p.length===2&&p[0]==='users'&&p[1]===auth.currentUser?.uid;}
    function writeProfile(ref,data,options,update){
      const {shared,personal}=split(data),batch=sdk.writeBatch(db);
      if(Object.keys(shared).length){if(update)batch.update(ref,shared);else if(options)batch.set(ref,shared,options);else batch.set(ref,shared);}
      if(Object.keys(personal).length){
        batch.set(sdk.doc(db,'privateUsers',auth.currentUser.uid),personal,{merge:true});
        if(Object.hasOwn(personal,'telefono'))batch.set(sdk.doc(db,'friendContacts',auth.currentUser.uid),{telefono:personal.telefono},{merge:true});
      }
      return batch.commit();
    }
    return {
      async getDoc(ref){
        const snap=await sdk.getDoc(ref);if(!ownProfile(ref))return snap;
        const personal=await sdk.getDoc(sdk.doc(db,'privateUsers',auth.currentUser.uid));
        return new Proxy(snap,{get(target,key){if(key==='data')return ()=>snap.exists()?({...snap.data(),...(personal.exists()?personal.data():{})}):undefined;const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
      },
      setDoc(ref,data,options){return ownProfile(ref)?writeProfile(ref,data,options,false):(options?sdk.setDoc(ref,data,options):sdk.setDoc(ref,data));},
      updateDoc(ref,data){return ownProfile(ref)?writeProfile(ref,data,null,true):sdk.updateDoc(ref,data);}
    };
  }
  root.PRICPrivacy={PRIVATE_FIELDS,split,wrap};
  if(typeof module==='object'&&module.exports)module.exports=root.PRICPrivacy;
})(typeof window==='object'?window:globalThis);
