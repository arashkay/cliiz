/**
  author:   Arash Karimzadeh
  version:  1.0.0

  [.tip( [content], [options] )]

  [Description]
  This plugin will create a tooltip for any element

  [Syntax]
  $( selector ).tip( string, options )
  $( selector ).tip( selector, options )
  $( selector ).tip( options )

  [Options]
  [[wrapper]]
  Html template which will be used to show the tooltip content inside itself. Content will be put inside the elements which has class name "jl-tip-content".
  [[onShow]]
  Callback which will be called after the element is shown. This function receives the element which has tooltip as first parameter and 'this' will refer to tooltip element.
  [[onCreate]]
  Callback which will be called on creation time. This function receives the element which has tooltip as first parameter and 'this' will refer to tooltip element.
  [[offset]]
  Left and top margin for the tooltip from the relevant element.Add these left-top values to the calculated position, eg. "50 50" (left top) A single value such as "50" will apply to both.
  [[my]]
  Defines which position on the element being positioned to align with the target element: "horizontal vertical" alignment. A single value such as "right" will default to "right center", "top" will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom", "left", "right". Example: "left top" or "center center"
  [[at]]
  Defines which position on the target element to align the positioned element against: "horizontal vertical" alignment. A single value such as "right" will default to "right center", "top" will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom", "left", "right". Example: "left top" or "center center"
  [[collision]]
  When the positioned element overflows the window in some direction, move it to an alternative position. Similar to my and at, this accepts a single value or a pair for horizontal/vertical, eg. "flip", "fit", "fit flip", "fit none".
  [[[flip]]]
  To the opposite side and the collision detection is run again to see if it will fit. If it won't fit in either position, the center option should be used as a fall back.
  [[[fit]]]
  So the element keeps in the desired direction, but is re-positioned so it fits.
  [[[none]]]
  Not do collision detection.
  
  [[mood]]
  How the tooltip should act.
  [[[false]]]
  Default value is false, which means just create and show the tooltip.
  [[[hover]]]
  It means act as a tooltip and be sensitive on element mouseover.
  [[[object of events]]]
  This can be objet of events eg. { 'click': function(elm){ this is tooltip element }, 'customEvent': function(elm){ this is tooltip element } }
  [[[hidden]]]
  Do not attach any event, just create the tooltip.

  [jMethods]
  [[showUp]]
  This will show the tooltip.
  [[hideOut]]
  This will hide the tooltip.
  [[rePosition]]
  Change the positioning of the tooltip from its relevant element.
  [[[options]]]
  It has some options of the plugin: 'my', 'at', 'collision', 'offset'.

**/
(function($){
  
$.fn.tip = function(content, options){ // content can be string, element or skipped (in this case tip attribute will be used)
  var opt = {
    wrapper: $.fn.tip.options.wrapper,
    onShow: $.fn.tip.options.onShow,
    onCreate: $.fn.tip.options.onCreate,
    offset: $.fn.tip.options.offset,
    my: $.fn.tip.options.my,
    at: $.fn.tip.options.at,
    collision: $.fn.tip.options.collision,
    mood: $.fn.tip.options.mood
  };
  if($.isPlainObject(content))
    var options = content;
  $.extend(true,opt,options);
  this.each(function(){
    var $this = $(this);
    $this.isLego = true;
    var cnt = ($.isPlainObject(content) || content==undefined) ? $this.attr('tip') : content;
    var tip = opt.wrapper==null
                ? $('<div/>')
                : $(opt.wrapper).css( 'position', 'absolute' );
    var container = $('.jl-tip-content',tip);
    if(container.size()==0) container = tip;
    ($.isString(cnt))
      ? ($(cnt).size()==0)
          ? container.html(cnt)
          : container.append($(cnt))
      : container.append(cnt);
    if(opt.wrapper==null)
      tip = tip.children(':first').css( 'position', 'absolute' );
    opt.onCreate.call(tip,$this);
    var show = function(options){
      if(!tip.is(':hidden')) return;
      var pos = $this.position();
      tip.appendTo('body')
         .show()
         .position( { of: $this, my: options.my, at: options.at, collision: options.collision, offset: options.offset } );
      (opt.onShow||$.noop).call(tip,$this);
    };
    if(opt.mood!=false){
      tip.hide();
      if($.isPlainObject(opt.mood)){
        $.each(
          opt.mood,
          function(ev,fn){ 
            $this.bind( 
              ev, 
              function(){
                switch(fn.call(tip,$this)){
                  case true:
                    $this.$().showUp();
                    break;
                  case false:
                    tip.hide();
                }
              }
            )
          }
        );
      }else if(opt.mood=='hover')
        $this.hover( function(){$this.$().showUp()}, function(){ tip.hide() } );
      else if(opt.mood!='hidden'){
        show(opt);
        $this.bind( opt.mood, function(){$this.$().showUp()} );
      }
    }else
      show(opt);
    $this.register(
      {
        'showUp': function() { show(opt) },
        'hideOut': function() { tip.hide() },
        'rePosition': function(opts) {
          var opti = {
            my: opt.my,
            at: opt.at,
            collision: opt.collision,
            offset: opt.offset
          }
          $.extend(opti,opts);
          tip.position( { of: $this, my: opti.my, at: opti.at, collision: opti.collision, offset: opti.offset } );
          $this.register( 'showUp', function(){ show(opti) } );
        }
      }
    );
  });
  return this;
}
$.fn.tip.setup = function(options){
  $.extend(true, $.fn.tip.options, options);
}
$.fn.tip.options = {
  wrapper: '<div class="jl-tip-content" />',
  onShow: $.noop,
  onCreate: $.noop,
  offset: '0 0',
  my: 'left top',
  at: 'left bottom',
  collision: 'flip',
    mood: false // { ev: fn } | false | 'hidden' | any event such as hover, click, ...
};
 
})(jQuery);
