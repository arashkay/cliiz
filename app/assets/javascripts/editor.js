$(function(){

$.fn.dto = function(val){
  if(val!=undefined)
    this.data('cliiz.module.dto', val);
  return this.data('cliiz.module.dto');
}
/*
cliiz.toolbox.defaults.modules
cliiz.toolbox.defaults.blocks
cliiz.toolbox.defaults.page

.fclz-module    'cliiz.module.dto'  = component
block           'cliiz.module.dto'  = used_component
block           'cliiz.form'        = form
form            'cliiz.block'       = block

*/

cliiz.toolbox = $.namespace({
  defaults: {
    module: '.fclz-module-box',
    deleted: []
  },
  initialize: function(){
    this.rearrange(this.sizes.normal)
    $('[data-tool]').click(this.toggle);
    $(window).resize(this.resize);
    this.init.theming();
    this.init.packages();
    this.init.partitions();
    this.form.init();
    $.send( '/components/list_addables/', this.init.features, true);
    $('.fclz-publish').click( this.publish );
  },
  init: {
    theming: function(){
      $('.fclz-themeleft').click(cliiz.toolbox.rotateLeft);
      $('.fclz-themeright').click(cliiz.toolbox.rotateRight);
      $('.fclz-theme').click(
        function(){
          $.send( '/companies/temp_layout.json', { id: $(this).data('id') }, function(){ location.reload(true) } )
        }
      );
      cliiz.toolbox.themePreview();
    },
    features: function(data){
      $.send( '/components/blocks/', cliiz.toolbox.init.blocks);
      $('.fclz-tools').template(data, { keepOrigin: false}).find(cliiz.toolbox.defaults.module).show();
      $.each( data, function(){
          $(cliiz.toolbox.defaults.module+'[data-uname='+this.uname+']').dto(this);
        }
      );
      $(cliiz.toolbox.defaults.module,'.fclz-tools').draggable( 
        { 
          helper: 'clone' ,
          appendTo: 'body',
          revert: 'invalid',
          connectToSortable: '[data-partition]',
          start: function(e, ui){ $('[data-partition]').trigger('onActivate'); },
          stop: function(e, ui){ $('[data-partition]').trigger('onDeactivate'); }
        } 
      );
    },
    packages: function(){
      $('.fclz-package').click(
        function(){
          cliiz.loading.show();
          $.send( 
            ($(this).is('.clz-enabled') ? '/companies/disable_package.json' : '/companies/enable_package.json'),
            { name: $(this).data('uname') },
            function(){ location.reload(true) } 
          );
        }
      );
    },
    partitions: function(){
      $('[data-partition]')
        .bind( 'onActivate', function(){
          $(this).prepend('<div class="clz-placeholder">You can drop here.</div>'); 
        })
        .bind( 'onDeactivate', function(){ 
          $('.clz-placeholder', this).remove(); 
        })
        .sortable(
          {
            connectWith: '[data-partition]',
            placeholder: "clz-module-shadow",
            start: function(e, ui){ 
              $('[data-partition]').trigger('onDeactivate').trigger('onActivate'); 
            },
            stop: function(e, ui){ 
              $('[data-partition]').trigger('onDeactivate'); 
              $(cliiz.toolbox.defaults.module, this).remove();
            },
            beforeStop: cliiz.toolbox.module.add
          }
        );
    },
    blocks: function(data){
      cliiz.toolbox.defaults.blocks = data;
      cliiz.toolbox.video.disable();
      cliiz.toolbox.init.usedFeatures();
      cliiz.toolbox.block.activate($('[cliiz=module], [cliiz=package]'));
      cliiz.loading.hide();
    },
    usedFeatures: function(){
      $.each(
        cliiz.toolbox.defaults.modules,
        function(){
          $('[cliiz-uid='+this.uid+']').dto(this);
        }
      );
    }
  },
  module: {
    add: function(e, ui){
      if(ui.item.is('[cliiz=module]')){
        $('[cliiz=module]', this).attr('data-edited', true);
        $('[cliiz=module]', ui.item.parents('[data-partition]')).attr('data-edited', true);
        return true;
      }
      var name = ui.item.data('uname');
      var dto = { 
        setting: $.extend( true, {}, $('.fclz-tools > [data-uname='+name+']').dto().setting ), 
        component: { uname: name } 
      };
      var block = $(cliiz.toolbox.defaults.blocks[name]).hide().insertAfter(ui.placeholder);
      $('[cliiz=module]', block.parents('[data-partition]')).attr('data-edited', true);
      block.dto(dto);
      cliiz.toolbox.block.activate(block.fadeIn('slow'));
    },
    remove: function(block){
      if(block.attr('cliiz-uid')!=undefined)
        cliiz.toolbox.defaults.deleted.push(block.attr('cliiz-uid'));
    },
    postfilter: {
      init: function(block){
        var form = this;
        var dto = block.dto().setting;
        $('[name=size]', this).val( dto.size );
      },
      edit: function(block){
        var setting = block.dto().setting;
        $('[name=type]', this).val( [setting.type] );
      },
      update: function(block){
        var form = this;
        var dto = {
          size: $('[name=size]', this).val(),
          type: $('[name=type]:checked', this).val()
        };
        block.dto().setting = dto;
        cliiz.toolbox.block.refresh(block);
      }
    },
    content: {
      init: function(block){
        this.one(
          'onShow',
          function(){
            var block = $(this).data('cliiz.block');
            $('textarea', this)
              .val(block.dto().setting.content)
              .editor( { autoGrow: true, maxHeight: 500 } );
          }
        );
      },
      edit: function(block){
        $('textarea', this).wysiwyg('setContent', block.dto().setting.content);
      },
      update: function(block){
        var val = $('textarea', this).val();
        $('[cliiz=block]', block).html( val );
        block.dto().setting.content = val;
      }
    },
    youtube: {
      init: function(block){
        var form = this;
        var dto = block.dto().setting;
        $('.fclz-player', block).width(dto.width);
        $('.fclz-player', block).height(dto.height);
      },
      edit: function(block){
        var setting = block.dto().setting;
        $('[name=code]', this).val( [setting.code] );
        $('[name=width]', this).val( [setting.width] );
        $('[name=height]', this).val( [setting.height] );
      },
      update: function(block){
        var form = this;
        var code = $('[name=code]', this).val();
        if(code.indexOf('?')>-1)
          code = code.split('?')[1].split('&')[0].split('=')[1];
        else if(code.indexOf('youtu.be')>-1)
          code = code.split('.be/')[1];
        var dto = {
          code: code,
          width: $('[name=width]', this).val(),
          height: $('[name=height]', this).val()
        };
        block.dto().setting = dto;
        $('.fclz-player', block).width(dto.width);
        $('.fclz-player', block).height(dto.height);
      }
    },
    infoform: {
      init: function(block){
        var form = this;
        $('.fclz-fields .fclz-add', form).click( cliiz.toolbox.module.infoform.addRow );
        cliiz.toolbox.module.infoform.addRows(form, block.dto().setting.fields);
      },
      addRow: function(){
        var list = $(this).parents('.fclz-fields');
        var i = $('.fclz-field-name', list).size()+1;
        cliiz.toolbox.module.infoform.addRows( list, [[i, '', '', '']]);
      },
      addRows: function(block, rows){
        var button = $('.fclz-add', block);
        $.each(
          rows,
          function(k, v){
            var row = $('.fclz-templates > .fclz-field-name').clone().insertBefore(button);
            $('[name="field[][name]"]', row).val( v[3] ).attr('name', 'field['+v[0]+'][name]');
            $('.fclz-types', row).data('value', v[1]).attr('data-list', '[name="field['+v[0]+'][type]"]');
            $('[name="field[][type]"]', row).val( v[1] ).attr('name', 'field['+v[0]+'][type]');
            $('.fclz-validations', row).data('value', v[2]).attr('data-list', '[name="field['+v[0]+'][validation]"]');
            $('[name="field[][validation]"]', row).val( v[2] ).attr('name', 'field['+v[0]+'][validation]');
            $(row).lists();
          }
        );
      },
      edit: function(block){
        var form = this;
        var setting = block.dto().setting;
        return;
        $.each(
          setting.fields,
          function(k,v){
            $("[name="+v+"]", form).val(setting.names[v]);
            $('[value='+v+']:not(:checked)', form).click();
          }
        );
      },
      update: function(block){
        var setting = { fields: [] };
        $('.fclz-field-name', this).each(
          function(){
            var t = $(this);
            setting.fields.push( [ 0, $( '[type=hidden]', t).val(), '', $( '.fclz-name',t).val()] )
          }
        );
        block.dto().setting = setting;
        cliiz.toolbox.block.refresh(block);
      },
      typeChange: function(v){
        var row = $(this).parents('.fclz-field-name');
        var name = $('.fclz-name', row);
        if(name.val()=='') name.val(cliiz.toolbox.defaults.i18n[v]);
      }
    },
    whatever: {
      init: function(block){
      },
      edit: function(block){
      },
      update: function(block){
      }
    }
  },
  block: {
    activate: function(block){
      $(block)
        .each(
          function(){
            var menu = $('.fclz-templates .clz-editing').clone();
            var block = $(this).append(menu);
            $( '.fclz-delete', menu).click(
              function(){
                var form = block.data('cliiz.form');
                form.removeData('cliiz.block');
                block.removeData('cliiz.form');
                cliiz.toolbox.module.remove( block );
                form.remove();
                block.remove();
              }
            );
            $( '.fclz-setting', this).click(
              function(){
                cliiz.toolbox.form.of(block);
              }
            );
            cliiz.toolbox.form.connect( block );
          }
        );
    },
    refresh: function(block){
      $.send(
        '/components/block_for', 
        { id: block.attr('cliiz-uid'), uname: block.dto().component.uname, setting: block.dto().setting }, 
        function(d){ cliiz.toolbox.block.refreshed(block, d) } 
      );
    },
    refreshed: function(block, data){
      $('[cliiz=block]', block).html(data.content);
    }
  },
  form: {
    init: function(){
      $('.fclz-close').click( this.hide );
      $('.fclz-preview').click( this.update );
    },
    connect: function( block ){
      var name = block.dto().component.uname;
      var form = cliiz.toolbox.form.clone(name);
      block.data('cliiz.form', form);
      form.data('cliiz.block', block);
      cliiz.toolbox.module[name].init.call( form, block );
    },
    of: function(block){
      $('.fclz-formbox [formfor]').hide(); 
      var form = block.data('cliiz.form').show();
      cliiz.toolbox.module[form.attr('formfor')].edit.call(form, block);
      cliiz.toolbox.form.show();
      form.trigger('onShow');
    },
    clone: function(name){
      var form = $('.fclz-templates [formfor='+name+']').clone();
      $(form).checkboxes();
      $(form).radios();
      $('.fclz-forms').append(form);
      return form;
    },
    show: function(){
      $('.fclz-formbox').show();
      $('body').addClass('fixed');
    },
    hide: function(){
      $('.fclz-formbox').hide();
      $('body').removeClass('fixed');
    },
    update: function(block){
      var form = $('.fclz-forms [formfor]:visible');
      var block = form.data('cliiz.block');
      block.attr('data-edited', true);
      cliiz.toolbox.module[form.attr('formfor')].update.call( form, block ); 
      $('.fclz-close').click(); 
    }
  },
  video: {
    disable: function(){
      //fix template
      var utube = $(cliiz.toolbox.defaults.blocks.youtube);
      $(".fclz-templates .fclz-player").clone().insertAfter( $('object', utube) );
      $('object',utube).remove();
      cliiz.toolbox.defaults.blocks.youtube = utube.toHtml();
      //fix used components
      $('[cliiz-type=youtube] object').each(
        function(){
          var size = { h: $(this).css('height'), w: $(this).css('width') }
          $(".fclz-templates .fclz-player")
            .clone()
            .insertAfter( this )
            .css( { height: size.h, width: size.w});
        }
      ).remove();
    }
  },
  publish: function(){
    cliiz.loading.show();
    var modules = {};
    var i = 0;
    $('[data-partition]').each(function(){
      var block = $(this);
      $('[cliiz=module][data-edited]', block).each(function(){
        $(this).data('cliiz.module.dto').partition = block.attr('data-partition');
        $(this).data('cliiz.module.dto').page = cliiz.toolbox.defaults.page;
        modules[i++] = $(this).data('cliiz.module.dto');
      });
    });
    $.send( '/used_components/update.json', { modules: modules , removed: cliiz.toolbox.defaults.deleted }, function(){ location.reload(true) } );
  },
  themePreview: function(){
    $('.fclz-theme').hover( 
      function(){
        var src = ['url(',$(this).data('preview'),')'].join('');
        $('.fclz-theme-preview').css( 'background-image', src).show();
      },
      function(){
        $('.fclz-theme-preview').hide();
      }
    );
  },
  toggle: function(){
    var $this = $(this);
    $('[data-tool]').not(this).removeClass('clz-expanded');
    $this.addClass('clz-expanded');
    $('.fclz-submenu').not($($this.data('tool'))).hide();
    $($this.data('tool')).show();
    var size = eval($this.data('arrange'));
    cliiz.toolbox.rearrange(size);
    $('.fclz-toolbox').height(size);
    $('html').css('margin-top',size);
    cliiz.toolbox.resize();
  },
  sizes: { normal: 100, expanded: 172, extra: 240 },
  rearrange: function(size){
    $('.fclz-toolbox').height(size);
    $('html').css('margin-top',size);
  },
  resize: function(){
    var container = $('.fclz-themes');
    var mask = $('.fclz-thememask');
    mask.width( container.width() - 100 );
  },
  rotate: function(toRight){
    var rotator = $('.fclz-themeroller');
    var size = rotator.width();
    var left =  rotator.position().left;
    var diff = $('.fclz-thememask').width();
    var margin = diff-2*$('.clz-theme', rotator).width();

    var pos = left+((toRight? +1 : -1)*margin);
    if(pos>0) pos = 0;
    if(pos<-size+diff) pos = diff-size; 
    rotator.animate(  { 'left': left+(toRight? -10 : 10) }, 'fast' ).animate( { 'left': pos } );
  },
  rotateLeft: function(){
    cliiz.toolbox.rotate(true);
  },
  rotateRight: function(){
    cliiz.toolbox.rotate(false);
  }
});

});
