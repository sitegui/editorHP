<?php
$arquivos = array(
	
);

$js = array();
foreach ($arquivos as $cada)
	if (substr($cada, -4) == '.js')
		$js[] = "/*** $cada ***/\n" . file_get_contents($cada);

$js = implode("\n", $js);
file_put_contents('../jss.js', $js);
echo $js;
