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
    $('.fn-read').click(this.read);
    $('.fn-plans .fn-plan').click(this.plan);
    $('.fn-compare').hover(this.compare, this.choose);
    $('.fn-name, .fn-email, .fn-password').keypress( function(){ $('.error', $(this).parents('.fn-row')).removeClass('error'); } );
  },
  plan: function(){
    $('.fn-plan').removeClass('active');
    $(this).addClass('active');
  },
  compare: function(){
    $('.fn-plans').addClass('explained');
  },
  choose: function(){
    $('.fn-plans').removeClass('explained');
  },
  start: function(){
    $('.fn-info').animate( { width: 200 } );
    $('.fn-info .fn-demo, .fn-info .fn-main').fadeOut(function(){
      $('.fn-frames').delay(100).appendTo('.fn-info').fadeIn();
    });
    $('.fn-new').delay(500).animate( { width: 520 } );
    $('.fn-new .fn-demo').delay(500).slideUp();
    $('.fn-new .fn-main').delay(500).slideDown();
  },
  read: function(){
    $('.fn-new .fn-demo').fadeOut();
    $('.fn-info').delay(900).animate( { width: 600}, function(){
      $('.fn-info .fn-demo').delay(100).slideUp();
      $('.fn-info .fn-main').delay(100).slideDown();
    });
  },
  submit: function(){
    var fields = $('.fn-new').fields('company', 'name email password password_confirmation'.split(' ') );
    fields['company[name]'] = fields['company[name]'].replace('http:','').replace('//','').replace('www.','').split('.')[0];
    $.send( '/companies.json', fields, cliiz.home.submitted, cliiz.home.errors );
  },
  errors: function(data){
    var resp = data.responseText;
    if(resp.indexOf('name')!==-1)
      $('.fn-name').addClass('error');
    if(resp.indexOf('email')!==-1)
      $('.fn-email').addClass('error');
    if(resp.indexOf('password')!==-1)
      $('.fn-password').addClass('error');
  },
  submitted: function(){
    document.location = 'http://'+$('.fn-new [name="company[name]"]').val()+'.webuilder.com.au/panel/edit';
  }
});

cliiz.home.init();

});
