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
    deleted: [],
    prevForm: null,
    isEdited: false
  },
  initialize: function(){
    $(window).bind( 'beforeunload', cliiz.toolbox.confirms.leaving );
    $(window).unload(cliiz.toolbox.confirms.leaving);
    cliiz.loading.show();
    this.rearrange(this.sizes.normal)
    $('[data-tool]').click(this.toggle);
    $(window).resize(this.resize);
    this.init.theming();
    this.init.packages();
    this.init.partitions();
    this.form.init();
    $.send( '/coreapi/components/list_addables/', this.init.features, true);
    $('.fclz-publish').click( this.publish );
    $('.fclz-restore').click( this.restore );
    this.defaults.token = {};
    this.defaults.token[$('[name=csrf-param]').attr('content') ] = $('[name=csrf-token]').attr('content');
    cliiz.toolbox.walk.init();
  },
  init: {
    theming: function(){
      $('.fclz-themeleft').click(cliiz.toolbox.rotateLeft);
      $('.fclz-themeright').click(cliiz.toolbox.rotateRight);
      $('.fclz-theme').click(
        function(){
          cliiz.loading.show();
          $.send( '/coreapi/companies/temp_layout.json', { id: $(this).data('id') }, function(){ location.reload(true) }, true )
        }
      );
      cliiz.toolbox.themePreview();
    },
    features: function(data){
      $.send( '/coreapi/components/blocks/', cliiz.toolbox.init.blocks, true);
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
            ($(this).is('.clz-enabled') ? '/coreapi/companies/disable_package.json' : '/coreapi/companies/enable_package.json'),
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
            helper: function(){ return $("<div class='clz-drag-clone'>Drag & Drop</div>") },
            forceHelperSize: true,
            start: function(e, ui){
              $(this).prepend(ui.placeholder);
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
        cliiz.toolbox.block.edited( $('[cliiz=module]', ui.item.parents('[data-partition]')) );
        return true;
      }
      var name = ui.item.data('uname');
      var dto = { 
        setting: $.extend( true, {}, $('.fclz-tools > [data-uname='+name+']').dto().setting ), 
        component: { uname: name } 
      };
      var block = $(cliiz.toolbox.defaults.blocks[name]).hide().insertAfter(ui.placeholder);
      cliiz.toolbox.block.edited( $('[cliiz=module]', block.parents('[data-partition]')) );
      block.dto(dto);
      cliiz.toolbox.block.activate(block.fadeIn('slow'));
    },
    remove: function(block){
      if(block.attr('cliiz-uid')==undefined) return;
      cliiz.toolbox.defaults.deleted.push(block.attr('cliiz-uid'));
      $('.fclz-publish').show();
    },
    postfilter: {
      init: function(block){
        var form = this;
        var dto = block.dto().setting;
        $(this).vl('size', dto.size);
        $('[data-group=type]:has([value="'+dto.type+'"])', this).click();
      },
      edit: function(block){},
      update: function(block){
        var dto = {
          size: $(this).vl('size'),
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
        $(form).on( 'click', '.fclz-up, .fclz-down', cliiz.toolbox.module.infoform.move );
        cliiz.toolbox.module.infoform.addRows(form, block.dto().setting.fields);
        cliiz.toolbox.module.infoform.read(this, block);
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
            $('[name="field[][index]"]', row).val( v[0] ).attr('name', 'field['+v[0]+'][index]');
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
      },
      update: function(block){
        cliiz.toolbox.module.infoform.read(this, block);
        cliiz.toolbox.block.refresh(block);
      },
      read: function(form, block){
        var setting = { fields: [] };
        $('.fclz-field-name', form).each(
          function(){
            var t = $(this);
            setting.fields.push( [ $('.fclz-index', t).val(), $( '.fclz-types [type=hidden]', t).val(), '', $( '.fclz-name',t).val()] )
          }
        );
        block.dto().setting = setting;
      },
      move: function(){
        var row = $(this).parents('.fclz-field-name');
        $(this).is('.fclz-up')? row.insertBefore(row.prev()) : row.insertAfter(row.next(':not(.fclz-add)'));
      },
      typeChange: function(v){
        var row = $(this).parents('.fclz-field-name');
        var name = $('.fclz-name', row);
        if(name.val()=='') name.val(cliiz.toolbox.defaults.i18n[v]);
      }
    },
    locationmark: {
      init: function(block){
        var form = this;
        var dto = block.dto().setting;
        $(this).vl( 'latlng', dto.latlng.join(',') );
        $(this).vl( 'width', dto.viewport[0] );
        $(this).vl( 'height', dto.viewport[1] );
        $(this).vl( 'address', dto.address );
        $(this).vl( 'phone', dto.phone );
        $(this).vl( 'fax', dto.fax );
        cliiz.toolbox.module.locationmark.initGoogleMap( form, dto );
        cliiz.toolbox.module.locationmark.update.call( form, block ); 
      },
      edit: function(block){},
      update: function(block){
        var dto = { 
          latlng: $(this).vl('latlng').split(','),
          viewport: [ $(this).vl('width'), $(this).vl('height')],
          address: $(this).vl('address'),
          phone: $(this).vl('phone'),
          fax: $(this).vl('fax')
        };
        block.dto().setting = dto;
        var $map = $('.cliiz-map', block).width( dto.viewport[0] ).height( dto.viewport[1] );
        var $win = $('.cliiz-location:hidden', block);
        pos = new google.maps.LatLng(dto.latlng[0], dto.latlng[1]);
        var opts = {
          zoom: 15,
          center: new google.maps.LatLng(dto.latlng[0], dto.latlng[1]),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false
        };
        var map = new google.maps.Map($map.get(0), opts);
        var marker = new google.maps.Marker( );
        marker.setOptions( { map: map, position: opts.center } );
        var cnt = $win.clone().show();
        (dto.address=='')
          ? $('.cliiz-address', cnt).remove()
          : $('.cliiz-address span', cnt).text( dto.address );
        (dto.phone=='')
          ? $('.cliiz-phone', cnt).remove()
          : $('.cliiz-phone span', cnt).text( dto.phone );
        (dto.fax=='')
          ? $('.cliiz-fax', cnt).remove()
          : $('.cliiz-fax span', cnt).text( dto.fax );
        var win = new google.maps.InfoWindow( { content: cnt.get(0), position: opts.center } );
        win.open( map );
      },
      initGoogleMap: function(form, dto){
        var geocoder = new google.maps.Geocoder();
        var marker = new google.maps.Marker( { draggable: true } );
        google.maps.event.addListener(marker, 'dragend', function(){ 
          $('[name=latlng]', form).val( this.getPosition().lat()+','+this.getPosition().lng() );
        });
        var opts = {
          zoom: 15,
          center: new google.maps.LatLng(dto.latlng[0], dto.latlng[1]),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false
        };
        var map = new google.maps.Map($('.fn-map-preview', form).get(0), opts);
        var decode = function(add){
          geocoder.geocode( 
            { address: add },
            function(res){
              var pos = res[0].geometry.location;
              $('[name=latlng]', form).val( pos.lat()+','+pos.lng() );
              map.panTo( pos );
              marker.setOptions( { map: map, position: pos } );
            }
          );
        }
        $('.fclz-locate', form).click(
          function(){
            decode( $('[name=address]', form).val() );
          }
        ).click();
        form.bind('onShow', function(){ var c = map.getCenter(); google.maps.event.trigger(map, 'resize'); map.setCenter(c); });
      }
    },
    blog: {
      form: null,
      init: function(block){
        cliiz.toolbox.module.blog.form = this;
        $('[formfor=post]').one(
          'onShow',
          function(){
            $('[formfor=post] .fclz-editor').editor( { autoGrow: true, maxHeight: 500 } );
          }
        );
        var date = $("[name='post[publish_date]']").datepicker();
        $('.fclz-post-date').click( function(){date.focus()} );
        $('.fclz-change-post-image').click( function(){
          cliiz.toolbox.module.gallery.browser('post', cliiz.toolbox.module.blog.post.back);
        });
        $('.fclz-new-post').click( cliiz.toolbox.module.blog.post.form );
        $.send( '/coreapi/blogging.json', {_method:'get'}, cliiz.toolbox.module.blog.list );
        $('.fclz-posts').on( 'click', '.fclz-edit', cliiz.toolbox.module.blog.post.edit );
      },
      post: {
        form: function(d){
          var form = $('[formfor=post]');
          if(d.type!=undefined){
            d = { id: '', title: '', summary: '', content: '', human_publish_date: '' }
          }
          form.fields( 'post', ['id', 'title', 'summary', 'content', 'image_id'], d );
          $('.fclz-post-image').attr('src', d.thumb);
          $('.fclz-editor', form).wysiwyg('setContent', d.content);
          form.vl('post[publish_date]', d.human_publish_date);
          cliiz.toolbox.form.toggle(form);
          form.trigger('onShow');
          cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-back');
          cliiz.toolbox.form.back = cliiz.toolbox.module.blog.post.cancel;
          cliiz.toolbox.form.save = cliiz.toolbox.module.blog.post.save;
        },
        edit: function(){
          var row = $(this).parents('.fclz-post');
          $.send( '/coreapi/blogging/'+row.data('dbid')+'/edit.json', {_method:'get'}, cliiz.toolbox.module.blog.post.form );
        },
        back: function(){
          cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
          cliiz.toolbox.form.toggle(cliiz.toolbox.defaults.prevForm);
        },
        cancel: function(){
          var form = $('[formfor=blog]');
          cliiz.toolbox.form.toggle(form);
          form.trigger('onShow');
          cliiz.toolbox.form.buttons(true);
        },
        save: function(){
          var form = $('[formfor=post]');
          var fields = form.fields( 'post', ['id', 'title', 'summary', 'content', 'publish_date', 'image_id'])
          if(form.vl('post[id]')==''){
            $.send( '/coreapi/blogging.json', fields, cliiz.toolbox.module.blog.post.saved );
          }else{
            fields._method = 'put';
            $.send( '/coreapi/blogging/'+form.vl('post[id]')+'.json', fields, cliiz.toolbox.module.blog.post.saved );
          }
          $('.fclz-back').click();
        },
        saved: function(d){
          var row = cliiz.toolbox.module.blog.form.find('[data-dbid='+d.id+']');
          var newRow = cliiz.toolbox.module.blog.list(d, true);
          if(row.size()==0) return newRow.insertAfter($('.fclz-posts .fclz-header', cliiz.toolbox.module.blog.form));
          newRow.insertBefore(row);
          row.remove();
        }
      },
      edit: function(block){
      },
      update: function(block){
        cliiz.toolbox.block.refresh(block);
      },
      list: function(data, raw){
        var rows = $('.fclz-templates > .fclz-post').template( data );
        if(raw!=true)
          rows.insertAfter('.fclz-posts .fclz-header');
        return rows;
      }
    },
    gallery: {
      currentFolder: null,
      init: function(block){
        cliiz.toolbox.module.gallery.common();
        var dto = block.dto().setting;
        $('[data-group=display]:has([value="'+dto.display+'"])', this).click();
      },
      edit: function(block){
        cliiz.toolbox.module.gallery.load('Gallery');
      },
      update: function(block){
        var dto = {
          display: $('[name=display]:checked', this).val()
        };
        block.dto().setting = dto;
        cliiz.toolbox.block.refresh(block);
      },
      load: function(folder){
        var setting = $('[formfor=gallery] .fclz-more-options');
        (folder=='Gallery')?  setting.show() : setting.hide();
        $('.fclz-window').empty();
        cliiz.toolbox.module.gallery.currentFolder = folder;
        $.send('/coreapi/files', $.extend( { folder: folder, _method: 'get' }, cliiz.toolbox.defaults.token), cliiz.toolbox.module.gallery.list);
      },
      browser: function(target, cancel){
        cliiz.toolbox.module.gallery.select.current = cliiz.toolbox.module.gallery.select[target];
        cliiz.toolbox.form.buttons(false, '.fclz-back');
        cliiz.toolbox.form.back = $.isFunction(cancel)? cancel : cliiz.toolbox.module.gallery.cancel;
        cliiz.toolbox.defaults.prevForm = $('.fclz-forms [formfor]:visible');
        var form = $('.fclz-forms [formfor=gallery]');
        if(form.size()==0){
          form = $('.fclz-templates [formfor=gallery]').clone().appendTo('.fclz-forms');
          cliiz.toolbox.module.gallery.common();
        }
        cliiz.toolbox.form.toggle(form);
        cliiz.toolbox.module.gallery.load(null);
      },
      common: function(){
        $('.fclz-window').on( 'click', '.fclz-select', function(){ cliiz.toolbox.module.gallery.select.current.call(this) } );
        $('.fclz-upload').fileupload({
          dataType: 'json',
          add: function(e, data){ data.formData = $.extend( { folder: cliiz.toolbox.module.gallery.currentFolder }, cliiz.toolbox.defaults.token); data.submit() },
          start: function (e) { $('.fclz-progress').show() },
          done: function (e, data) { 
            $('.fclz-progress').hide();
            cliiz.toolbox.module.gallery.list(data.result) 
          },
          progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('.fclz-progress').show();
            $('.fclz-progress .fclz-bar').css( 'width', progress + '%' );
          }
        });
      },
      list: function(data){
        var file = $('.fclz-templates > .fclz-file').template( data );
        file.prependTo('.fclz-forms .fclz-window');
      },
      select: {
        common: function(original){
          cliiz.toolbox.module.gallery.cancel();
          var img = $( 'img', $(this).parents('.fclz-file')).attr('src');
          return original? img.replace('/thumb/', '/original/') : img;
        },
        editor: function(){
          var img = cliiz.toolbox.module.gallery.select.common.call(this, true);
          var editor = $('.fclz-forms [formfor]:visible .fclz-editor');
          var cnt = editor.wysiwyg('getContent');
          editor.wysiwyg('setContent', cnt.replace('#cliiz-img-placeholder', img));
        },
        setting: function(){
          $('.fclz-logo').attr('src', cliiz.toolbox.module.gallery.select.common.call(this));
          $('[formfor=setting]').vl('site[logo]', cliiz.toolbox.module.gallery.select.common.call(this, true));
          cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
        },
        post: function(){
          var img = cliiz.toolbox.module.gallery.select.common.call(this);
          cliiz.toolbox.form.back = cliiz.toolbox.module.blog.post.cancel;
          $('.fclz-post-image').attr('src', img);
          $('[formfor=post]').vl('post[image_id]', $(this).parents('.fclz-file').data('dbid'));
          cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-back');
        }
      },
      cancel: function(){
        cliiz.toolbox.form.buttons(true);
        cliiz.toolbox.form.toggle(cliiz.toolbox.defaults.prevForm);
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
        '/coreapi/components/block_for', 
        { id: block.attr('cliiz-uid'), uname: block.dto().component.uname, setting: block.dto().setting }, 
        function(d){ cliiz.toolbox.block.refreshed(block, d) } 
      );
    },
    refreshed: function(block, data){
      $('[cliiz=block]', block).html(data.content);
    },
    edited: function(block){
      block.attr('data-edited', true);
      cliiz.toolbox.defaults.isEdited = true;
      $('.fclz-publish').show();
    }
  },
  form: {
    init: function(){
      $('.fclz-close').click( this.hide );
      $('.fclz-preview').click( this.update );
      $('.fclz-back').click( function(){ cliiz.toolbox.form.back.call() } );
      $('.fclz-save').click( function(){ cliiz.toolbox.form.save.call() } );
      $('[data-open-form]').click( this.showForButton );
      this.menu.init();
      this.setting.init();
      this.contacts.init();
    },
    connect: function( block ){
      var name = block.dto().component.uname;
      var form = cliiz.toolbox.form.clone(name);
      block.data('cliiz.form', form);
      form.data('cliiz.block', block);
      cliiz.toolbox.module[name].init.call( form, block );
    },
    showForButton: function(){
      var name = $(this).data('open-form');
      cliiz.toolbox.form.toggle( $(['[formfor=',name,']'].join('')) );
      cliiz.toolbox.form[name].edit();
      cliiz.toolbox.form.show();
    },
    toggle: function(form){
      $('.fclz-formbox [formfor]').hide(); 
      form.show();
    },
    of: function(block){
      var form = block.data('cliiz.form')
      cliiz.toolbox.form.buttons(true);
      cliiz.toolbox.form.toggle(form);
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
    save: $.noop,
    back: $.noop,
    update: function(block){
      var form = $('.fclz-forms [formfor]:visible');
      var block = form.data('cliiz.block');
      cliiz.toolbox.block.edited( block );
      cliiz.toolbox.module[form.attr('formfor')].update.call( form, block ); 
      $('.fclz-close').click(); 
    },
    buttons: function(showMains, buttons){
      $('.fclz-preview, .fclz-close, .fclz-save, .fclz-back').hide();
      if(showMains) $('.fclz-preview, .fclz-close').show();
      if(buttons!='') $(buttons).show();
    },
    menu: {
      init: function(){
        var form = $('[formfor=menu]');
        $('.fclz-add', form).click( this.addPage );
        $(form).on( 'click', '.fclz-up, .fclz-down', this.move );
        $(form).on( 'click', '.fclz-delete', this.remove );
        $(form).on( 'click', '.fclz-disable, .fclz-enable', this.disenable );
      },
      addPage: function(){
        var item = $('.fclz-templates .fclz-menu-item').template( [$(this).parents('.fclz-pages').find('.fclz-menu-item').size()] );
        item.insertBefore(this);
      },
      move: function(){
        var row = $(this).parents('.fclz-menu-item');
        $(this).is('.fclz-up')? row.insertBefore(row.prev()) : row.insertAfter(row.next(':not(.fclz-add)'));
      },
      edit: function(){
        cliiz.toolbox.form.save = cliiz.toolbox.form.menu.save;
        cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
      },
      save: function(){
        var menu = [];
        $('.fclz-forms [formfor=menu] .fclz-menu-item ').each(
          function(){
            var row = $(this);
            menu.push(row.fields( 'menu', ['name', 'uname', 'disable', 'delete'] ));
          }
        );
        $.send('/coreapi/menu', { items: menu }, cliiz.toolbox.form.menu.update);
      },
      update: function(data){
        $('[data-cliiz=menu]').html( $(data.menu).html() );
        cliiz.toolbox.form.hide();
      },
      remove: function(){
        var item = $(this).parents('.fclz-menu-item');
        item.hide().vl('menu[delete]', 'true');
      },
      disenable: function(){
        var item = $(this).parents('.fclz-menu-item');
        if($(this).is('.fclz-disable'))
          item.addClass('clz-disabled').vl('menu[disable]', 'true');
        else
          item.removeClass('clz-disabled').vl('menu[disable]', 'false');
      }
    },
    setting: {
      init: function(){
        $('.fclz-change-logo').click( function(){
          cliiz.toolbox.module.gallery.browser('setting', cliiz.toolbox.form.setting.cancel);
        });
      },
      edit: function(data){
        cliiz.toolbox.form.save = cliiz.toolbox.form.setting.save;
        cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
      },
      save: function(){
        var setting = $('[formfor=setting]').fields( 'site', 'display_name description logo keywords facebookpage twitter google_analytic google_verify'.split(' '))
        $.send('/coreapi/setting', { setting: setting }, cliiz.toolbox.form.setting.update);
        cliiz.toolbox.form.hide();
      },
      cancel: function(){
        cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
        cliiz.toolbox.form.toggle(cliiz.toolbox.defaults.prevForm);
      },
      update: function(data){
      }
    },
    contacts: {
      init: function(){
        var form = $('[formfor=contacts]');
        $.send('/coreapi/contacts/all', { _method: 'get' }, cliiz.toolbox.form.contacts.list, true);
        $('.fclz-contacts', form).on( 'click', '.fclz-view', cliiz.toolbox.form.contacts.expand );
        $('.fclz-contacts', form).on( 'click', '.fclz-shrink', cliiz.toolbox.form.contacts.shrink );
        $('.fclz-contacts', form).on( 'click', '.fclz-delete', cliiz.toolbox.form.contacts.remove );
      },
      edit: function(data){
        cliiz.toolbox.form.save = cliiz.toolbox.form.contacts.save;
        cliiz.toolbox.form.buttons(false, '.fclz-save, .fclz-close');
      },
      list: function(data){
        $.each( data,
          function(k, v){
            if(v.mod_infoform.length==0) return true;
            var block = $('.fclz-templates > .fclz-contact-list').clone();
            var rows = $('.fclz-templates > .fclz-contact');
            cliiz.toolbox.form.contacts.setDetails( v.setting.fields, rows );
            $.each( [0,1,2], function(m,i){ cliiz.toolbox.form.contacts.setColumn(v.setting.fields[i], block, rows); } );
            rows.template( v.mod_infoform ).insertAfter($('.fclz-header', block));
            block.appendTo('.fclz-contacts');
          }
        );
      },
      setColumn: function(column, block, rows){
        if(!column) return;
        $("<label class='clz-label250 clz-pad10'>"+column[3]+"</label>").appendTo($('.fclz-header', block));
        $("<label class='clz-label250 clz-pad10'>%#"+column[0]+"%</label>").insertBefore('.fclz-details', rows);
      },
      setDetails: function(fields, tpl){
        var details = '';
        $.each(fields, function(k, v){
          details += ["<div><label class='clz-label200'>", v[3] ,"</label><label>%#", v[0], "%</label></div>"].join('');
        });
        return $('.fclz-details', tpl).html( details )
      },
      expand: function(){
        $(this).parents('.fclz-contact').addClass('clz-detailed');
      },
      shrink: function(){
        $(this).parents('.fclz-contact').removeClass('clz-detailed');
      },
      remove: function(){
        var id = $(this).parents('.fclz-contact').data('dbid');
        $.send('/coreapi/contacts/'+id, { _method: 'delete' });
        $(this).parents('.fclz-contact').remove();
      }
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
  walk: {
    init: function(){
      if(!cliiz.toolbox.defaults.letsWalk) return $('.fclz-walk').remove();
      $('.fclz-walk [next-step]').click( function(){ cliiz.toolbox.walk[$(this).attr('next-step')](); } );
      cliiz.toolbox.walk.step0();
    },
    change: function(step){
      $('.fclz-walk').removeClass('clz-step0 clz-step1 clz-step2 clz-step3 clz-step4 clz-step5 clz-step6 clz-step7').addClass(step);
    },
    step0: function(){
      cliiz.toolbox.walk.change('clz-step0');
    },
    step1: function(){
      cliiz.toolbox.walk.change('clz-step1');
      $('[data-tool=".fclz-tools"]').click();
    },
    step2: function(){
      cliiz.toolbox.walk.change('clz-step2');
      $('.fclz-submenu').hide();
      $('[data-tool]').removeClass('clz-expanded');
      cliiz.toolbox.rearrange(cliiz.toolbox.sizes.normal);
    },
    step3: function(){
      cliiz.toolbox.walk.change('clz-step3');
      $('[data-tool=".fclz-packages"]').click();
    },
    step4: function(){
      cliiz.toolbox.walk.change('clz-step4');
      $('[data-tool=".fclz-themes"]').click();
    },
    step5: function(){
      cliiz.toolbox.walk.change('clz-step5');
      $('.fclz-submenu').hide();
      $('[data-tool]').removeClass('clz-expanded');
      cliiz.toolbox.rearrange(cliiz.toolbox.sizes.normal);
    },
    step6: function(){
      cliiz.toolbox.walk.change('clz-step6');
      $('.fclz-publish').show();
    },
    step7: function(){
      cliiz.toolbox.walk.change('clz-step7');
      $('.fclz-publish').hide();
    },
    step8: function(){
      cliiz.toolbox.walk.change('clz-step8');
      $.send('/coreapi/walked');
    }
  },
  restore: function(){
    cliiz.loading.show();
    $.send('/coreapi/restore', function(){ location.reload(true) }, true );
  },
  publish: function(){
    cliiz.loading.show();
    var modules = {};
    var i = 0;
    $('[data-partition]').each(function(){
      var block = $(this);
      $('[data-edited]', block).each(function(){
        $(this).data('cliiz.module.dto').partition = block.attr('data-partition');
        $(this).data('cliiz.module.dto').page = cliiz.toolbox.defaults.page;
        modules[i++] = $(this).data('cliiz.module.dto');
      });
    });
    $.send( '/coreapi/used_components/update.json', { modules: modules , removed: cliiz.toolbox.defaults.deleted }, function(){ cliiz.toolbox.defaults.isEdited = false; location.reload(true) } );
  },
  confirms: {
    leaving: function(){
      if( !cliiz.toolbox.defaults.isEdited )      
        return;
      cliiz.toolbox.form.toggle( $('[formfor=confirmation]') );
      cliiz.toolbox.form.buttons(false);
      cliiz.toolbox.form.show();
      return 'Do you want to save your changes before going to other pages?';
    }
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
    if($this.is('.clz-expanded')){
      $('[data-tool]').removeClass('clz-expanded');
      $('.fclz-submenu').hide();
      cliiz.toolbox.rearrange(cliiz.toolbox.sizes.normal);
      return;
    }
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
