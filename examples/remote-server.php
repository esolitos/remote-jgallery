<?php 

$success = TRUE;
$data = array(
  'message' => 'Some Message',
  'error' => 'Some Error', 
  'base_url' => 'http://test.dev/',
  'galleries'  => array(
    array(
      'gid' => 1,
      'name' => 'This is the Gallery Title',
      'images' => array(
        array(
          'id' => 1,
          'gallery_id' => 1,
          'full_size' => 'remote-jgallery/examples/images/1/first.jpg',
          'thumb' => 'remote-jgallery/examples/images/1/thumb/first.jpg',
        ),
        array(
          'id' => 2,
          'gallery_id' => 1,
          'full_size' => 'remote-jgallery/examples/images/1/second.jpg',
          'thumb' => 'remote-jgallery/examples/images/1/thumb/second.jpg',
        ),
        array(
          'id' => 3,
          'gallery_id' => 1,
          'full_size' => 'remote-jgallery/examples/images/1/another.jpg',
          'thumb' => 'remote-jgallery/examples/images/1/thumb/another.jpg',
        )
      ),
    ),
    array(
      'gid' => 2,
      'name' => 'Yet another Gallery',
      'images' => array(
        array(
          'id' => 11,
          'gallery_id' => 2,
          'full_size' => 'remote-jgallery/examples/images/2/abc.jpg',
          'thumb' => 'remote-jgallery/examples/images/2/thumb/a_thumb.gif',
        ),
        array(
          'id' => 12,
          'gallery_id' => 2,
          'full_size' => 'remote-jgallery/examples/images/2/def.jpg',
          'thumb' => 'remote-jgallery/examples/images/2/thumb/b_thumb.gif',
        ),
        array(
          'id' => 13,
          'gallery_id' => 2,
          'full_size' => 'remote-jgallery/examples/images/2/ghi.jpg',
          'thumb' => 'remote-jgallery/examples/images/2/thumb/g_thumb.gif',
        )
      ),
    ),
  )
);


$jdata = json_encode( array('result' => $success, 'data' => $data) );
  
if(filter_has_var(INPUT_GET,  'callback')) {
  header('Content-Type: text/javascript; charset=utf8');
  header('Access-Control-Allow-Origin: *');

  $callback = filter_input(INPUT_GET, 'callback', FILTER_CALLBACK, array('options'=>'convertSpace'));
  echo $callback.'('.$jdata.');';

} else {
  // normal JSON string
  header('Content-Type: application/json; charset=utf8');

  print $jdata;
}