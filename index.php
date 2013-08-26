<?php
$langsSuportadas = array('pt-br', 'en');
$lang = '';
if (isset($_GET['lang'])) {
	// Pega o valor definido pelo usuário
	$lang = $_GET['lang'];
} else if (isset($_COOKIE['lang'])) {
	// Pega o valor do cookie já salvo
	$lang = $_COOKIE['lang'];
} else {
	// Verifica as linguagens desejadas pelo usuário
	$langs = array();
	foreach (explode(',', str_replace(' ', '', $_SERVER['HTTP_ACCEPT_LANGUAGE'])) as $cada) {
		$partes = explode(';', $cada);
		if (count($partes) == 1)
			$langs[$partes[0]] = 1;
		else
			$langs[$partes[0]] = (float)substr($partes[1], 2);
	}
	
	// Pega a que melhor se encaixa para o usuário
	arsort($langs, SORT_NUMERIC);
	foreach ($langs as $cada=>$x)
		if (in_array($cada, $langsSuportadas)) {
			$lang = $cada;
			break;
		}
}

// Inclui o arquivo
$ok = false;
foreach ($langsSuportadas as $cada)
	if ($cada == $lang) {
		$ok = true;
		require "lang/$lang.php";
		break;
	}

// Coloca a primeira língua, por padrão
if (!$ok) {
	$lang = $langsSuportadas[0];
	require "lang/$lang.php";
}

// Salva as configurações do usuário
setcookie('lang', $lang, time()+365*24*60*60);

function get($str) {
	global $strs;
	return isset($strs[$str]) ? $strs[$str] : "[[$str]]";
}

?><!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8">
<!--
Copyright 2013 Guilherme de Oliveira Souza

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<title>EditorHP</title>
<meta name="description" content="Um ótimo editor de textos para a calculadora HP50g, aceita equações, matrizes, fórmulas e imagens. Divide o conteúdo em páginas e cria um índice para facilitar o acesso">
<meta name="keywords" content="calculadora HP50g, calculadora HP, HP, editor de texto, editor para HP50g, editor para HP, txt pra HP">
<link rel="stylesheet" href="css.php">
<link rel="icon" href="img/icone.png">
<script src="lang/<?=$lang?>.js"></script>
<script src="js.php"></script>
</head>

<body>
<!-- Menu -->
<div class="menu">
	<div class="menuBotao botao2" id="menuAbrir">
		<div class="botao2Esq" title="Ctrl+O"><?=get('abrir')?></div>
		<div class="botao2Dir" id="menuAbrirMais">&#9660;</div>
	</div>
	<div class="menuBotao botao2" id="menuSalvar">
		<div class="botao2Esq" title="Ctrl+S"><?=get('salvar')?></div>
		<div id="menuSalvarMais" class="botao2Dir">&#9660;</div>
	</div>
	<div id="menuAjuda" class="menuBotao botao-azul" title="F1"><?=get('ajuda')?></div>
	<div id="ferramenta-desfazer" class="menuBotao botao-azul desfazer">&#x21b6;</div>
	<div id="ferramenta-refazer" class="menuBotao botao-azul refazer">&#x21b7;</div>
	<div id="menuBug" class="menuBotao botao-azul" title="<?=get('bug')?>">&#x1f41c;</div>
	<div class="menuBotao botao2" id="menuLingua">
		<div class="botao2Esq"><?=get('linguaAtual')?></div>
		<div id="menuLinguaMais" class="botao2Dir">&#9660;</div>
	</div>
	
	<!-- abas -->
	<div id="abas">
		<div class="aba aba-mais" id="abaMais" title="<?=get('novaAba')?>">+</div>
	</div>
</div>

<!-- Submenus dos menus -->
<div id="submenuAbrir" class="submenu" style="display:none">
	<div class="submenu-item" id="submenuAbrir-upload"><?=get('upload')?></div>
	<div class="submenu-item" id="submenuAbrir-URL"><?=get('url')?></div>
	<div class="submenu-item" id="submenuAbrir-novo" title="Ctrl+N"><?=get('novo')?></div>
</div>
<div id="submenuSalvar" class="submenu" style="display:none">
	<div class="submenu-item" id="submenuSalvar-arquivo"><?=get('gerarArquivo')?></div>
	<div class="submenu-item" id="submenuSalvar-URL"><?=get('gerarUrl')?></div>
	<div class="submenu-item" id="submenuSalvar-salvar"><?=get('somenteSalvar')?></div>
	<div class="submenu-item" id="submenuSalvar-salvarTodos" title="Ctrl+Shift+S"><?=get('salvarTodos')?></div>
	<div class="submenu-item" id="submenuSalvar-salvarComo"><?=get('salvarComo')?></div>
	<div class="submenu-item" id="submenuSalvar-baixarBiblioteca"><?=get('baixarBiblioteca')?></div>
</div>

<!-- Submenus de edição -->
<div id="submenuEdicao" class="submenu-pequeno" style="display:none">
	<div class="submenu-item" id="submenuEdicao-inserir"><?=get('inserir')?></div>
	<div class="submenu-item" id="submenuEdicao-excluir"><?=get('excluir')?> <span class="submenu-atalho">Del</span></div>
	<div class="submenu-divisoria"></div>
	<div class="submenu-item" id="submenuEdicao-copiar"><?=get('copiar')?> <span class="submenu-atalho">Ctrl+C</span></div>
	<div class="submenu-item" id="submenuEdicao-colar"><?=get('colar')?> <span class="submenu-atalho">Ctrl+V</span></div>
	<div class="submenu-item" id="submenuEdicao-recortar"><?=get('recortar')?> <span class="submenu-atalho">Ctrl+X</span></div>
</div>

<!-- Submenus de língua -->
<div id="submenuLingua" class="submenu-pequeno" style="display:none">
	<div class="submenu-item" id="submenuLingua-pt-br"><img src="img/br.png"> <?=get('pt-br')?></div>
	<div class="submenu-item" id="submenuLingua-en"><img src="img/us.png"> <?=get('en')?></div>
</div>

<!-- Submenus de caracteres -->
<div id="submenuCaracteres" class="submenu caracteres" style="display:none">
	<table>
		<tr>
			<td title="\<)">&#x2221;</td>
			<td title="\.V">&#x2207;</td>
			<td title="\v/">&#x221A;</td>
			<td title="\.S">&#x222B;</td>
			<td title="\GS">&#x03A3;</td>
			<td title="\|>">&#x25B6;</td>
			<td title="\pi">&#x03C0;</td>
			<td title="\.d">&#x2202;</td>
		</tr><tr>
			<td title="\<=">&#x2264;</td>
			<td title="\>=">&#x2265;</td>
			<td title="\=/">&#x2260;</td>
			<td title="\Ga">&#x03B1;</td>
			<td title="\->">&#x2192;</td>
			<td title="\<-">&#x2190;</td>
			<td title="\|v">&#x2193;</td>
			<td title="\|^">&#x2191;</td>
		</tr><tr>
			<td title="\Gg">&#x03B3;</td>
			<td title="\Gd">&#x03B4;</td>
			<td title="\Ge">&#x03B5;</td>
			<td title="\Gn">&#x03B7;</td>
			<td title="\Gh">&#x03B8;</td>
			<td title="\Gl">&#x03BB;</td>
			<td title="\Gr">&#x03C1;</td>
			<td title="\Gs">&#x03C3;</td>
		</tr><tr>
			<td title="\Gt">&#x03C4;</td>
			<td title="\Gw">&#x03C9;</td>
			<td title="\GD">&#x0394;</td>
			<td title="\PI">&#x03A0;</td>
			<td title="\GW">&#x03A9;</td>
			<td title="\[]">&#x25AA;</td>
			<td title="\oo">&#x221E;</td>
			<td title="\160">&#x20AC;</td>
		</tr><tr>
			<td title="\<<">«</td>
			<td title="\^o">°</td>
			<td title="\Gm">µ</td>
			<td title="\>>">»</td>
			<td title="\.x">×</td>
			<td title="\0/">Ø</td>
			<td title="\Gb">ß</td>
			<td title="\:-">÷</td>
		</tr>
	</table>
</div>

<div id="submenuRegua" class="submenu" style="display:none">
	<div class="submenu-item" id="submenuRegua-fina" title="1 pixel"><?=get('fina')?></div>
	<div class="submenu-item" id="submenuRegua-media" title="3 pixels"><?=get('media')?></div>
	<div class="submenu-item" id="submenuRegua-grossa" title="5 pixels"><?=get('grossa')?></div>
</div>

<!-- Miniaturas das páginas -->
<div class="paginas">
	<div class="painel-titulo"><?=get('paginas')?></div>
	<div class="painel-botoes">
		<div id="paginas-opcoes" class="minibotao-azul" title="<?=get('autoPaginacao')?>">&#9660;</div>
		<div id="paginas-remover" class="minibotao-vermelho" title="<?=get('removerPaginas')?>">-</div>
		<div id="paginas-acrescentar" class="minibotao-verde" title="<?=get('adicionarPagina')?>">+</div>
	</div>
	<div id="paginas" class="painel-conteudo"></div>
</div>

<!-- Ferramentas -->
<div class="ferramentas" id="ferramentas">
	<div class="painel-titulo"><?=get('formatacao')?></div>
	<div class="painel-conteudo ferramentas-conteudo" id="ferramentasConteudo">
		<div class="ferramentas-mascara" id="ferramentasMascara"></div>
		<div class="ferramentas-linha1" id="ferramentasFormato">
			<div class="ferramenta" id="ferramenta-texto" title="<?=get('paragrafo')?>"><p><?=get('paragrafo')?></p></div>
			<div class="ferramenta" id="ferramenta-equacao" title="<?=get('equacao')?>"><h6><?=get('equacao')?></h6></div>
			<div class="ferramenta" id="ferramenta-h1" title="<?=get('titulo1')?>"><h1><?=get('titulo1')?></h1></div>
			<div class="ferramenta" id="ferramenta-h2" title="<?=get('titulo2')?>"><h2><?=get('titulo2')?></h2></div>
			<div class="ferramenta" id="ferramenta-h3" title="<?=get('titulo3')?>"><h3><?=get('titulo3')?></h3></div>
			<div class="ferramenta" id="ferramenta-h4" title="<?=get('titulo4')?>"><h4><?=get('titulo4')?></h4></div>
			<div class="ferramenta" id="ferramenta-h5" title="<?=get('titulo5')?>"><h5><?=get('titulo5')?></h5></div>
		</div>
		<div class="ferramentas-linha2">
			<div class="ferramentas-linha2-parte1">
				<span class="ferramentas-tituloGrupo"><?=get('inserir')?></span>
				<div class="botao-azul" id="ferramenta-imagem" title="<?=get('inserirImagem')?>">&#x1f4f7;</div>
				<div class="botao-azul" id="ferramenta-regua" title="<?=get('inserirRegua')?>">&#x1f4cf;</div>
				<div class="botao-azul" id="ferramenta-caractere" title="<?=get('inserirChar')?>">&#x2380;</div>
			</div>
			<div class="ferramentas-linha2-parte2">
				<span class="ferramentas-tituloGrupo"><?=get('alinhamento')?></span>
				<div class="ferramentas-grupoAlinhamento">
					<div class="botao-azul alinhar-esquerda" id="ferramenta-esquerda" title="<?=get('esquerda')?>">&larr;</div>
					<div class="botao-azul alinhar-centro" id="ferramenta-centro" title="<?=get('centro')?>">&harr;</div>
					<div class="botao-azul alinhar-direita" id="ferramenta-direita" title="<?=get('direita')?>">&rarr;</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Edição -->
<div class="edicao">
	<div id="edicao" class="edicao-conteudo" contenteditable="true"></div>
</div>

<!-- Índices -->
<div class="indices">
	<div class="painel-titulo"><?=get('indices')?></div>
	<div class="painel-botoes">
		<div id="indices-opcoes" class="minibotao-azul" title="<?=get('autoIndexacao')?>">&#9660;</div>
		<div id="indices-remover" class="minibotao-vermelho" title="<?=get('removerIndice')?>">-</div>
		<div id="indices-acrescentar" class="minibotao-verde" title="<?=get('adicionarIndice')?>">+</div>
	</div>
	<div id="indices" class="painel-conteudo"></div>
</div>

<!-- Anexos -->
<div class="anexos">
	<div class="painel-titulo"><?=get('anexos')?></div>
	<div class="painel-botoes">
		<div id="anexos-remover" class="minibotao-vermelho" title="<?=get('removerAnexos')?>">-</div>
		<div id="anexos-acrescentar" class="minibotao-verde" title="<?=get('adicionarAnexo')?>">+</div>
	</div>
	<div id="anexos" class="painel-conteudo"></div>
</div>

<div id="fundoJanela" class="fundoJanela" style="display:none"></div>

<!-- Janela de abrir -->
<div id="janelaAbrir" class="janela" style="display:none">
	<div class="janela-titulo"><?=get('abrirArquivo')?></div>
	<div class="janela-fechar minibotao-vermelho">&times;</div>
	<div class="janela-barra">
		<div class="janela-lista" id="janelaAbrir-recentes"><?=get('recentes')?></div>
		<div class="janela-lista" id="janelaAbrir-upload"><?=get('upload')?></div>
		<div class="janela-lista" id="janelaAbrir-URL"><?=get('url')?></div>
		<div class="janela-lista" id="janelaAbrir-novo" title="Ctrl+N"><?=get('novo')?></div>
	</div>
	<div class="janela-painel">
		<div class="janela-painel-conteudo">
			<div id="janelaAbrir-abaRecentes" style="display:none"></div>
			<div id="janelaAbrir-abaUpload" style="display:none">
				<p><?=get('uploadIntro')?></p>
				<input type="file" id="janelaAbrir-upload-arquivo" accept=".hp">
				<div class="botao-verde" id="janelaAbrir-upload-abrir"><?=get('abrir')?></div>
			</div>
			<div id="janelaAbrir-abaURL" style="display:none">
				<p><?=get('urlIntro')?></p>
				<input size="40" id="janelaAbrir-URL-input"> <div class="botao-verde" id="janelaAbrir-URL-abrir"><?=get('abrir')?></div>
			</div>
		</div>
	</div>
</div>

<!-- Janela de ajuda -->
<div id="janelaAjuda" class="janela" style="display:none">
	<div class="janela-titulo"><?=get('ajuda')?></div>
	<div class="janela-fechar minibotao-vermelho">&times;</div>
	<div class="janela-barra">
		<div class="janela-lista" id="janelaAjuda-sobre"><?=get('sobre')?></div>
		<div class="janela-lista" id="janelaAjuda-formato"><?=get('formato')?></div>
		<div class="janela-lista" id="janelaAjuda-creditos"><?=get('creditos')?></div>
	</div>
	<div class="janela-painel">
		<div class="janela-painel-conteudo">
			<div id="janelaAjuda-abaSobre"><?=get('ajudaSobre')?></div>
			<div id="janelaAjuda-abaFormato" style="display:none"><?=get('ajudaFormato')?></div>
			<div id="janelaAjuda-abaCreditos" style="display:none"><?=get('ajudaCreditos')?></div>
		</div>
	</div>
</div>

<!-- Janela de confirma/cancela básica -->
<div id="janelaBasica" class="janelaMenor" style="display:none">
	<div class="janela-titulo" id="janelaBasica-titulo"></div>
	<div class="janela-fechar minibotao-vermelho" id="janelaBasica-fechar">&times;</div>
	<div class="janelaBasica-conteudo">
		<div id="janelaBasica-conteudo"></div>
		<div class="janelaBasica-cancelar botao-vermelho" id="janelaBasica-cancelar"><?=get('cancelar')?></div>
		<div class="janelaBasica-confirmar botao-verde" id="janelaBasica-confirmar"><?=get('confirmar')?></div>
	</div>
</div>

<!-- Janela de ajuste da imagem -->
<div id="janelaImagem" class="janelaMaior" style="display:none">
	<div class="janela-titulo"><?=get('ajustarImagem')?></div>
	<div class="janela-fechar minibotao-vermelho" id="janelaImagem-fechar">&times;</div>
	<div class="janelaImagem-conteudo">
		<div id="janelaImagem-opcoes">
			<p><?=get('filtro')?>: <select id="janelaImagem-filtro">
				<option value="basico"><?=get('basico')?></option>
				<option value="areas"><?=get('areas')?></option>
			</select><br>
			<?=get('ajuste')?>: <span class="minibotao-azul" id="janelaImagem-ajuste-menos">-</span> <input size="5" id="janelaImagem-ajuste"> <span class="minibotao-azul" id="janelaImagem-ajuste-mais">+</span> (<?=get('ajusteDica')?>)<br>
			<?=get('tamanho')?>: <span class="minibotao-azul" id="janelaImagem-tamanho-menos">-</span> <input size="7" id="janelaImagem-tamanho"> <span class="minibotao-azul" id="janelaImagem-tamanho-mais">+</span> (<?=get('tamanhoDica')?>)</p>
		</div>
		<div id="janelaImagem-aviso">
			<p><?=get('imagemAviso')?></p>
		</div>
		<div style="text-align:center;margin:25px">
			<canvas id="janelaImagem-canvas"></canvas>
		</div>
		<div class="janelaImagem-botoes">
			<div class="botao-vermelho" id="janelaImagem-cancelar"><?=get('cancelar')?></div>
			<div class="botao-azul" id="janelaImagem-trocar"><?=get('trocar')?></div>
			<div class="botao-azul" id="janelaImagem-remover"><?=get('remover')?></div>
			<div class="janelaImagem-confirmar botao-verde" id="janelaImagem-confirmar"><?=get('confirmar')?></div>
		</div>
	</div>
</div>

<!-- Janela de desenho manual -->
<div id="janelaDesenho" class="janelaMaior" style="display:none">
	<div class="janela-titulo"><?=get('criarDesenho')?></div>
	<div class="janela-fechar minibotao-vermelho" id="janelaDesenho-fechar">&times;</div>
	<div class="janelaDesenho-conteudo">
		<p><?=get('avisoCores')?></p>
		<div class="janelaDesenho-grupoCores">
			<div class="janelaDesenho-cor" title="<?=get('preto')?>" id="janelaDesenho-cor-000"></div>
		</div>
		<div class="janelaDesenho-grupoCores">
			<div class="janelaDesenho-cor" title="<?=get('branco')?>" id="janelaDesenho-cor-fff"></div>
		</div>
		<div class="janelaDesenho-grupoCores">
			<div class="janelaDesenho-cor" title="<?=get('vermelho')?>" id="janelaDesenho-cor-f00"></div>
			<div class="janelaDesenho-cor" title="<?=get('verde')?>" id="janelaDesenho-cor-0f0"></div>
			<div class="janelaDesenho-cor" title="<?=get('azul')?>" id="janelaDesenho-cor-00f"></div>
		</div>
		<div class="janelaDesenho-grupoCores">
			<div class="janelaDesenho-cor" title="<?=get('azulPiscina')?>" id="janelaDesenho-cor-0ff"></div>
			<div class="janelaDesenho-cor" title="<?=get('rosa')?>" id="janelaDesenho-cor-f0f"></div>
			<div class="janelaDesenho-cor" title="<?=get('amarelo')?>" id="janelaDesenho-cor-ff0"></div>
		</div>
		<div class="minibotao-azul" id="janelaDesenho-limpar"><?=get('limpar')?></div>
		<div class="janelaDesenho-desfazerRefazer">
			<div class="minibotao-azul desfazer" id="janelaDesenho-desfazer" title="<?=get('desfazer')?>">&#x21b6;</div>
			<div class="minibotao-azul refazer" id="janelaDesenho-refazer" title="<?=get('refazer')?>">&#x21b7;</div>
		</div>
		<div style="text-align:center;margin:15px">
			<canvas id="janelaDesenho-canvas" class="janelaDesenho-canvas" width="393" height="240"></canvas>
		</div>
		<div class="botao-vermelho janelaBasica-cancelar" id="janelaDesenho-cancelar"><?=get('cancelar')?></div>
		<div class="janelaBasica-confirmar botao-verde" id="janelaDesenho-confirmar"><?=get('confirmar')?></div>
	</div>
</div>

<!-- Aviso de carregando -->
<div id="janelaCarregando" style="display:none">
	<div class="fundoJanela janelaCarregando-fundo"></div>
	<div class="janelaCarregando">
		<div class="janelaCarregando-conteudo"><?=get('carregando')?></div>
	</div>
</div>

<!-- Janela de dicas -->
<div id="janelaDicas" class="janelaDicas" title="<?=get('cliqueFecha')?>" style="bottom:-26%">
	<div class="janelaDicas-conteudo" id="janelaDicas-conteudo"></div>
</div>

<!-- Janela de ajuda com a sintaxe de equações -->
<div id="janelaSintaxe" class="janelaSintaxe" title="<?=get('cliqueAbreFecha')?>" style="right:-26%">
	<div class="janelaSintaxe-conteudo"><?=get('sintaxe')?></div>
</div>
</body>
</html>
