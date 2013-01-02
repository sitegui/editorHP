<?php
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
	if (substr($cada, -4) == '.css')
		$css[] = "/*** $cada ***/\n" . file_get_contents($cada);

$css = implode("\n", $css);
file_put_contents('../css.css', $css);
echo $css;
