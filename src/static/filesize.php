<?php
set_error_handler(function() {});

if(!array_key_exists("path", $_GET) || empty($_GET["path"])) {
	echo 0;
	return;
}

$path = htmlspecialchars($_GET["path"]);
$size = filesize($path);
if($size === FALSE) {
	echo 0;
	return;
}

echo $size;
?>
