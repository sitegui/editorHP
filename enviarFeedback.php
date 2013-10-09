<?php
// Envia o feedback do usuário

// Valida os dados
$email = @$_POST['email'];
$msg = @$_POST['msg'];
$userAgent = @$_POST['userAgent'];
if (strlen($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
	// Email inválido
	echo 'email';
	exit;
}
if (strlen($msg) < 5) {
	// Mensagem muito curta
	echo 'msg';
	exit;
}

// Salva o arquivo
$arquivo = '';
if (isset($_POST['arquivo'])) {
	$nome = date('Y-m-d_H-i-s_') . uniqid() . '.txt';
	file_put_contents("feedback-arquivos/$nome", $_POST['arquivo']);
	$arquivo = "\r\n\r\nArquivo anexo: http://sitegui.com.br/editorHP/feedback-arquivos/$nome";
}

// Envia
if ($email)
	$headers = "From: $email\r\nContent-type: text/plain; charset=utf-8\r\nSender: sitegui@sitegui.com.br";
else
	$headers = "From: sitegui@sitegui.com.br\r\nContent-type: text/plain; charset=utf-8";
mail('sitegui@sitegui.com.br', 'Fale conosco - editorHP', "$msg\r\n\r\nUser-Agent: $userAgent$arquivo", $headers);
echo 'true';
