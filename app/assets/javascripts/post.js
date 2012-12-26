$(function(){
  
cliiz.posts = $.namespace({
  init: function(){
    cliiz.browser.events.push( 
      function(){
        cliiz.browser.hide();
        $('.fn-post-image').attr('src',$('img', this).attr('src').split('?')[0]);
        $('[name="post[image_id]"]').val(this.attr('fileid')); 
      } 
    );
    $( "[name='post[publish_date]']").datepicker();
    $('.fn-editor', '.fn-blogForm').wysiwyg(
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

cliiz.posts.init();

});
