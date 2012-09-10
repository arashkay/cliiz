$(function(){

cliiz.wizard = $.namespace({
  init: function(){
    $('.fn-start').click(cliiz.wizard.open);
    $('.fn-basic-info').validation();
    cliiz.wizard.initLayout();
    cliiz.wizard.initBasicInfo();
    $('.fn-navigation .fn-next').click( cliiz.wizard.next );
    $('.fn-navigation .fn-prev').click( cliiz.wizard.prev );
    if(location.href.indexOf('#')>-1)
      $('.fn-start:first').click();
  },
  open: function(){
    $('.fn-wizard').show();
    cliiz.showtime.hide();
    cliiz.showtime.hideVideo();
    $('.fn-intro, .fn-extend-page').hide();
    if( $('.fn-layouts').is(':visible') )
      $('.fn-wizard').addClass('trans');
  },
  close: function(){
    $('.fn-wizard').hide();
    $('.fn-intro, .fn-extend-page').show();
    cliiz.wizard.hideLayout();
  },
  company: null,
  checkedBasicFields: 0,
  chooseAndNext: function(){
    $(this).parents('.fn-layout').click();
    $('.fn-navigation .fn-next').click();
  },
  next: function(){
    if($('.fn-loading-bar').is(':visible')) return;
    cliiz.wizard.showLoading();
    if( $('.fn-basic-info').is(':visible') && ((cliiz.wizard.checkedBasicFields==3 && $('.fn-basic-info').$().isValid()) || cliiz.wizard.company != null) ){
      if(cliiz.wizard.company==null)
        $.send(
          '/companies.json',
          { company: 
            {
              name: $('input[name="user[name]"]').val(),
              email: $('input[name="user[email]"]').val(),
              password: $('input[name="user[password]"]').val(),
              password_confirmation: $('input[name="user[password]"]').val(),
              frame_id: $('.fn-layout.selected').attr('layoutid') 
            }
          },
          function(d){
            cliiz.wizard.company = d;
            cliiz.wizard.changeStep(3);
            $('.fn-modules .fn-fields-list').checkbox( );
            $('[val=name], [val=email], [val=message]', '.fn-modules').attr('checked', true);
            $('.fn-modules textarea').editor();
          }
        );
      else{
        cliiz.wizard.changeStep(3);
      }
    }else if( $('.fn-layouts').is(':visible') && $('.fn-layout.selected').size()>0 ){
      cliiz.wizard.changeStep(1);
    }else if( $('.fn-modules').is(':visible') ){
      $.send(
        '/used_components/multiple.json',
        { modules: cliiz.wizard.readBlocks() },
        cliiz.wizard.finish
      );
    }else if( $('.fn-finished').is(':visible') ){
      $('.fn-wizard').hide();
      setTimeout( function(){ window.location = "http://"+cliiz.wizard.company.company.name+".cliiz.com" } ,1000 );
    }else
      cliiz.wizard.hideLoading();
  },
  changeStep: function(step){
    $('.fn-layout-preview-block').removeClass('trans');
    $('.fn-step').hide().eq(step).show();
    $('.fn-menu span').removeClass('selected').eq(step).addClass('selected');
    switch(step){
      case 0:
      case 1:
        break;
      case 2:
      case 3:
        $('.fn-layout-preview').hide();
        cliiz.wizard.finish();
        break;
    }
    cliiz.wizard.hideLoading();
  },
  initBasicInfo: function(){
    $('.fn-fast-login').click( cliiz.wizard.login );
    $('.fn-basic-info input').bind( 
      {
        'error': function(){ cliiz.wizard.showHint(this, 'error client'); },
        'fixed': function(){
          $(this).parents('.fn-input').find('.fn-hint')
            .removeClass('error').hide();
        }
      }
    ).one( 'focus', function(){ cliiz.wizard.checkedBasicFields++; } ); // to make sure every field is checked before moving to next step
    $('.fn-basic-info input[name="user[name]"]').bind(
      {
        'fixed': function(){ 
          cliiz.wizard.serverCheck( $(this), '/companies/is_new', { name: $(this).val()})
        },
        'keyup': function(){ $('.fn-site-name').text($(this).val()); }
      }
    );
    $('.fn-basic-info input[name="user[email]"]').bind(
      'fixed',
      function(){ 
        cliiz.wizard.serverCheck( 
          $(this), 
          '/companies/not_registered', 
          { email: $(this).val()}, 
          function(d){
            // (d)? $('.fn-fast-login').hide() : $('.fn-fast-login').show();
          } 
        );
      }
    );
    $('.fn-basic-info input[name="user[password]"]').bind(
      'fixed',
      function(){ cliiz.wizard.showHint(this, 'correct'); }
    );
  },
  showLoading: function(){
    $('.fn-loading-bar').show();
  },
  hideLoading: function(){
    $('.fn-loading-bar').hide();
  },
  login: function(){
    cliiz.wizard.showLoading();
    $.send(
      '/companies/sign_in.json',
      { company: 
        {
          email: $('input[name="user[email]"]').val(),
          password: $('input[name="user[password]"]').val()
        }
      },
      function(d){
        if(cliiz.wizard.company==null)
          cliiz.wizard.company = d;
        cliiz.wizard.changeStep(1);
        cliiz.wizard.hideLoading();
      },
      function(){
        cliiz.wizard.hideLoading();
        $('input:eq(2)').focus().val('').blur();
      }
    );
  },
  serverCheck: function($this, url, data, cback){
    if($this.val()==$this.data('old.value')) return cliiz.wizard.showHint($this, ($this.parents('.fn-input').is('.server.error')) ? 'server error' : 'correct');
    $.send( url, data, 
      function(d){ 
        (d==true) ? cliiz.wizard.showHint($this, 'correct') : cliiz.wizard.showHint($this, 'server error');
        (cback||$.noop)(d);
      } 
    );
    $this.data('old.value', $this.val());
  },
  showHint: function(elm, type){
    $(elm).parents('.fn-input').removeClass('server client info error correct').addClass(type);
  },
  initLayout: function(){
    $('.fn-layout-type').click(
      function(){
        $('[tag]').removeClass('selected');
        var crnt = $(this).addClass('selected').attr('tag');
        $('[tags]').hide();
        if(crnt=='all'){
          $('[tags]').show();
        }else{
          $('[tags~='+crnt+']').show();
        }
        var size = Math.ceil($('[tags]:visible').size()/1);
        $('.fn-layouts-scroll').width( cliiz.defaults.layoutWidth*size );
        $('.fn-layouts-pager').$().repage( Math.ceil(size/6) );
      }
    );
    $('.fn-layout').click(
      function(){ 
        $('.fn-layout').removeClass('selected');
        if(cliiz.mini){
          cliiz.mini.currentLayout = [ $(this).attr('layoutid'), $(this).attr('layoutname') ];
          var crnt = $('.cliiz-layout[layoutid='+cliiz.mini.currentLayout[0]+']').addClass('selected');
          cliiz.mini.rotateLayout(crnt);
        }
        cliiz.wizard.showLayout( $(this).addClass('selected').attr('url') );
      }
    );
    $('.fn-layouts-scroll').width(cliiz.defaults.layoutWidth*cliiz.defaults.layoutCount);
    cliiz.wizard.initLayoutsPager();
  },
  initLayoutsPager: function(){
    $('.fn-layouts-pager').pager(
      { 
        pages: Math.ceil(cliiz.defaults.layoutCount/6),
        onChange: function(page,isJump){
          (isJump)
            ? $('.fn-layouts-scroll').css({ left: -cliiz.defaults.layoutWidth*6*page })
            : $('.fn-layouts-scroll').animate({ left: -cliiz.defaults.layoutWidth*6*page });
        }
      }
    );
  },
  showLayout: function(url){
    cliiz.showtime.hide();
    if(url!=undefined)
      $('.fn-layout-preview .fn-frame').attr('src', url);
    $('.fn-layout-preview, .fn-layout-preview-block').show();
    $('.fn-navigation').delay(1000).fadeIn('slow');
  },
  hideLayout: function(){
    $('.fn-layout-preview, .fn-layout-preview-block').hide();
  },
  finish: function(){
    $('.fn-finished .fn-site-name').text(cliiz.wizard.company.company.name);
    $('.fn-finished a').each(
      function(){
        console.log($(this).text());
        $(this).attr('href', $(this).text());
      }
    );
  }
});
  
});
