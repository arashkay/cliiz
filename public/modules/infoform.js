jQuery(function($){

$('[cliiz-type=infoform] button').click(
  function(){
    var f = cliiz.scope(this);
    var inputs = {};
    f.find('[name]:not([name=uid])').each(
      function(){
        inputs[$(this).attr('name')] = $(this).val();
      }
    );
    cliiz.send( f.attr('remote'), {i: inputs, uid:$('[name=uid]',f).val()},
      function(d){ 
        if(d==true) $('.cliiz-success',f).fadeIn(); 
      }
    );
  }
);

});
