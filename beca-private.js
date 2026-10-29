'use strict';
// El material Beca 18 se consulta únicamente por funciones autenticadas de Supabase.
// No incorporar bancos privados a archivos JSON públicos ni al código fuente.
(function(){
 let client=null;
 const imageCache=new Map();
 function api(){
  if(client)return client;
  if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)
   throw Error('No está configurado el acceso a CachimboLab.');
  client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  return client;
 }
 async function check(){
  const {data:{session},error}=await api().auth.getSession();
  if(error||!session?.user)throw Error('Inicia sesión en CachimboLab.');
  const {data:allowed,error:permissionError}=await api().rpc('has_service_access',{p_modality:'BECA18'});
  if(permissionError||allowed!==true)throw Error('No tienes Beca 18 autorizado. Solicita acceso al administrador.');
  return true;
 }
 async function document(name){
  await check();
  const {data,error}=await api().rpc('beca_private_read',{p_asset_name:name});
  if(error)throw Error('No se pudo obtener el material privado: '+error.message);
  if(!data||typeof data!=='object')throw Error('El material privado no está disponible.');
  return data;
 }
 async function image(path){
  await check();
  if(imageCache.has(path))return imageCache.get(path);
  const {data,error}=await api().rpc('beca_private_image',{p_path:path});
  if(error)throw Error('No se pudo cargar la ilustración: '+error.message);
  if(!data||!/^image\/(png|jpeg|webp)$/.test(data.mime)||!data.base64)throw Error('Ilustración no disponible.');
  const uri='data:'+data.mime+';base64,'+data.base64;
  imageCache.set(path,uri);
  return uri;
 }
 window.becaPrivate={check,document,image};
})();