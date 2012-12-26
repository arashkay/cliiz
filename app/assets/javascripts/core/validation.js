(function($){
//not tested
$.fn.validation = function(options){
  var opt = {
    checkOnBlur: $.fn.validation.options.checkOnBlur
  }
  $.extend(true, opt, options);
  this.each(
    function(){
      var $this = $(this);
      var groups = $('[type=group]',$this);
      var fields = $('input,textarea,select',$( '*:not([type=group])',$this ));
      var elems = fields.add(groups);
      elems.bind( 
        'validate', 
        function(){
          var $this = $(this);
          var is_valid = true;
          $.each(
            $.fn.validation,
            function(name,fn){
              if($this.is(['[',name,']'].join(''))){
                var value = undefined;
                try{
                  value = eval($this.attr(name));
                }catch(exp){
                  value = $this.attr(name);
                }
                is_valid = fn.call( $this, value, $this.attr(name) );
              }
              if(is_valid==false) return false;
            }
          );
          (is_valid)
            ? $(this).jvar('validation.has.error', false).trigger('fixed')
            : $(this).jvar('validation.has.error', true).trigger('error');
          return is_valid;
        }
      );
      if(opt.checkOnBlur){
        fields.bind( 'blur', function(){ $(this).trigger('validate'); } );
        $( 'input,textarea,select', groups ).bind( 'blur', function(){ $(this).parents('[type=group]:first').trigger('validate'); } );
      }
      $this.register( 
        {
          validate: function(ignore){
            elems.not(ignore).trigger('validate');
            return $(this).$().isValid();
          },
          isValid: function(ignore){
            var is_valid = true
            elems.not(ignore).each(
              function(){
                if( $(this).jvar('validation.has.error')==true ) is_valid = false;
                return is_valid;
              }
            );
            return is_valid;
          }
        }
      );
    }
  );
  return this;
}

$.extend(
  $.fn.validation,
  {
    not_null: function(value,rawValue){ 
      return (value!=true) || this.val()!='';
    },
    be_checked: function(value,rawValue){
      return (value!=true) || $('[checked]',this).size()!=0;
    },
    range: function(value,rawValue){
      var range = rawValue.split(',');
      return !( ( range[0]!='' && parseFloat(range[0])>parseFloat(this.val()) ) || ( range[1]!='' && parseFloat(range[1])<parseFloat(this.val()) ) )
    },
    format: function(value,rawValue){
      return (value.test(this.val()));
    },
    boundary: function(value,rawValue){
      var b = rawValue.split(',');
      var v = this.val().length;
      return !((b[0]!=''&&v<b[0])||(b[1]!=''&&v>b[1]));
    },
    has_type: function(value,rawValue){
      switch(rawValue){
        case 'integer': 
          return /^[0-9]+$/.test(this.val());
        case 'float':
          return /^[0-9.]+$/.test(this.val());
        case 'email':
          return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(this.val());
      }
      return true;
    },
    be_in: function(value,rawValue){
      var items = rawValue.split(',');
      return !($.inArray(this.val(), items)===-1);
    }
  }
);

$.fn.validation.setup = function(options){
  $.extend(true, $.fn.validation.options, options);
};
$.fn.validation.options = {
  checkOnBlur: true
};

})(jQuery);
