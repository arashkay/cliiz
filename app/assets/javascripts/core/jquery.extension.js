/**
  author:   Arash Karimzadeh
  version:  1.0.0
  
  [$$( selector, [context] )]

  [Description]
  This is same as jQuery() or $() function. But the return object is different, as it has to expose the functions of jLego objects which are saved at 'jqueryLego.ext' to users, so you can use extra functions such as: win1.open(); btn1.disabled( true );
  The return is an object or a list of objects. In case it is more than one object, you can not use jquery plugins and functions on it anymore.

  [Syntax]
  $$( selectore, [context] )
  $$( element )
  $$( elementArray )
  $$( jQuery object )

**/
var $$ = function(selector, context){
  var obj = [];
  jQuery(selector, context).each( function(){
    var $this = $(this);
    if($this.data('jqueryLego.ext'))
      $.each(
        $this.data('jqueryLego.ext'),
        function(f,c){
          $this[f] = c;
        }
      );
    obj.push($this);
  });
  return (obj.length == 1)? obj[0]: obj;
};

(function($){

$.extend({
  /**
    author:   Arash Karimzadeh
    version:  1.0.0

    [$.namespace( object )]

    [Description]
    It will create a new namespace, namespaces can be extended by using their .extend() function. sample is nameSpaceA.extend( objectOfFunctionsAndAttributes )

    [Syntax]
    $.namespace( object )

  **/
  namespace: function(obj){
    var obj = ($.isPlainObject(obj)) ? obj : {};
    obj.extend = function(obj){ $.extend(this, obj) };
    return obj;
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [$.isString( variable )]

    [Description]
    This will check if the type is string.

    [Syntax]
    $.isString( variable );

  **/
  isString: function(n){
    return (typeof n == 'string');
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0

    [$.isNumber( variable )]

    [Description]
    This will check if the type is number.

    [Syntax]
    $.isNumber( variable );

  **/
  isNumber: function(n){
    return (typeof n == 'number');
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [$.varOrDefault( variable, default )]

    [Description]
    This can check if variable is set or otherwise the default will be used.

    [Syntax]
    $.varOrDefault( variable, object );

  **/
  varOrDefault: function(v,def){
    return (typeof v === 'undefined') ? def : v;
  }
});

$.fn.extend({
  /**
    author:   Arash Karimzadeh
    version:  1.0.0

    [.jvar( key, [value] )]

    [Description]
    This is a setter/getter for attributes in jLego object.

    [Syntax]
    jLegoObject.jvar( string, object ); setter
    jLegoObject.jvar( string ); getter

  **/
  'jvar': function(k,v){
    if(v==undefined)
      return this.data('jLego.variables')!=undefined? this.data('jLego.variables')[k] : null;
    if(this.data('jLego.variables')==undefined)
      this.data('jLego.variables',{});
    this.data('jLego.variables')[k] = v;
    return this;
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [.register( name, fn, [isPrivate] )]

    [Description]
    Register functions in jLego object, it can store as private method as well which means they will not be exposed by $$() function.

    [Syntax]
    jLegoObject.register( string, function, boolean );
    jLegoObject.register( { string : function, string : function }, boolean );

  **/
  register: function(name,fn,isPrivate){
    var fns = {};
    if($.isPlainObject(name))
       fns = name;
    else
      fns[name] = fn;
    $(this).data('jqueryLego._private', $.extend($(this).data('jqueryLego._private'), fns) );
    if(isPrivate===true) return this;
    var exposed = {}
    $.each(
      fns,
      function(name,fn){
        exposed[name] = function(){
          return $(this).data('jqueryLego._private')[name].apply(this, arguments);
        };
      }
    );
    $(this).data('jqueryLego.ext', $.extend($(this).data('jqueryLego.ext'), exposed) );
    return this;
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [.private( name, parameters )]

    [Description]
    This will call private register methods in jlego object.

    [Syntax]
    jLegoObject.private( string, array );

    [Parameters]
    [[parameters]] 
    It is an array of parameters which will be passed to function.
    
  **/
  'private': function(name, parameters){
    return this.data('jqueryLego._private')[name].apply(this, parameters)
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [.textpend( content )]

    [Description]
    Detect type if it is text it will be added to element using text() function if it is html, element or jQuery object it will appended by append() function.

    [Syntax]
    $( selector ).textpend( text | html | element | jQueryObject );

  **/
  textpend: function(content){
    (typeof content=='string'&&content.indexOf('<')!=0)
      ? this.text(content)
      : this.append(content);
    return this;
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [.textract( [remove] )]

    [Description]
    Detect if it is not possible to return the inside elements, return the content as text.

    [Syntax]
    $( selector ).textract( boolean );
    
    [Parameters]
    [[remove]] 
    A boolean to determine if it has to remove the content or keep it (in case it is false) after returning it.
    
  **/
  textract: function(remove){
    var cnt = $('> *',this)
    if(cnt.size()==0)
      cnt = this.html();
    if(remove!==false){
      if(cnt!=null && typeof cnt!=='string')
        cnt.detach();
      this.html('');
    }
    return cnt;
  },
  /*
    author:   Arash Karimzadeh
    version:  1.0.0

    [.parse( keepOrigin )]

    [Description]
    It is a shortcut for parser to parse an element

    [Syntax]
    $( selector ).parse( boolean )

    [Parameters]
    [[keepOrigin]]
    Same as keepOrigin in .toHtml().

  */
  parse: function(keepOrigin){
    return $.parse(this.toHtml(keepOrigin));
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0

    [.toHtml( keepOrigin )]

    [Description]
    It will convert an element HTML to string.

    [Syntax]
    $( selector ).toHtml( boolean )

    [Parameters]
    [[keepOrigin]]
    If it is false it will remove the element and return it

  **/
  toHtml: function(keepOrigin){
    var $this = (keepOrigin!=false)? this.clone(): this;
    var html = $('<div/>').append($this).html();
    $('<div/>').remove();
    return html;
  },
  /**
    author:   Arash Karimzadeh
    version:  1.0.0
    
    [.$() | .lego()]

    [Description]
    Same as $$(). But it is called on jquery objects

    [Syntax]
    $( selector ).$();
    $( selector ).lego();

  **/
  lego: function(){ return $$(this); }
});
$.fn.$ = $.fn.lego;

/*
  author:   Arash Karimzadeh
  version:  1.0.0

  [$.parse( string )]

  [Description]
  It is a parser for template plugin

  [Syntax]
  $.parse( string )

*/
$.parse = function(strng){
  var expression = function(collection){
    if((/<[\w]*(?=[^>]*fn=)/i).test(collection['jl.template']))
      collection['jl.fn'] = collection['jl.template'].match(/fn=('|")[^\<]*('|")/i)[0].split(/'|"/)[1];
    if((/<[\w]*(?=[^>]*object=)/i).test(collection['jl.template'])){
      collection['jl.object'] = collection['jl.template'].match(/object=('|")[^\<]*('|")/i)[0].split(/'|"/)[1];}
  }
  var parse = function( str ){
    var loop = str.match(/<[\w]*(?=[^>]*loop=)/i);
    if(loop==null) return false;
    var tag = loop[0].replace('<','');
    var scope = str.substr(loop.index);
    scope = scope.replace('loop','looped');
    var tags = scope.match(new RegExp('<'+tag+'|</'+tag+'>','ig'));
    var open = 0;
    var close = 0;
    $.each(
      tags,
      function(){
        (this.indexOf('/')==-1)
          ? open++
          : close++;
        if(open==close) return false;
      }
    );
    var end = 0;
    for(var i=0;i<close;i++)
      end = scope.indexOf('</'+tag+'>',end+1);
    var splits = [str.substring(0,loop.index),scope.substring(0,end+tag.length+3),str.substring(loop.index+end+tag.length+1)]; // +1 because 'loop' is changed to 'looped'
    var key = splits[1].match(/looped=('|")[^.]*('|")/i)[0].split(/'|"/)[1];
    splits[0] += ['<!--',key,'-->'].join('');
    
    var collection = { 'jl.template': splits[0], 'jl.ending': splits[2] };

    var splitted1 = parse(splits[1]);
    if(splitted1!=false){
      splits[1] = splitted1;
      collection[key] = splits[1];
    }else{
      collection[key] = { 'jl.template': splits[1] };
    }

    var splitted2 = parse(splits[2]);
    if(splitted2!=false){
      collection['jl.template'] += splitted2['jl.template'];
      collection['jl.ending'] = splitted2['jl.ending'];
      $.each(
        splitted2,
        function(k,v){
          if(k!='jl.ending'&&k!='jl.template')
            collection[k] = v;
        }
      );
    }else{
      collection['jl.template'] += collection['jl.ending'];
    }
    delete collection['jl.ending'];
    return collection;
  }
  var collection = parse(strng.replace(/(\n|\r|\r\n)\s+/mg,''));
  var extract = function(collection){
    expression(collection);
    $.each(
      collection,
      function(k,v){
        if(k!='jl.template'&&k!='jl.fn'&&k!='jl.object')
          extract(v);
      }
    );
  }
  extract(collection);
  return collection;
}

$.cookie = function(key, value, options){
  if(value==undefined){
    var value = '';
    if(document.cookie){
      var cookies = document.cookie.split(';');
      $.each(
        cookies,
        function(k,v){
          var cookie = jQuery.trim(v);
          var l = key.length + 1;
          if (cookie.substring(0,l) != (key + '=')) return true;
          value = decodeURIComponent(cookie.substring(l));
          return false;
        }
      );
    }
    return value;
  }else{
    options = options || {};
    var expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
      var date = new Date();
      (typeof options.expires == 'number')
        ? date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000))
        : date = options.expires;
      expires = '; expires=' + date.toUTCString();
    }
    var path = options.path ? '; path=' + (options.path) : '';
    var domain = options.domain ? '; domain=' + (options.domain) : '';
    var secure = options.secure ? '; secure' : '';
    document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
  } 
}

})(jQuery);

