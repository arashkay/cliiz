(function($){

$.fn.watermarks = function( options ){
  var opt = {
    focusClass: $.fn.watermarks.options.focusClass,
    isBlank: $.fn.watermarks.options.isBlank
  }
  $.extend(opt, options);
  $('[marker]', this).each(
    function(){
      var $this = $(this);
      if(opt.isBlank)
        $this.val('');
      $($this.attr('marker')).click(function(){$this.focus()});
    }
  ).focus(
    function(){ $($(this).attr('marker')).addClass(opt.focusClass); }
  ).keypress(
    function(e){ $($(this).attr('marker')).hide(); }
  ).blur(
    function(){
      var $this = $(this);
      if($this.val()!=$this.attr('default') && $this.val()!='') return;
      $($this.attr('marker')).show().removeClass(opt.focusClass);
    }
  ).keyup(
    function(){
      var $this= $(this);
      if($this.val()=='')
        $($this.attr('marker')).show();
    }
  );
  return this;
}
$.fn.watermarks.setup = function(options){
  $.extend(true, $.fn.watermarks.options, options);
};
$.fn.watermarks.options = {
  focusClass: 'focused',
  isBlank: true
};

})(jQuery);


