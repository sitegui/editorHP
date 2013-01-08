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
	'interface/Ordenavel.js',
	'editor.js'
);

$js = array();
foreach ($arquivos as $cada)
	$js[] = "/*** $cada ***/\n" . file_get_contents('js/' . $cada);

$js = implode("\n", $js);
header('Content-type: application/javascript');
echo $js;
