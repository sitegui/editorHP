<?php
// Lê o livro
$livro = $_POST['livro'];

set_time_limit(60);

// Elimina arquivos antigos (criados há mais de 1 hora)
$scan = scandir('downloads');
for ($i=0; $i<count($scan); $i++) {
	$arq = 'downloads/' . $scan[$i];
	if (substr($arq, -3) == '.hp' && filemtime($arq) < time()-3600)
		unlink($arq);
}

// Prepara a relação entre os caracteres
$mapaHP2PC = array(
"\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07",
"\x08", "\x09", "\n", "\x0B", "\x0C", "\x0D", "\x0E", "\x0F",
"\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17",
"\x18", "\x19", "\x1A", "\x1B", '\u21D0', '\u25A0', '\u2026', '\u2026',
' ', '!', '"', '#', '$', '%', '&', '\'',
'(', ')', '*', '+', ',', '-', '.', '/',
'0', '1', '2', '3', '4', '5', '6', '7',
'8', '9', ':', ';', '<', '=', '>', '?',
'@', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
'`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
'x', 'y', 'z', '{', '|', '}', '~', "\x7F",
'\u2221', '', '\u2207', '\u221A', '\u222B', '\u03A3', '\u25B6', '\u03C0',
'\u2202', '\u2264', '\u2265', '\u2260', '\u03B1', '\u2192', '\u2190', '\u2193',
'\u2191', '\u03B3', '\u03B4', '\u03B5', '\u03B7', '\u03B8', '\u03BB', '\u03C1',
'\u03C3', '\u03C4', '\u03C9', '\u0394', '\u03A0', '\u03A9', '\u25AA', '\u221E',
'\u20AC', '¡', '¢', '£', '¤', '¥', '¦', '§',
'¨', '©', 'ª', '«', '¬', '­', '®', '¯',
'°', '±', '²', '³', '´', 'µ', '¶', '·',
'¸', '¹', 'º', '»', '¼', '½', '¾', '¿',
'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç',
'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×',
'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç',
'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷',
'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ'
);

// Gera o mapa de tradução PC -> HP
$mapaPC2HP = array();
$mapaPC2HP[json_decode('"\u2211"')] = 133;
$mapaPC2HP[json_decode('"\u2206"')] = 155;
$mapaPC2HP[json_decode('"\u220F"')] = 156;
$mapaPC2HP[json_decode('"\u2126"')] = 157;
foreach ($mapaHP2PC as $HP=>$PC) {
	if (substr($PC, 0, 2) == '\u')
		$PC = json_decode('"' . $PC . '"');
	$mapaPC2HP[$PC] = chr($HP);
}

// Traduz caracteres para bytes
$livro2 = '';
mb_internal_encoding('UTF-8');
$len = mb_strlen($livro);
for ($i=0; $i<$len; $i++)
	$livro2 .= $mapaPC2HP[mb_substr($livro, $i, 1)];

$tamanho = 5+2*strlen($livro2);

// Monta o binário (aproveita o pré-compilado)
$compilado = "HPHP49-C\x9d-\x90\x9b8,*";
$compilado .= chr($tamanho%0x10 * 16);
$compilado .= chr(($tamanho>>4)%0x1000);
$compilado .= chr(($tamanho>>12)%0x1000);
$compilado .= $livro2;
$compilado .= substr(file_get_contents('COMPILADO.hp'), 34);

// Salva no servidor num arquivo aleatório
$arquivo = md5(uniqid());
file_put_contents('downloads/' . $arquivo . '.hp', $compilado);

// Retorna o nome do arquivo
echo $arquivo;
