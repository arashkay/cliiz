/**
  author:   Arash Karimzadeh
  version:  1.0.0
  
  [.tab( [options] )]
  
  [Description]
  This plugin will create a set of tab, tabs can be in different parts of the page

  [Syntax]
  $( selector ).tab( options )

  [Options]
  [[selector]]
  CSS selector to find tabs inside the current object. Default is 'li'.
  [[selectedCSS]]
  CSS class which will be added to selected tab. Default is 'selected'.
  [[selected]]
  CSS selector to make a tab selected by default. Default is null.
  [[onClick]]
  A function which will be called when users click on the tab. You can use this function have to return true for proceeding the action or false to preventing the selecting. Also if you return nothing it will proceed swaping.

  [HTML Attributes]
  [[panel]]
  This is a CSS selector for where to load the content of tab in.
  [[content]]
  This is a CSS selector for the element which contains the content for this tab.
  
  [jMethods]
  [[tab(index)]]
  (This is for tab container) Return the tab jElement of passed index
  [[select()]]
  (This is for each tab) Select the tab and simulate the user click
  [[onclick(fn)]]
  (This is for each tab) Change the on click emthod of tab
  
  [[Select a tab by default]]
  You can pass it in options or assign the selected CSS class to the tab before calling the tab() method. These will trigger the click event and priority is with the options.selected.

  [[Mixed with Container]]
  As you know for container if you want not to lose functions and events you must set justDetach to true.

**/
(function($){
  
$.fn.tab = function(options){
  var opt = {
    selector: $.fn.tab.options.selector,
    selectedCSS: $.fn.tab.options.selectedCSS,
    selected: $.fn.tab.options.selected,
    onClick: $.fn.tab.options.onClick
  };
  $.extend(true, opt, options);
  var $this = $(this);
  var swap = function(tab){
    $(opt.selector,$this).removeClass(opt.selectedCSS);
    tab.addClass(opt.selectedCSS);
    if( $.isFunction( $(tab.attr('panel')).$().freight ) ){
      if(tab.attr('url'))
        $(tab.attr('panel')).$().freight( tab.attr('url') );
      else
        $(tab.attr('panel')).$().update( tab.jvar('tab.content') );
    }else{
      $('>*', tab.attr('panel')).detach( );
      if( tab.is('[content]') && tab.is('[panel]') )
        $(tab.jvar('tab.content')).appendTo( $(tab.attr('panel')).empty() );
    }
  }
  var click = function(e){ if(opt.onClick.call($(this),e)===false) return; swap($(this)); };
  $(opt.selector,$this)
    .click( click )
    .each(
      function(){
        var tab = $(this);
        tab.register(
          {
            'select': function(){
              $(this).click();
            },
            'onclick': function(fn){
              tab.unbind( 'click', click ).click( function(e){ if(fn.call(tab,e)===false) return; swap($(this)) });
            },
            'content': function(){
              return $(this).jvar('tab.content');
            }
          }
        );
        tab.jvar('tab.content', $(tab.attr('content')).appendTo($(this).attr('panel')).detach());
      }
    );
  $this.register(
    'tab',
    function(id){
      return $(opt.selector,$this).eq(id-1).$();
    }
  );
  (
    (opt.selected==null)
      ? $([opt.selector, '.', opt.selectedCSS].join(''), $this)
      : $(opt.selected, $this)
  ).click();
  return this;
};
/**
  [[Setup]]
  [[[$.fn.tab.setup('options', options)]]]
  To change default behavior of the plugin.
**/
$.fn.tab.setup = function(name, options){
  switch(name){
    case 'options':
      $.extend(true, $.fn.tab.options, options);
      brea;
  }
};
$.fn.tab.options = {
  selector: 'li',
  selectedCSS: 'selected',
  selected: null,
  onClick: $.noop // function(){ return true }
};
 
})(jQuery);
