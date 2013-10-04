<?php
// Reúne todos os arquivo JS para economizar requisições HTTP
$arquivos = array(
	'dados/Editor.js',
	'dados/Livro.js',
	'dados/Compilador.js',
	'dados/CompiladorParalelo.js',
	'dados/Elemento.js',
	'dados/Indice.js',
	'dados/Pagina.js',
	'dados/Anexo.js',
	'dados/Arquivo.js',
	'dados/Acao.js',
	'dados/Sintaxe.js',
	'interface/JanelaBasica.js',
	'interface/Interface.js',
	'interface/InterfaceAbas.js',
	'interface/InterfaceMenus.js',
	'interface/InterfacePaginas.js',
	'interface/InterfaceIndices.js',
	'interface/InterfaceAnexos.js',
	'interface/InterfaceEdicao.js',
	'interface/JanelaAbrir.js',
	'interface/JanelaImagem.js',
	'interface/JanelaAjuda.js',
	'interface/JanelaDicas.js',
	'interface/JanelaSintaxe.js',
	'interface/JanelaDesenho.js',
	'interface/JanelaDownload.js',
	'interface/Ordenavel.js',
	'editor.js'
);

$js = array();
foreach ($arquivos as $cada)
	$js[] = getCabecalho($cada) . file_get_contents('js/' . $cada);

$js = implode("\n", $js);
header('Content-type: application/javascript');

// Gera a array de bytes do programa compilado para HP
// Ignora os 34 primeiros bytes, pois é onde o livre será inserido
$compiladoStr = str_split(substr(file_get_contents('COMPILADO.hp'), 34));
$compilado = array();
foreach ($compiladoStr as $c)
	$compilado[] = ord($c);
$compilado = implode(', ', $compilado);

// Gera um comentário de cabeçalho para cada arquivo
function getCabecalho($nome) {
	$estrelas = str_repeat('*', strlen($nome)+4);
	$espacos = str_repeat(' ', strlen($nome)+2);
	return "/$estrelas\n *$espacos*\n * $nome *\n *$espacos*\n $estrelas/\n\n";
}

?>"use strict";

<?=$js?>

<?=getCabecalho('COMPILADO.hp')?>
var COMPILADO = new Uint8Array([<?=$compilado?>])
