<%= render :file => "/modules/base.js" %>

jQuery(function($){

var md = [];
<% @blocks.each do |b| %>
md.push(["<%= b[:uid] %>", $("<%= b[:content].html_safe %>"), "<%= b[:js] %>"]);
<%end%>
md.stylesheet = "<%=@stylesheet%>";

$.each(
  md,
  function(k,v){
    $(['[cliiz="',v[0],'"]'].join('')).append( $(v[1]) );
    $('<script type="text/javascript" />').attr('src', cliiz.baseUrl+'/modules/'+v[2]).appendTo('body');
  }
)
$('<link type="text/css" rel="stylesheet" media="screen" href="'+cliiz.baseUrl+'/stylesheets/modules_base.css" />').appendTo('head');
$('<style/>').text(md.stylesheet).appendTo('head');

});
