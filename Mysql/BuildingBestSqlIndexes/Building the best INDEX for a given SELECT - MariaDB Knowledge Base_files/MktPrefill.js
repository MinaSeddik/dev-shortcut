﻿const MktoCheck={l:function(f){var o=window.onload;if(typeof o==='function'){window.onload=function(){o();f();};}else{window.onload=f;}},r:function(f){if(typeof MktoForms2!=='undefined'){var o=MktoForms2.whenReady;if(typeof o==='function'){MktoForms2.whenReady(f);}}},d:function(){var v={formDate:new Date().toISOString()},f=MktoForms2.allForms();for(var i=0;i<f.length;i++)f[i].addHiddenFields(v);},f:function(){var f=document.forms;for(i=0;i<f.length;i++){f[i].onmouseover=MktoCheck.d;f[i].onkeydown=MktoCheck.d;f[i].onclick=MktoCheck.d;}},i:function(){MktoCheck.l(function(){MktoCheck.r(MktoCheck.f);});}}
MktoCheck.i();