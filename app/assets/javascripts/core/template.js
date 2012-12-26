(function($){

$.fn.template = function(data,options){
  var opt = {
    autoFix: true,
    appendTo: null,
    raw: false,
    keepOrigin: true,
    forceArrayCall: true
  };
  $.extend(true,opt,options);
  var pos = (opt.keepOrigin) ? this : $("<b/>").hide().insertAfter(this);
  var tmp = this.parse(opt.keepOrigin);
  var merge = function(data,tmp,current,key){
    if( typeof data!='object' || data==null ){
      switch(true){
        case (typeof data=='string'):
        case (typeof data=='number'):
          tmp = tmp.replace( new RegExp( ['%#',key,'%'].join('') ,'ig'), data );
          break;
        case (typeof data=='boolean'):
          tmp = tmp.replace( new RegExp( ['%#',key,'%'].join('') ,'ig'), (data)? 'true':'false' );
          break;
        case (data==null):
          tmp = tmp.replace( new RegExp( ['%#',key,'%'].join('') ,'ig'), '' );
          break;
      }
    }else{
      if(data.length!=undefined){
        str = '';
        var fakeLoop = false;
        $.each(
          data,
          function(k,v){
            if(typeof v=='object'){
              fakeLoop = true;
              if(v.length==undefined){
                var s = merge(v,tmp,current,key);
                if(current[key]['jl.object']!=undefined){
                  $.each(
                    v[current[key]['jl.object']],
                    function(kk,vv){
                      s = merge(vv,s,null,kk);
                    }
                  );
                }
                str += s;
              }else
                str += merge(v,current[key]['jl.template'],current[key],'true');
            }else
              str += merge(v,current[key]['jl.template'],current[key],'field');
          }
        );
        tmp = tmp.replace( new RegExp( ['<!--',key,'-->'].join(''), 'ig'), str );
        if(current[key]['jl.fn']&&(fakeLoop!=true||opt.forceArrayCall))
          tmp = eval(current[key]['jl.fn'])(tmp,data,key,current[key],fakeLoop);
      }else if(current!=null){
        var current = current[key];
        if(current==undefined) return;
        var tmp = current['jl.template'];
        $.each(
          data,
          function(k,v){
            switch(typeof v){
              case 'string':
              case 'number':
              case 'boolean':
                tmp = merge(v,tmp,current,k);
                break;
              case 'object':
                tmp = (v==null)
                  ? merge( v, tmp, current, k )
                  : (v.length != undefined) 
                    ? tmp.replace( new RegExp( ['<!--',k,'-->'].join(''), 'ig'), merge(v, ['<!--',k,'-->'].join(''), current, k) )
                    : tmp.replace( new RegExp( ['<!--',k,'-->'].join(''), 'ig'), merge(v, tmp, current, k) );
                break;
            }
          }
        );
        if(current['jl.fn']!=undefined)
          tmp = eval(current['jl.fn'])(tmp,data,key,current,false) ;
      }
    }
    return tmp;
  } ;
  //detect first key
  var key = 'true';
  $.each(
    tmp,
    function(k,v){
      if(k!='jl.template'&&k!='jl.fn')
        key = k;
    }
  );
  var str = merge(data,tmp['jl.template'],tmp,key);

  if(opt.autoFix)
    str = str.replace( /%#[^(#|%)]*%/ig, '');
  var result = (opt.appendTo!=null) ?$(str).appendTo(opt.appendTo) :( (opt.raw) ?str :$(str).insertAfter(pos) );
  if(!opt.keepOrigin) pos.remove();
  return result;
};

})(jQuery);
