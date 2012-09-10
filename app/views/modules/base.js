var cliiz = {};
jQuery(function($){

cliiz = {
  baseUrl: "http://<%= request.host_with_port %>",
  crossDomain: (document.location.host!='<%= request.host_with_port %>'),
  scope: function(e){ return $(e).parents('[cliiz=module]') },
  send: function( url, data, callback ){
    var token = {};
    token[ $('[name=csrf-param]').attr('content') ] = $('[name=csrf-token]').attr('content');
    $.ajax({
      url: cliiz.baseUrl+url,
      data: $.extend(token, $.isFunction(data)? {} : (data||{}) ),
      success: $.isFunction(data)? data : (callback||$.noop),
      type: 'POST',
      dataType: cliiz.crossDomain? 'jsonp':'json'
    });
  },
  flash: function(m){
    m.fadeIn('fast').delay(3000).fadeOut('slow');
  },
  init: function(){
    $('[data-cliiz=menu] [data-menu]').each(
      function(){
        var link = $(this).is('[href]') ? $(this) : $('[href]', this);
        if(new RegExp(link.attr('href')+"$").test(document.location.href))
          $(this).addClass('selected');
      }
    );
    if($('[data-cliiz=menu] [data-menu].selected').size()==0)
      $('[data-cliiz=menu] [data-menu][href$=home], [data-cliiz=menu] [data-menu][href$=Home]').addClass('selected');
  }
};
cliiz.init();

});
