<?php
// Lê o conteúdo do livro
$Livro = file_get_contents('Livro.txt'); // TODO: pegar via $_POST
$Livro = substr($Livro, strpos($Livro, "\n")+1);
$Livro = trocarTrigraphs(escapar($Livro));

$tamanho = 5+2*strlen($Livro);

// Monta o binário (aproveita o pré-compilado)
$compilado = "HPHP49-C\x9d-\x90\x9b8,*";
$compilado .= chr($tamanho%0x10 * 16);
$compilado .= chr(($tamanho>>4)%0x1000);
$compilado .= chr(($tamanho>>12)%0x1000);
$compilado .= $Livro;
$compilado .= substr(file_get_contents('COMPILADO.hp'), 34);

// Manda como download
header("Content-Disposition: attachment; filename=livro.hp");
header("Content-Type: text/plain");
echo $compilado;

// Trasnforma na representação de string
function escapar($str) {
	$str = str_replace('\\\\', '\\\\\\\\', $str);
	$str = str_replace('\\"', '\\\\"', $str);
	$str = str_replace('"', '\\"', $str);
	return $str;
}

// Troca os caracteres especiais pelos valores corretos
function trocarTrigraphs($str) {
	$tris = array(
	'\\"' => '"',
	'\\\\' => '\\',
	'\\<)' => chr(128),
	'\\x-' => chr(129),
	'\\.V' => chr(130),
	'\\v/' => chr(131),
	'\\.S' => chr(132),
	'\\GS' => chr(133),
	'\\|>' => chr(134),
	'\\pi' => chr(135),
	'\\.d' => chr(136),
	'\\<=' => chr(137),
	'\\>=' => chr(138),
	'\\=/' => chr(139),
	'\\Ga' => chr(140),
	'\\->' => chr(141),
	'\\<-' => chr(142),
	'\\|v' => chr(143),
	'\\|^' => chr(144),
	'\\Gg' => chr(145),
	'\\Gd' => chr(146),
	'\\Ge' => chr(147),
	'\\Gn' => chr(148),
	'\\Gh' => chr(149),
	'\\Gl' => chr(150),
	'\\Gr' => chr(151),
	'\\Gs' => chr(152),
	'\\Gt' => chr(153),
	'\\Gw' => chr(154),
	'\\GD' => chr(155),
	'\\PI' => chr(156),
	'\\GW' => chr(157),
	'\\[]' => chr(158),
	'\\oo' => chr(159),
	'\\<<' => chr(171),
	'\\^o' => chr(176),
	'\\Gm' => chr(181),
	'\\>>' => chr(187),
	'\\.x' => chr(215),
	'\\0/' => chr(216),
	'\\Gb' => chr(223),
	'\\:-' => chr(247),
	"\t" => '',
	"\r\n" => "\n"
	);
	$str = mb_convert_encoding($str, 'ISO-8859-1', 'UTF-8');
	$str = strtr($str, $tris);
	$str = preg_replace_callback('@\\\\(\\d{3})@', create_function('$matches', 'return chr($matches[1]);'), $str);
	return $str;
}
?>