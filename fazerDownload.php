<?php
// Lê o nome e id do arquivo
$nome = $_GET['nome'];
$id = $_GET['id'];

// Valida o id do arquivo
if (!preg_match('@^[0-9a-f]{32}$@', $id)) {
	header('HTTP/1.1 400 Bad Request');
	exit;
}

// Verifica se o arquivo existe
$arq = 'downloads/' . $id . '.hp';
if (!file_exists($arq)) {
	header('HTTP/1.1 404 Not Found');
	exit;
}

// Envia o arquivo como download
$nome2 = '';
for ($i=0; $i<strlen($nome); $i++)
	if ($nome[$i] != ' ' && $nome[$i] != '_')
		$nome2 .= $nome[$i];
header('Content-Disposition: attachment; filename="' . $nome2 . '.hp"');
header('Content-Type: application/octet-stream');
readfile($arq);
