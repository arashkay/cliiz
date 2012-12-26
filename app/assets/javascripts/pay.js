$(function(){
  
cliiz.paying = $.namespace({
  init: function(){
    $('.fn-payform').bind('ajaxCallback', function(e,d){
      $('.fn-reserved, .fn-taken, .fn-own').hide();
      if(d.available)
        $('.fn-reserved').show();
      if(d.available==false)
        $('.fn-taken').show();
      if(d.own==true)
        $('.fn-own').show();
      $('.fn-domain').text(d.domain);
    });
  }
});

cliiz.paying.init();

})
