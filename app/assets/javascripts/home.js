var cliiz = {};

$(function(){

cliiz.home = $.namespace({
  init: function(){
    $('.fn-submit').click(cliiz.home.submit);
    $('[name="company[password]"]').change(
      function(){
        $('[name="company[password_confirmation]"]').val($(this).val());
      }
    );
    $('.fn-start').click(this.start);
  },
  start: function(){
    $('.fn-info').animate( { width: 200 } );
    $('.fn-info .fn-demo').fadeOut(function(){
      $('.fn-frames').delay(100).appendTo('.fn-info').fadeIn();
    });
    $('.fn-new').delay(500).animate( { width: 500 } );
    $('.fn-new .fn-demo').delay(500).slideUp();
    $('.fn-new .fn-main').delay(500).slideDown();
  },
  submit: function(){
    var fields = $('.fn-new').fields('company', 'name email password password_confirmation'.split(' ') );
    $.send( '/companies.json', fields, cliiz.home.submitted );
  },
  submitted: function(){
    document.location = 'http://'$('.fn-new [name="company[name]"]').val()+'.webuilder.com.au/panel/edit';
  }
});

cliiz.home.init();

});
