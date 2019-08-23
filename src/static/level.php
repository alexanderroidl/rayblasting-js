<?php
function error($msg) {
	echo '{"error": "'.$msg.'"}';
	http_response_code(500);
}

set_error_handler(function() {}); // Don't handle errors
header("Content-type: application/json");

// Validate GET parameter
if(!array_key_exists("name", $_GET) || empty($_GET["name"]))
	return error("Invalid name parameter given");

// Save escaped GET parameter
$level_name = htmlspecialchars($_GET["name"]);

// Validate level name
if(!preg_match("/^[a-zA-Z0-9]+$/", $level_name))
	return error("Invalid level name");

// Get level contents
$level_folder = "levels/".$level_name."/";
$level_contents = file_get_contents($level_folder.$level_name.".json");

// Content retrieval unsuccessfull
if($level_contents === false)
	return error('Level not found');

// Decode JSON string (to minify and modify contents)
$level_decoded = json_decode($level_contents);
if($level_decoded === null)
	return error("Level file corrupt");

// Add folder prefix to asset sources
if(property_exists($level_decoded, "assets")) {
	foreach($level_decoded->assets as $asset_category => $asset_category_items) {
		foreach($asset_category_items as $asset_name => $asset_src) {
			if(is_array($asset_src) && is_string($asset_src[0])) {
				$level_decoded->assets->$asset_category->$asset_name[0] = $level_folder.$asset_src[0];
				continue;
			}
			$level_decoded->assets->$asset_category->$asset_name = $level_folder.$asset_src;
		}
	}
}

// Send encoded JSON
echo json_encode($level_decoded);
?>
