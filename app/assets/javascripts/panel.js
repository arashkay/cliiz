cliiz = {};

$(function(){
  
cliiz.panel = $.namespace({
  init: function(){
    $.fn.tip.setup( { wrapper: '<div class="fn-tooltip tooltip"><div class="arrow"></div><div class="arrow-border"></div><div class="tip jl-tip-content"></div></div>', mood: 'hover', my: 'left top', at: 'left bottom', offset: '-15 12', onShow: function(){ $('.fn-tooltip').hide(); this.show(); } } );
    $('body').watermarks().find('[tip]').tip();
    $('.fn-login-form').bind( 'ajaxCallback', function(e,d){ if(d.email!=undefined) document.location = '/panel' } )
    this.menu();
    this.parse();
  },
  menu: function(){
    //$('.fn-mainmenu .fn-item').tip( $('.fn-submenu').clone().show().toHtml(), { wrapper: "<div></div>", mood: 'hover', my: 'left top', at: 'left bottom', offset: '35 0' } );
    $('.fn-mainmenu .fn-item')
      .click( function(){ document.location = $('a',this).attr('href'); } )
      .filter(':not([location=panel])').each(
        function(){
          if( new RegExp($(this).attr('location')).test(document.location.pathname) )
            $(this).addClass('selected');
        });
    if($('.fn-mainmenu .fn-item.selected').size()==0)
      $('.fn-mainmenu [location=panel]').addClass('selected');
  },
  parse: function(){
    $.parseForm($('[autoform=true]'));
    this.parseList($('.fn-list[auto]'));
    this.limitedFields();
    this.parseSimpleForm($('form:has([submit=true])'));
  },
  showLoading: function(){
    $('.fn-loading').show();
  },
  hideLoading: function(){
    $('.fn-loading').hide();
  },
  parseSimpleForm: function(form){
    $('[submit=true]', form).click(function(){
      $(this).parents('form').submit();
    });
  },
  popup: function(obj){
    if(obj.size()>0)
      alert('cliiz.panel.popup');
  },
  parseList: function(lists){
    $('.fn-checkall', lists).tip( '<div><div class="item fn-item">All</div><div class="item fn-item">New</div><div class="item fn-item">None</div></div>', 
      { 
        wrapper: '<div class="fn-tooltip tooltip-menu"></div>', 
        mood: { 'click': function(){ return !this.is(':visible'); }}, my: 'left top', at: 'left bottom', offset: '0', 
        onCreate: function(tip){ 
          $('.fn-item', this).click( 
            function(){ 
              $('.fn-tooltip').hide();
              var l = $(tip).parents('.fn-list');
              switch($(this).text().toLowerCase()){
                case 'all':
                  $('input:checkbox',l).attr('checked',true);
                  break;
                case 'none':
                  $('input:checkbox',l).attr('checked',false);
                  break;
              }
            } 
          ) 
        } 
      } 
    );
    $('.fn-checkall input', lists).click(
      function(e){
        var t = $(this);
        var l = t.parents('.fn-list');
        $('input:checkbox', l).attr('checked', (t.is(':checked')));
        e.stopPropagation();
      }
    );
    $('[remote]', lists).click(
      function(){
        var $this = $(this);
        var l = $this.parents('.fn-list');
        var m = $this.parents('.fn-menu');
        var ids = [];
        var hash = {};
        var selected = $('.fn-row:has(input:checkbox:checked)', l);
        selected.find('input[type=hidden]').each(
          function(){ 
            var name = $(this).attr('name');
            if(name){
              (hash[name])
                ? hash[name].push($(this).val())
                : hash[name] = [$(this).val()];
                
            }else{
              ids.push($(this).val());
            }
          }
        );
        cliiz.panel.showLoading();
        $.send( 
          $this.attr('remote'), 
          $.extend({ids: ids,'_method': $this.attr('method')}, hash),
          function(){
            var l = $this.parents('.fn-list');
            var m = $this.parents('.fn-menu');
            if($this.is('[autohide]'))
              selected.hide();
            if($('.fn-row:visible', l).size()==0)
              l.hide();
            cliiz.panel.hideLoading();
          }
        );
      }
    );
  },
  limitedFields: function(){
    $('[limited]').keypress(
      function(e){
        var t = $(this);
        var l = parseInt(t.attr('limited'));
        if(t.val().length>=l&&e.which!=8)
          return false;
      }
    ).blur(
      function(e){
        var t = $(this);
        var l = parseInt(t.attr('limited'));
        if(t.val().length>l)
          t.val(t.val().substr(0,l));
      }
    );
  },
  flash: function(m){
    m.fadeIn('fast').delay(5000).fadeOut('slow');
  }
});
cliiz.panel.init()

});
