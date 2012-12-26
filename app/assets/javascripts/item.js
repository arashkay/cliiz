$(function(){
  
cliiz.items = $.namespace({
  init: function(){
    cliiz.browser.events.push( 
      function(){
        cliiz.browser.hide();
        $('.fn-item-image').attr('src',$('img', this).attr('src').split('?')[0]);
        $('[name="item[image_id]"]').val(this.attr('fileid')); 
      } 
    );
    $('.fn-editor', '.fn-listingForm').wysiwyg(
      {
        initialContent: null,
        autoGrow: true,
        maxHeight: 500,
        controls: {
          insertImage: { visible: false },
          insertTable: { visible: false }
        }
      }
    );
  }
});

cliiz.items.init();

});
