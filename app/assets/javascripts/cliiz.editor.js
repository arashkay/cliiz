$(function(){

$.fn.dto = function(val){
  if(val!=undefined)
    this.data('cliiz.module.dto', val);
  return this.data('cliiz.module.dto');
}
/*
cliiz.mini.modules
cliiz.mini.blocks
cliiz.mini.page

.fclz-module    'cliiz.module.dto'  = component
block           'cliiz.module.dto'  = used_component
block           'cliiz.form'        = form
form            'cliiz.block'       = block

*/
cliiz.mini = $.namespace({
  toolbox: $('.fclz-toolbox'),
  header: $('.fclz-toolbox .fclz-header'),
  module: '.fclz-module-box',
  showLoading: function(){
    var loading = $('.fclz-blocker').data('loading.count');
    $('.fclz-blocker').data('loading.count', (loading==undefined?1:++loading) ).show();
  },
  hideLoading: function(){
    var loading = $('.fclz-blocker').data('loading.count');
    if(loading-1==0)
      $('.fclz-blocker').hide();
    $('.fclz-blocker').data('loading.count', (loading==0?0:--loading) );
  },
  initLayouts: function(){
    $('.fclz-layouts').scroller();
    $('.fclz-layout').click(
      function(){
        cliiz.mini.showLoading();
        $.send( '/companies/temp_layout.json', { id: $(this).attr('layoutid') }, function(){ location.reload(true) } )
      }
    )
  },
  initPackages: function(){
    $('.fclz-enable, .fclz-disable', '.fclz-packages').click(
      function(){
        cliiz.mini.showLoading();
        $.send( 
          ($(this).is('.fclz-disable') ? '/companies/disable_package.json' : '/companies/enable_package.json'),
          { name: $(this).parents('.fclz-package').attr('uname') },
          function(){ location.reload(true) } 
        );
      }
    );
  },
  initFeatures: function(data){
    $.send( '/components/blocks/', cliiz.mini.initBlocks);
    $('.fclz-modules').template(data, { keepOrigin: false}).find(cliiz.mini.module).show();
    $.each(
      data,
      function(){
        $(cliiz.mini.module+'[uname='+this.uname+']').dto(this);
      }
    );
    $(cliiz.mini.module,'.fclz-modules').draggable( 
      { 
        helper: 'clone' ,
        appendTo: 'body',
        revert: 'invalid',
        connectToSortable: '[data-partition]',
        start: function(e, ui){
          $('[data-partition]').trigger('onActivate');
        },
        stop: function(e, ui){
          $('[data-partition]').trigger('onDeactivate');
        }
      } 
    );
  },
  initPartitions: function(){
    $('[data-partition]')
      .bind( 'onActivate', function(){
        $(this).append('<div class="clz-placeholder">You can drop here.</div>'); 
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
            $(cliiz.mini.module, this).remove();
          },
          beforeStop: cliiz.mini.addModule
        }
      );
  },
  initBlocks: function(data){
    cliiz.mini.blocks = data;
    cliiz.mini.videoFix();
    cliiz.mini.initUsedFeatures();
    cliiz.mini.activateBlock($('[cliiz=module], [cliiz=package]'));
    cliiz.mini.hideLoading();
  },
  initUsedFeatures: function(){
    $.each(
      this.modules,
      function(){
        $('[cliiz-uid='+this.uid+']').dto(this);
      }
    );
  },
  videoFix: function(){
    //fix template
    var utube = $(cliiz.mini.blocks.youtube);
    $(".fclz-templates .fclz-player").clone().insertAfter( $('object', utube) );
    $('object',utube).remove();
    cliiz.mini.blocks.youtube = utube.toHtml();
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
  },
  activateBlock: function(block){
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
              cliiz.mini.removeModule( block );
              form.remove();
              block.remove();
            }
          );
          $( '.fclz-setting', this).click(
            function(){
              cliiz.mini.formOf(block);
            }
          );
          cliiz.mini.connectToForm( block );
        }
      );
  },
  addModule: function(e, ui){
    if(ui.item.is('[cliiz=module]')){
      $('[cliiz=module]', this).attr('data-edited', true);
      $('[cliiz=module]', ui.item.parents('[data-partition]')).attr('data-edited', true);
      return true;
    }
    var name = ui.item.attr('uname');
    var dto = { 
      setting: $.extend( true, {}, $('.fclz-modules > [uname='+name+']').dto().setting ), 
      component: { uname: name } 
    };
    var block = $(cliiz.mini.blocks[name]).hide().insertAfter(ui.placeholder);
    $('[cliiz=module]', block.parents('[data-partition]')).attr('data-edited', true);
    block.dto(dto);
    cliiz.mini.activateBlock(block.fadeIn('slow'));
  },
  connectToForm: function( block ){
    var name = block.dto().component.uname;
    var form = $('.fclz-templates [formfor='+name+']').clone();
    block.data('cliiz.form', form);
    form.data('cliiz.block', block);
    $('.fclz-forms').append(form);
    cliiz.mini.initialize[name].call( form, block );
  },
  formOf: function(block){
    $('.fclz-formbox [formfor]').hide(); 
    var form = block.data('cliiz.form').show();
    cliiz.mini.edit[form.attr('formfor')].call(form, block);
    cliiz.mini.showForm();
    form.trigger('onShow');
  },
  showForm: function(){
    var top = $(window).scrollTop()+50;
    var ph = $('body').height();
    var fh = $('.fclz-formbox').height();
    var bottom = 50+fh;
    (top+fh>ph&&bottom<ph)
      ? $('.fclz-formbox').css( { top: ph-bottom } )
      : $('.fclz-formbox').css( { top: top } );
    $('.fclz-formbox, .fclz-formblocker').show();
  },
  initialize: {
    gallery: function(block){
      $('.fclz-add-album', this).click( cliiz.gallery.addAlbum );
      $.send( '/panel/gallery.json', cliiz.gallery.browse );
      $.send( '/panel/files.json', cliiz.gallery.files );
      $('.fclz-file-browser', this).scroller();
      $('.fclz-gallery-browser', this).scroller();
      $('.fclz-gallery-browser .fclz-images', this).sortable(
        {
          placeholder: "clz-file-shadow",
          start: function(e, ui){
            $(this).addClass('clz-sorting');
          },
          stop: function(e, ui){ 
            $(this).removeClass('clz-sorting');
            $('.fclz-file', this).remove();
          },
          beforeStop: cliiz.gallery.sortOrAdd
        }
      );
      $('.fclz-formbox .fclz-cover')
        .droppable({ 
          accept: '.fclz-file', 
          drop: function(e, ui){
            if(cliiz.gallery.currentAlbum==undefined) return;
            $(this).attr('src', ui.draggable.find('img').attr('src'));
            $.send( '/panel/gallery/update', { image: { id: cliiz.gallery.currentAlbum, image_id: ui.draggable.attr('fileid') } } );
          } 
        })
    },
    blog: function(block){},
    postfilter: function(block){
      var form = this;
      var dto = block.dto().setting;
      $('[name=size]', this).val( dto.size );
    },
    youtube: function(block){
      var form = this;
      var dto = block.dto().setting;
      $('.fclz-player', block).width(dto.width);
      $('.fclz-player', block).height(dto.height);
    },
    content: function(block){
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
    infoform: function(block){
      var form = this;
      $('.fclz-field ', form).change( 
        function(){
          var $this = $(this);
          var f = $("[name="+$this.val()+"]", form).parents('.fclz-field-name');
          ($this).is(':checked') ? f.show() : f.hide();
        }
      );
    },
    locationmark: function(block){
      var form = this;
      var dto = block.dto().setting;
      $('[name=latlng]', this).val( dto.latlng.join(',') );
      $('[name=width]', this).val( dto.viewport[0] );
      $('[name=height]', this).val( dto.viewport[1] );
      $('[name=address]', this).val( dto.address );
      $('[name=phone]', this).val( dto.phone );
      $('[name=fax]', this).val( dto.fax );
      var geocoder = new google.maps.Geocoder();
      var marker = new google.maps.Marker( { draggable: true } );
      google.maps.event.addListener(marker, 'dragend', function(){ 
        $('[name=latlng]', form).val( this.getPosition().lat()+','+this.getPosition().lng() );
      });
      var opts = {
        zoom: 15,
        center: new google.maps.LatLng(dto.latlng[0], dto.latlng[1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP
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
      cliiz.mini.update.locationmark.call( form, block ); 
    }
  },
  edit: {
    gallery: function(block){
      cliiz.mini.fixed(true);
    },
    postfilter: function(block){
      var setting = block.dto().setting;
      $('[name=type]', this).val( [setting.type] );
    },
    youtube: function(block){
      var setting = block.dto().setting;
      $('[name=code]', this).val( [setting.code] );
      $('[name=width]', this).val( [setting.width] );
      $('[name=height]', this).val( [setting.height] );
    },
    content: function(block){
      $('textarea', this).wysiwyg('setContent', block.dto().setting.content);
    },
    infoform: function(block){
      var form = this;
      var setting = block.dto().setting;
      $.each(
        setting.fields,
        function(k,v){
          $("[name="+v+"]", form).val(setting.names[v]);
          $('[value='+v+']:not(:checked)', form).click();
        }
      );
    },
    locationmark: function(block){ }
  },
  update: {
    gallery: function(){
    },
    content: function(block){
      var val = $('textarea', this).val();
      $('[cliiz=block]', block).html( val );
      block.dto().setting.content = val;
    },
    infoform: function(block){
      var content = $('[cliiz=block]', block)
      $('.cliiz-field', content).remove();
      var setting = { fields: [], names: {} };
      $('.fclz-field-name:visible input', this).each(
        function(){
          var t = $(this);
          var name = t.attr('name');
          var label = t.val();
          setting.names[name] = label;
          setting.fields.push(name)
        }
      );
      block.dto().setting = setting;
      cliiz.mini.refreshBlock(block);
    },
    postfilter: function(block){
      var form = this;
      var dto = {
        size: $('[name=size]', this).val(),
        type: $('[name=type]:checked', this).val()
      };
      block.dto().setting = dto;
      cliiz.mini.refreshBlock(block);
    },
    youtube: function(block){
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
    },
    locationmark: function(block){
      var dto = { 
        latlng: $('[name=latlng]', this).val( ).split(','),
        viewport: [ $('[name=width]', this).val(), $('[name=height]', this).val()],
        address: $('[name=address]', this).val(),
        phone: $('[name=phone]', this).val(),
        fax: $('[name=fax]', this).val( )
      };
      block.dto().setting = dto;
      var $map = $('.cliiz-map', block).width( dto.viewport[0] ).height( dto.viewport[1] );
      var $win = $('.cliiz-location:hidden', block);
      pos = new google.maps.LatLng(dto.latlng[0], dto.latlng[1]);
      var opts = {
        zoom: 15,
        center: new google.maps.LatLng(dto.latlng[0], dto.latlng[1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP
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
    }
  },
  removeModule: function(block){
    if(block.attr('cliiz-uid')!=undefined)
      cliiz.mini.deleted.push(block.attr('cliiz-uid'));
  },
  refreshBlock: function(block){
    $.send(
      '/components/block_for', 
      { id: block.attr('cliiz-uid'), uname: block.dto().component.uname, setting: block.dto().setting }, 
      function(d){ cliiz.mini.refreshedBlock(block, d) } 
    );
  },
  refreshedBlock: function(block, data){
    console.log(data);
    $('[cliiz=block]', block).html(data.content);
  },
  deleted: [],
  publish: function(){
    cliiz.mini.showLoading();
    var modules = {};
    var i = 0;
    $('[data-partition]').each(function(){
      var block = $(this);
      $('[cliiz=module][data-edited]', block).each(function(){
        $(this).data('cliiz.module.dto').partition = block.attr('data-partition');
        $(this).data('cliiz.module.dto').page = cliiz.mini.page;
        modules[i++] = $(this).data('cliiz.module.dto');
      });
    });
    $.send( '/used_components/update.json', { modules: modules , removed: cliiz.mini.deleted }, function(){ location.reload(true) } );
  },
  close: function(){
    cliiz.mini.showLoading();
    $.send( 
      '/companies/reset_temp_layout.json', 
      function(){ 
        document.location = '/panel';
      }
    );
  },
  dynamicMask: function(target, pos){
    $('#fclz-walk-top').css( { height: pos.top-5 } );
    $('#fclz-walk-left').css( { width: pos.left-5, top: pos.top-5 } );
    $('#fclz-walk-right').css( { left: pos.left+target.width()+5, top: pos.top-5 } );
    $('#fclz-walk-bottom').css( { left: pos.left-5, top: pos.top+target.height()+5, width: target.width()+10 } );
  },
  walk: function(){
    $('.fclz-skip').click(cliiz.mini.skip);
    $('body').addClass('clz-walkthrough');
    $('.fclz-walk').addClass('clz-step1')
      .bind('clz-step3',function(){
        var target = $('[data-partition=1] [cliiz=module]');
        var pos = target.offset();
        cliiz.mini.dynamicMask(target, pos);
        $('#fclz-tooltip').css( { left: pos.left+target.width()-$('#fclz-tooltip').width()-10, top: pos.top-$('#fclz-tooltip').height()-20 } );
      })
      .bind('clz-step4',function(){
        $('[data-partition] [cliiz-type=content]:first .fclz-setting').click();
        var target = $('.fclz-formbox');
        var pos = target.offset();
        cliiz.mini.dynamicMask(target, pos);
        $('#fclz-tooltip').css( { left: pos.left+target.width()-$('#fclz-tooltip').width()-40, top: pos.top+target.height()-$('#fclz-tooltip').height()-70 } );
      })
      .bind('clz-step2',function(){
        $('.fclz-cancel').click(); 
      })
      .bind('clz-step5',function(){
        cliiz.mini.skip();
      })
      .find( '.fclz-next' ).click(
      function(){
        $('#fclz-walk-top, #fclz-walk-left, #fclz-walk-right, #fclz-walk-bottom, #fclz-tooltip').css( { left: '', top: '', right: '', bottom: '', height: '', width: '' });
        $('.fclz-walk').removeClass('clz-step1 clz-step2 clz-step3 clz-step4 clz-step5 clz-step6').addClass($(this).attr('next-step')).trigger($(this).attr('next-step'));
      }
    );
  },
  skip: function(){
    $('body').removeClass('clz-walkthrough');
    $('.fclz-walk').remove();
    $.send( '/panel/first_edit_done' );
  },
  init: function(){
    if(this.letsWalk) this.walk();
    $('.fclz-swing').click(
      function(){
        $('.fclz-globalbox').toggleClass('clz-at-left');
      }
    );
    $('.fclz-toolbox').draggable( { handle: this.header , containment: 'body' } );
    this.showLoading();
    this.initLayouts();
    this.initPackages();
    this.initPartitions();
    $.send( '/components/list_addables/', this.initFeatures, true);
    $('.fclz-publish').click( this.publish );
    $('.fclz-close').click( this.close );
    $('.fclz-cancel').click( 
      function(){ 
        $('.fclz-formbox, .fclz-formblocker').hide(); 
        cliiz.mini.fixed(false);
      } 
    );
    $('.fclz-update').click( 
      function(){
        var form = $('.fclz-forms [formfor]:visible');
        var block = form.data('cliiz.block');
        block.attr('data-edited', true);
        cliiz.mini.update[form.attr('formfor')].call( form, block ); 
        $('.fclz-cancel').click(); 
      } 
    );
    $('.fclz-toolbox [data-toolbox]').click(function(){
      if($('.fclz-toolbox').is("."+$(this).attr('data-toolbox')) && ($('.fclz-toolbox .fclz-panel:visible').size()!=0) )
        $('.clz-title, .fclz-panel, .clz-footer', '.fclz-toolbox').hide();
      else
        $('.clz-title, .fclz-panel, .clz-footer', '.fclz-toolbox').removeAttr('style');
      $('.fclz-toolbox')
        .removeClass(' clz-show-features clz-show-layouts clz-show-packages clz-show-setting')
        .addClass($(this).attr('data-toolbox'));
      $.cookie('toolbox.tab', $(this).attr('data-toolbox'));
    });
    var crnt_tab = $.cookie('toolbox.tab');
    if(crnt_tab==undefined||crnt_tab=='') crnt_tab = 'clz-show-features';
    $('.fclz-toolbox [data-toolbox='+crnt_tab+']').click();
  },
  fixed: function(on){
    if(on){
      $('body').addClass('clz-fixed');
      $('body').attr( 'lastPosition',$(window).scrollTop() );
      $(window).scrollTop(0);
    }else{
      $('body').removeClass('clz-fixed');
      $('html, body').animate( { scrollTop: $('body').attr('lastPosition') } );
    }
  }
});
//map loadings
cliiz.panel = { showLoading: cliiz.mini.showLoading, hideLoading: cliiz.mini.hideLoading }
cliiz.gallery = $.namespace({
  sortOrAdd: function(e, ui){
    if(ui.item.is('.fclz-file'))
      cliiz.gallery.addImage(ui.item.attr('fileid'));
  },
  currentAlbum: null,
  addAlbum: function(){
    cliiz.gallery.addImage();
  },
  addImage: function(id){
    var data = { parent_id: cliiz.gallery.currentAlbum };
    if(id==undefined)
      data.is_album = true;
    else
      data.image_id = id;
    $.send('/panel/gallery/create', { image: data }, cliiz.gallery.addMore, true);
  },
  addMore: function(d){
    var scope = $('.fclz-formbox .fclz-gallery-browser .fclz-images');
    var image = $('.fclz-templates .fclz-image').clone();
    var new_images = image.template( d, { appendTo: scope } );
    $('[isalbum=true]', scope).addClass('clz-album').find('img').click(
      function(){
        var id = $(this).parents('.fclz-image').attr('fileid');
        var src = $('img', $(this).parents('.fclz-image')).attr('src');
        $.send('/panel/gallery.json', { album:id }, function(d){cliiz.gallery.browse(d, id, src)} );
      }
    );
    $('.fclz-image .fclz-delete').click(
      function(){
        var img = $(this).parents('.fclz-image');
        $.send('/panel/gallery/delete', { image: { id: img.attr('fileid') } });
        img.remove();
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
    );
    $('.fclz-image button', scope).click(
      function(){
        var img = $(this).parents('.fclz-image');
        var caption = $('input', img).val();
        $.send('/panel/gallery/update', { image: { title: caption, id: img.attr('fileid') } });
      }
    );
    $('.fclz-image input', scope).keypress( function(e){
      if(e.which==13)
        $(this).parents('.fclz-image').find('button').click();
    });
  },
  files: function(d){
    $('.fclz-file-browser').scroller('reset');
    var scope = $('.fclz-formbox .fclz-files').empty();
    var folder = $('.fclz-templates .fclz-folder').clone();
    var file = $('.fclz-templates .fclz-file').clone();
    if(d.parent.folder.id)
      $('.fclz-templates .fclz-folderup').clone().appendTo(scope).attr('folderid', d.parent.folder.folder_id).find('.fclz-info').text(d.parent.folder.name);
    folder.template( d.folders, { appendTo: scope } );
    var files = file.template( d.files, { appendTo: scope } );
    $('.fclz-folder, .fclz-folderup', scope).unbind().click( function() { 
      var id = $(this).attr('folderid');
      $.send( '/panel/files/'+id+'.json', function(d){ cliiz.gallery.files(d, id) }, true );
    });
    if(d.parent.folder.folder_id==null) //fix first level sub folder (roots folder) which has parent_id null 
      $('.fclz-folderup', scope).unbind().click( function() { $.send( '/panel/files.json', cliiz.gallery.files, true ); } ).find('.fclz-info').text('...');
    files.draggable( 
      { 
        stop: function(){ $('.fclz-formbox .fclz-images').removeClass('clz-sorting'); },
        helper: 'clone',
        appendTo: 'body',
        connectToSortable: $('.fclz-formbox .fclz-gallery-browser .fclz-images')
      } 
    );
  },
  browse: function(d, album, cover){
    $('.fclz-formbox .fclz-gallery-browser').scroller('reset');
    $('.fclz-formbox .fclz-gallery-browser .fclz-image').unbind().remove();
    cliiz.gallery.addMore(d);
    cliiz.gallery.currentAlbum = album;
    $('.fclz-gallery-crumb').text('').unbind();
    if(cliiz.gallery.currentAlbum)
      $('.fclz-gallery-crumb').text(' > back to root').click(function(){
        $.send( '/panel/gallery.json', cliiz.gallery.browse );
      });
    if(album!=undefined)
      $('.fclz-formbox .fclz-cover').attr( { src: cover } );
    else
      $('.fclz-formbox .fclz-cover').attr( { src: '/images/blank.gif' } );
  }
});

});
