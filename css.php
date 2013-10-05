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
	$css[] = getCabecalho($cada) . file_get_contents('css/' . $cada);

$css = implode("\n", $css);
header('Content-type: text/css');
echo $css;

// Gera um comentário de cabeçalho para cada arquivo
function getCabecalho($nome) {
	$estrelas = str_repeat('*', strlen($nome)+4);
	$espacos = str_repeat(' ', strlen($nome)+2);
	return "/$estrelas\n *$espacos*\n * $nome *\n *$espacos*\n $estrelas/\n\n";
}
