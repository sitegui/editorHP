<?php
// Reúne todos os arquivo CSS para economizar requisições HTTP
$arquivos = array(
	'botao.css',
	'menu.css',
	'janela.css',
	'aba.css',
	'paginas.css',
	'indices.css',
	'anexos.css',
	'ferramentas.css',
	'edicao.css',
	'painel.css',
	'layout.css'
);

$css = array();
foreach ($arquivos as $cada)
	$css[] = "/*** $cada ***/\n" . file_get_contents('css/' . $cada);

$css = implode("\n", $css);
header('Content-type: text/css');
echo $css;
