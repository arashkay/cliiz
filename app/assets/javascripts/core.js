$(function(){

$.fn.vl = function(f, val){
  f = $(['[name="',f,'"]'].join(''), this);
  if(val!=undefined)
    f.val(val);
  return f.val();
}
$.fn.fields = function(object, f, d ){
  var $t = this;
  if(d!=undefined){
    $.each( f, function(k,v){
        $t.vl(object+'['+v+']', d[v]);
      }
    );
    return $t;
  }else{
    var d = {};
    $.each( f, function(k,v){
        var n = object+'['+v+']';
        d[n] = $t.vl(n);
      }
    );
    return d;
  }
}
$.send= function(url, data, callback, error, freeze){
  var token = {};
  token[ $('[name=csrf-param]').attr('content') ] = $('[name=csrf-token]').attr('content');
  var freeze = (typeof data=='boolean') 
    ? data
    : (typeof callback=='boolean')
      ? callback
      : (typeof error=='boolean')
        ? error
        : freeze;
  if(freeze==true)
    cliiz.loading.show();
  $.ajax(
    {
      type: 'post',
      url: url,
      data: $.extend(
        token,
        ($.isFunction(data)||data==undefined)? {}: data
      ),
      success: function(d){ if(cliiz.loading) cliiz.loading.hide(); ($.isFunction(data)? data : (callback||$.noop)).call(this,d) },
      error: function(d){ if(cliiz.loading) cliiz.loading.hide(); (($.isFunction(data)&&$.isFunction(callback))? callback : (error||$.noop)).call(this,d) }
    }
  );
}
$.parseForm = function(forms){
  var submit = function(){
    var target = $(this);
    var f = target.parents('[remote]');
    if(f.has('.loading').size()>0||f.data('prev.submitted')==true)
      return;
    if(f.is('[single=true]'))
      f.data('prev.submitted', true);
    var d = {};
    $('input, textarea, select', f).each(
      function(){
        var i = $(this);
        d[i.attr('name')] = i.val();
      }
    );
    cliiz.loading.show();
    $.send(
      target.attr('remote-url') || f.attr('remote'), d, 
      function(d){ 
        cliiz.panel.hideLoading(); 
        cliiz.panel.popup($(f.attr('success'))); 
        $('.success',f).show();
        f.trigger('ajaxCallback', [d]) 
        if(target.attr('callback')||f.attr('callback'))
          eval(target.attr('callback')||f.attr('callback')).call(f, d);
      }, 
      function(d){  
        cliiz.panel.hideLoading(); 
        cliiz.panel.flash($(f.attr('failure'))); 
        f.trigger('ajaxCallback', [d]);
        if(target.attr('callback')||f.attr('callback'))
          eval(target.attr('callback')||f.attr('callback')).call(f, d);
      }
    );
  }
  $('[remote-submit]', forms).click( submit );
  $('[autosubmit]', forms).keypress( function(ev){
    if(ev.keyCode==13) submit.call(this);
  });
}
$.fn.collect = function(fn, returnObj){
  var arr = [];
  this.each(
    function(){
      arr.push(fn.call($(this)));
    }
  );
  if(returnObj){
    var obj = {};
    $.each( arr, function(k,v){ if(v==undefined) return true; obj[v[0]]=v[1]; } )
  }
  return obj||arr;
}
$.fn.pager = function( options ){
  var opt = {
    pages: 1,
    handle: '.fn-handle',
    next: '.fn-next',
    prev: '.fn-prev',
    onChange: $.noop // get 2 args. first is page second is bool in case it is jump, the value is true
  };
  $.extend(opt, options);
  var move = function(page,h){
    h.jvar('current.page', page);
    h.animate( { 'left': (page/(h.jvar('total.pages')-1))*100+"%", "margin-left": 0-h.width()/2 } );
    opt.onChange(page);
  }
  this.each(function(){
    var $this = $(this);
    var h = $(opt.handle, $this);
    h.jvar('total.pages', opt.pages);
    h.jvar('current.page', 0);
    $(opt.next, h).click( function(){
      var page = h.jvar('current.page');
      if(page>=h.jvar('total.pages')-1) return;
      move(page+1, h);
    });
    $(opt.prev, h).click( function(){
      var page = h.jvar('current.page');
      if(page<=0) return;
      move(page-1, h);
    });
    $this.register(
      { 'jumpTo' : function(i){
          if(i>h.jvar('total.pages')) return false;
          var h = $(opt.handle, this);
          h.jvar('current.page', i);
          h.css( { 'left': (i/(h.jvar('total.pages')-1))*100+"%", "margin-left": -h.width()/2 } );
          opt.onChange(i, true);
        },
        repage: function(pages){
          h.jvar('total.pages', pages);
          h.jvar('current.page', 0);
          h.css( { 'left': "0%", "margin-left": -h.width()/2 } );
          opt.onChange(0, true);
        }
      }
    );
  });
};
$.fn.scroller = function(method){
  var panel = this;
  var scroll = $(panel.attr('scroll'), panel);
  var move = function(handle){
    var perc = Math.round(handle.position().top*100/(scroll.height()-handle.height()));
    var inner = $(panel.attr('panel'), panel);
    var pos = 0-Math.round( (inner.height()-panel.height())*perc/100);
    if(pos>0) pos = 0;
    inner.css( 'top', pos );
  }
  if(method=='reset'){
    $(scroll.attr('handle'), scroll).css('top',0);
    $(panel.attr('panel'), panel).css( 'top', 0 );
    move(scroll);
    return;
  }
  $(panel.attr('panel'), panel).mousewheel(function(event, delta) {
    var handle = $(scroll.attr('handle'), scroll);
    var top = handle.position().top-delta*5;
    if(top<0) top = 0;
    if(top>scroll.height()-handle.height()) top = scroll.height()-handle.height();
    handle.css('top', top);
    move(handle);
    event.stopPropagation();
    event.preventDefault();
    return false;
  });
  scroll.click(
    function(e){
      var scroll = $(this);
      var handle = $(scroll.attr('handle'), scroll);
      var top = e.originalEvent.layerY-handle.height()/2;
      if(top<0) top = 0;
      if(top>scroll.height()-handle.height()) top = scroll.height()-handle.height();
      handle.css('top', top);
      move(handle);
    }
  ).hover( function(){ $(this).fadeTo('fast', 0.7)}, function(){ $(this).fadeTo('fast', 0.5)} )
  $(scroll.attr('handle'), scroll).draggable( 
    { axis: 'y' , 
      containment: scroll, 
      drag: function(e, ui){ move($(this)); }
    }
  );
}
$.fn.editor = function(options){
  var opts = {
    initialContent: null,
    css: '/stylesheets/basic.css',
    controls: {
      insertImage: { 
        visible: true, 
        exec: function(){
          $('.fclz-forms [formfor]:visible .fclz-editor').wysiwyg('insertImage', '#cliiz-img-placeholder');
          cliiz.toolbox.module.gallery.browser('editor');
        } 
      },
      insertTable: { visible: false },
      insertHorizontalRule: { visible: false },
      code: { visible: false },
      html: { visible: true }

    },
    autoGrow: true
  }
  $.extend(opts, options);
  this.wysiwyg( opts );
}
// v2
$.fn.links = function( options ){
  var opt = {
    selector: '[data-url]',
  }
  $.extend( opt, options );
  this.each(
    function(){
      $(opt.selector, this).click(
        function(event){
          window.location = $(this).data('url');
          event.stopPropagation();
          return false;
        }
      );
    }
  );
  return this;
}
// v2 
$.fn.checkboxes = function( options ){
  var opt = {
    onClick: $.noop,
    selector: '[data-checkbox]',
    selectedClass: 'clz-checked'
  }
  $.extend( opt, options );
  this.each(
    function(){
      $(opt.selector, this).click( 
        function(){ 
          if( opt.onClick.call( $(this).toggleClass(opt.selectedClass) )!=false ){
            var obj = $($(this).data('checkbox'));
            $(this).is('.'+opt.selectedClass) ? obj.prop("checked", true) : obj.removeProp('checked');
          }
        } 
      );
    }
  );
  return this;
};
$.fn.radios = function( options ){
  var opt = {
    onClick: $.noop,
    selector: '[data-radio]',
    selectedClass: 'clz-checked'
  }
  $.extend( opt, options );
  this.each(
    function(){
      $(opt.selector, this).click( 
        function(){ 
          if( opt.onClick.call( $(this).toggleClass(opt.selectedClass) )!=false ){
            var group = $(this).data('group');
            $('[data-radio][data-group="'+group+'"]').not(this).removeClass(opt.selectedClass);
            var obj = $($(this).data('radio'));
            $(this).is('.'+opt.selectedClass) ? obj.prop("checked", true) : obj.removeProp('checked');
          }
        } 
      );
    }
  );
  return this;
};
$.fn.lists = function( options ){
  var opt = {
    onClick: $.noop,
    selector: '[data-list]',
    dropSelector: '[data-dropdown]',
    itemSelector: '[data-value]',
    displaySelector: '[data-selected-value]'
  }
  $.extend( opt, options );
  this.each(
    function(){
      $(opt.itemSelector, this).click( 
        function(){ 
          if( opt.onClick.call( $(this) )!=false ){
            var list = $(this).parents(opt.selector);
            var v = $(this).data('value');
            $(opt.displaySelector, list).data('selected-value', v).text($(this).text());
            $(list.data('list')).val(v);
            var t = $(this).parents(opt.dropSelector).hide();
            setTimeout(function(){t.removeAttr('style')},100);
            if(list.data('onchange')!=undefined)
              eval(list.data('onchange')).call(list, v);
          }
        } 
      );
      $(opt.selector, this).each( function(){
        var v = $($(this).data('list'), this).val();
        if(v=='') return true;
        var t = $('[data-value="'+v+'"]', this).text();
        $(opt.displaySelector, this).text(t).data('selected-value', v);
      });
    }
  );
  return this;
};

});
