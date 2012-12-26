// yotube API on load event

$(function(){
cliiz.showtime = $.namespace({
  init: function(){
    cliiz.showtime.page();
    cliiz.wizard.init();
    $('.fn-minimize').click(cliiz.showtime.hide);
    this.language();
    $('.fn-video').click( this.showVideo );
    $('.fn-cancel-video').click( this.hideVideo );
  },
  hideVideo: function(){
    if(cliiz.showtime.player&&cliiz.showtime.player.stopVideo) cliiz.showtime.player.stopVideo();
    $('.fn-screen').hide();
  },
  showVideo: function(){
    $('.fn-screen').show();
  },
  page: function(){
    $('.fn-extend-page').click( function(){
      if($('.fn-layout-preview iframe').attr('src')!='') return;
      $('.fn-mainbox').addClass('extended');
      $('.fn-extrabox').show();
      $('.fn-page-tabs .fn-tab.selected').click();
      $('html, body').animate( { scrollTop: 630 } );
    });
  },
  hide: function(){
    $('.fn-mainbox').removeClass('extended');
    $('.fn-extrabox').hide();
  },
  language: function(){
    $('.fn-language').click( 
      function(){ 
        $('.fn-language').toggleClass('open'); 
      } 
    );
    $('.fn-language-expanded .fn-item').click( 
      function(){
        $('.fn-language').show().find('.fn-name').text($(this).text()); 
        $('.fn-language-expanded').hide(); 
        if($(this).attr('locale')==$.cookie('locale')) return;
        $.cookie('locale',$(this).attr('locale'));
        window.location.reload();
      }
    ); 
  }
});

setTimeout( function(){ cliiz.showtime.init() }, 300);

});
