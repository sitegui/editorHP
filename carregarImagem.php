<?php
// Carrega uma imagem remota para que o JS depois possa ler seus pixels e aplicar o filtro
// Recebe um URL (deve começar com 'http://' ou 'https://')
// Retorna uma dataURL (ex: 'data:image/jpeg;base64,asdsadasndsan')

$url = $_GET['url'];

$extensoes = array(
	'.jpg' => 'jpeg',
	'.jpeg' => 'jpeg',
	'.jpe' => 'jpeg',
	'.jif' => 'jpeg',
	'.jfif' => 'jpeg',
	'.jfi' => 'jpeg',
	'.gif' => 'gif',
	'.png' => 'png',
	'.apng' => 'png',
	'.bmp' => 'bmp',
	'.dib' => 'bmp',
	'.ico' => 'vnd.microsoft.icon',
	'.svg' => 'svg+xml',
	'.svgz' => 'svg+xml'
);

if (preg_match('@^https?://@', $url)) {
	$arquivo = @file_get_contents($url);
	
	$extensao = strtolower(substr($url, strrpos($url, '.')));
	if (!isset($extensoes[$extensao]) || !$arquivo)
		header('HTTP/1.1 400 Bad Request');
	else {
		echo 'data:image/' . $extensoes[$extensao] . ';base64,';
		echo base64_encode($arquivo);
	}
} else
	header('HTTP/1.1 400 Bad Request');
