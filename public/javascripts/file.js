$(function(){
  
cliiz.files = $.namespace({
  init: function(){
    $('.fn-droppable').droppable(
      {
        accept: '.fn-draggable',
        drop: function(ev, ui){
          var crnt = ui.draggable;
          var data = { folder_id: $(this).attr('folderid') };
          crnt.is('[folderid]')
            ? data.folder = crnt.attr('folderid')
            : data.file = crnt.attr('fileid')
          $.send( '/panel/files/move', data, function(){ ui.draggable.hide() }, true);
        }
      }
    );
    $('.fn-draggable').draggable( { revert: 'invalid' } );
  }
});

cliiz.files.init();

});
