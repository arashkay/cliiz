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
  },
  submit: function(){
    var fields = $('.fn-new').fields('company', 'name email password password_confirmation'.split(' ') );
    $.send( '/companies.json', fields )
  }
});

cliiz.home.init();

});
