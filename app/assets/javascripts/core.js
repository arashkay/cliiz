$(function(){

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
    cliiz.panel.showLoading();
  $.ajax(
    {
      type: 'post',
      url: url,
      data: $.extend(
        token,
        ($.isFunction(data)||data==undefined)? {}: data
      ),
      success: function(d){ if(cliiz.panel) cliiz.panel.hideLoading(); ($.isFunction(data)? data : (callback||$.noop)).call(this,d) },
      error: function(d){ if(cliiz.panel) cliiz.panel.hideLoading(); (($.isFunction(data)&&$.isFunction(callback))? callback : (error||$.noop)).call(this,d) }
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
    cliiz.panel.showLoading();
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
      insertImage: { visible: false },
      insertTable: { visible: false }
    }
  }
  $.extend(opts, options);
  this.wysiwyg( opts );
}
$.fn.checkbox = function( options ){
  var opt = {
    onClick: $.noop,
    option: "span"
  }
  $.extend( opt, options );
  this.each(
    function(){
      $(opt.option, this).click( function(){ opt.onClick.call( $(this).toggleClass('selected') ); } );
    }
  );
  return this;
};
$.fn.list = function( options ){
  var opt = {
    defaultOption: ':first',
    display: 'span',
    arrow: 'img',
    dropdown: '.dropbox',
    list: '.list',
    option: ".option"
  };
  $.extend( opt, options );
  this.each(
    function(){
      var $this = $(this);
      var arrow = $(opt.arrow, this);
      var list = $(opt.list, this);
      var drop = $(opt.dropdown, this);
      var display = $(opt.display, this);
      var options = $(opt.option, this);
      display.click( function(){ drop.toggle(); } );
      arrow.click( function(){ drop.toggle(); } );
      options.click( function(){ $this.attr('val', $(this).attr('val')); drop.hide(); display.text($(this).attr('text')) } );
      $('>*', list).filter(opt.defaultOption).click();
    }
  );
  return this;
};

});
