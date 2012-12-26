$(function(){
  
cliiz.browser = $.namespace({
  init: function(){
    $('.fn-choose-image').click( this.show );
    $('.fn-cancel-image').click( this.hide );
    $.send( '/panel/files.json', cliiz.browser.files );
    $('.fn-browser').scroller();
  },
  show: function(){
    $('.fn-file-browser, .fn-blocker').show();
  },
  hide: function(){
    $('.fn-file-browser, .fn-blocker').hide();
  },
  files: function(d){
    $('.fn-browser').scroller('reset');
    var scope = $('.fn-browser .fn-files').empty();
    var folder = $('.fn-templates .fn-folder').clone();
    var file = $('.fn-templates .fn-file').clone();
    if(d.parent.id)
      $('.fn-templates .fn-folderup').clone().appendTo(scope).attr('folderid', d.parent.folder_id).find('.fn-info').text(d.parent.name);
    folder.template( d.folders, { appendTo: scope } );
    var files = file.template( d.files, { appendTo: scope } );
    $('.fn-folder, .fn-folderup', scope).unbind().click( function() { 
      var id = $(this).attr('folderid');
      $.send( '/panel/files/'+id+'.json', function(d){ cliiz.browser.files(d, id) }, true );
    });
    if(d.parent.folder_id==null) //fix first level sub folder (roots folder) which has parent_id null 
      $('.fn-folderup', scope).unbind().click( function() { $.send( '/panel/files.json', cliiz.browser.files, true ); } ).find('.fn-info').text('...');
    files.unbind().click( cliiz.browser.runEvents )
  },
  runEvents: function(){
    var $this = $(this);
    $.each(
      cliiz.browser.events,
      function(k,v){
        v.call($this);
      }
    );
  },
  events: []
});

cliiz.browser.init();

});
