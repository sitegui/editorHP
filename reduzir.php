<?php
// Troca os nomes das variáveis no arquivo compilado para reduzir o tamanho do programa

// Variáveis locais \<-x
$localVars = array('altura',
'anexos',
'cache',
'indice',
'largura',
'nome',
'opcoes',
'paginas',
'posIndice',
'strings',
'versao');

// Outras variáveis
$vars = array('ABRIRLIVRO',
'alinhamento',
'COMPILARPAGINA',
'eElemento',
'ENVIAR',
'GETPAGINACOMPILADA',
'GVIEW',
'img',
'ini',
'lado',
'lista',
'loop',
'MONTARANEXOS',
'MONTARINDICE',
'MONTARINDICERAIZ',
'PREOBJCABECALHO',
'PREOBJEQ',
'PREOBJIMG',
'PREOBJREGUA',
'PREOBJTXT',
'string',
'subindice',
'SUBIRINDICE',
'TEMP',
'TEMPLIVRO',
'tipo');

reduzir('src-hp/COMPILADO.txt', 'src-hp/COMPILADO2.txt');
reduzir('src-libHP/COMPILADO.txt', 'src-libHP/COMPILADO2.txt');

function reduzir($de, $para) {
	global $localVars, $vars;
	
	$str = file_get_contents($de);
	
	$letras = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$c = strlen($letras);
	for ($i=0; $i<count($localVars); $i++) {
		$var = $localVars[$i];
		$nome = $i<$c ? $letras[$i] : ($letras[floor($i/$c)] . $letras[$i%$c]);
		$str = preg_replace('@\b' . $var . '\b@', $nome, $str);
	}
	for ($i=0; $i<count($vars); $i++) {
		$var = $vars[$i];
		$nome = $i<$c ? $letras[$i] : ($letras[floor($i/$c)] . $letras[$i%$c]);
		$str = preg_replace('@\b' . $var . '\b@', '~' . $nome, $str);
	}
	
	// Troca números float para int
	$str = preg_replace('@\b(\d+)\.(?=\D)@', '$1', $str);
	
	file_put_contents($para, $str);
}
