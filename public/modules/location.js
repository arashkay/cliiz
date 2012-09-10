jQuery(function($){

$('[cliiz-type=locationmark]').each(
  function(){
    var block = $(this);
    var $map = $('.cliiz-map', block);
    var latlng = $map.attr('data-latlng').split(',')
    var $win = $('.cliiz-location:hidden', block);
    var opts = {
      zoom: 15,
      center: new google.maps.LatLng(latlng[0], latlng[1]),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map($map.get(0), opts);
    var marker = new google.maps.Marker( { map: map, position: opts.center } );
    var cnt = $win.clone().show();
    if($('.cliiz-address span', cnt).text()=='')
      $('.cliiz-address', cnt).remove();
    if($('.cliiz-phone span', cnt).text()=='')
      $('.cliiz-phone', cnt).remove();
    if($('.cliiz-fax span', cnt).text()=='')
      $('.cliiz-fax', cnt).remove();
    var win = new google.maps.InfoWindow( { content: cnt.get(0), position: opts.center } );
    win.open( map );
    
  }
);

});
