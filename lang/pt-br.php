<?php
// Arquivo de línguagem para o português brasileiro
// Substituições no HTML
$strs = array(
	'abrir' => 'Abrir',
	'salvar' => 'Salvar',
	'ajuda' => 'Ajuda',
	'bug' => 'Informar bug',
	'novaAba' => 'Novo livro (Ctrl+N)',
	'upload' => 'Upload',
	'novo' => 'Novo',
	'gerarArquivo' => 'Gerar arquivo',
	'somenteSalvar' => 'Somente salvar',
	'salvarTodos' => 'Salvar todos',
	'salvarComo' => 'Salvar como',
	'inserir' => 'Inserir',
	'excluir' => 'Excluir',
	'copiar' => 'Copiar',
	'colar' => 'Colar',
	'recortar' => 'Recortar',
	'fina' => 'Fina',
	'media' => 'Média',
	'grossa' => 'Grossa',
	'paginas' => 'Páginas',
	'autoPaginacao' => 'Auto paginação',
	'removerPaginas' => 'Remover páginas',
	'adicionarPagina' => 'Adicionar página',
	'formatacao' => 'Formatação',
	'paragrafo' => 'Parágrafo',
	'equacao' => 'Equação',
	'titulo1' => 'Título 1',
	'titulo2' => 'Título 2',
	'titulo3' => 'Título 3',
	'titulo4' => 'Título 4',
	'titulo5' => 'Título 5',
	'inserirImagem' => 'Inserir imagem',
	'inserirRegua' => 'Inserir regua horizontal',
	'inserirChar' => 'Inserir caractere especial',
	'alinhamento' => 'Alinhamento',
	'esquerda' => 'Alinhar à esquerda',
	'centro' => 'Centralizar',
	'direita' => 'Alinhar à direita',
	'indices' => 'Índices',
	'autoIndexacao' => 'Auto indexação',
	'removerIndice' => 'Remover índice',
	'adicionarIndice' => 'Adicionar índice',
	'anexos' => 'Anexos',
	'removerAnexos' => 'Remover anexos',
	'adicionarAnexo' => 'Adicionar anexo',
	'abrirArquivo' => 'Abrir arquivo',
	'recentes' => 'Recentes',
	'uploadIntro' => 'Selecione um arquivo *.hp do seu computador',
	'sobre' => 'Sobre',
	'formato' => 'Formato',
	'creditos' => 'Créditos',
	'ajudaSobre' => '<h1>EditorHP - Versão 1.2 (20/04/2013)</h1>
		<p>Veja um vídeo explicando claramente <a href="http://youtube.com/watch?v=wUA79P--I8g" target="_blank">como usar o editor</a></p>
		<p>Também sugiro fortemente olhar esse <a href="http://youtube.com/watch?v=OQNAKLPuw0c" target="_blank">tutorial</a> em caso de maiores dúvidas. Nesse <a href="http://www.youtube.com/user/jrozsas" target="_blank">mesmo canal</a>, tem vários outros tutoriais para esse editor</p>
		<p>Esse é um editor de texto para a calculadora HP50g feito em HTML, CSS e JS que funciona em FF 15+, Chrome. Ele gera um arquivo binário que pode ser salvo diretamente no cartão de memória SD ou passado por cabo por meio do programa oficial da HP. Não é preciso ter nada instalado na calculadora, além de que o arquivo pode ser aberto e editado novamente.</p>
		<p><strong>Privacidade</strong><br>Seus dados são mantidos somente no seu navegador, para exclui-los basta limpar o cache. Algumas operações enviam dados para o servidor sitegui.com.br, mas nada é mantido por ele ou usado de qualquer outra forma.</p>',
	'ajudaFormato' => '<p>Cada arquivo de texto (chamado livro) é baseado em páginas, que contém textos (cabeçalhos e parágrafos), equações e imagens. O acesso a essas páginas é feito por meio de um índice. Além disso é possível anexar objetos (como equações, matrizes, fórmulas, gráficos) ao livro. O editor automaticamente divide seu texto em páginas e cria os índices para facilitar a navegação na calculadora.</p>',
	'ajudaCreditos' => '<p><strong>Idealizador, programador, designer e feliz</strong><br>Guilherme de Oliveira Souza (<a href="http://sitegui.com.br">sitegui.com.br</a>)<br><a href="#" onclick="window.open(\'/fale_conosco/?assunto=editorHP\', \'janelaFaleConosco\', \'width=500,height=500\'); return false">Fale Conosco</a></p>
		<p><strong>Código fonte</strong><br><a href="https://github.com/sitegui/editorHP/" target="_blank">github.com/sitegui/editorHP</a></p>
		<p><strong>Fundo</strong><br><a href="http://subtlepatterns.com/" target="_blank">subtlepatterns.com</a></p>
		<p><strong>Ícone</strong><br><a href="http://www.findicons.com/" target="_blank">findicons.com</a></p>
		<p><strong>Vídeos de ajuda</strong><br><a href="http://engenhariacotidiana.com/" target="_blank">engenhariacotidiana.com</a> e <a href="http://www.youtube.com/user/jrozsas" target="_blank">João Leonardo Rozsas</a></p>
		<p><strong>Licença</strong><br><a href="http://www.gnu.org/licenses/gpl.html" target="_blank">GNU GENERAL PUBLIC LICENSE</a><br>Copyright 2013 Guilherme de Oliveira Souza</p>',
	'cancelar' => 'Cancelar',
	'confirmar' => 'Confirmar',
	'ajustarImagem' => 'Ajustar imagem',
	'filtro' => 'Filtro',
	'basico' => 'Básico',
	'areas' => 'Áreas',
	'ajuste' => 'Ajuste',
	'ajusteDica' => 'valor entre -100 e 100',
	'tamanho' => 'Tamanho',
	'tamanhoDica' => 'o visor da HP tem 131 pixels',
	'imagemAviso' => 'Não é possível editar essa imagem, pois o arquivo original foi perdido',
	'trocar' => 'Trocar',
	'remover' => 'Remover',
	'carregando' => 'Carregando&hellip;',
	'cliqueFecha' => 'Clique para fechar',
	'criarDesenho' => 'Criar desenho',
	'avisoCores' => 'Evite usar cores do mesmo grupo, pois elas não são diferenciáveis na calculadora',
	'preto' => 'Preto',
	'branco' => 'Branco',
	'vermelho' => 'Vermelho',
	'verde' => 'Verde',
	'azul' => 'Azul',
	'azulPiscina' => 'Azul piscina',
	'rosa' => 'Rosa',
	'amarelo' => 'Amarelo',
	'limpar' => 'Limpar',
	'desfazer' => 'Desfazer (Ctrl+Z)',
	'refazer' => 'Refazer (Ctrl+Shift+Z)',
	'linguaAtual' => 'Português',
	'pt-br' => 'Português',
	'en' => 'English',
	'cliqueAbreFecha' => 'Clique para abrir/fechar',
	'sintaxe' => '<h1>Sintaxe para equações</h1>
		Expressão: <code>\'X+1\'</code><br>
		Expressão: <code>\'Δ = B^2-4*A*C\'</code><br>
		Derivada: <code>\'A(X) = ∂t(V(X))\'</code><br>
		Integral: <code>\'∫(0, X, EXP(t), t)\'</code><br>
		Vetor: <code>[3 \'X*COS(θ)\']</code><br>
		Matriz: <code>[[1 \'A\'][3 4]]</code><br>
		Lista: <code>{\'X = 3\' (1.,-1.)}</code>',
	'baixarBiblioteca' => 'Baixar biblioteca',
	'download' => 'Download',
	'janelaDownload' => '<div><p>Seu arquivo está compilado. Para abri-lo na calculadora siga os passos:</p>
		<ol>
		<li><a id="janelaDownload-link" title="Clique para fazer o download">Clique aqui para baixa-lo</a></li>
		<li>Salve-o num cartão SD de até 2 GiB</li>
		<li>Coloque o cartão na calculadora HP50g desligada</li>
		<li>Vá em FILES (shift branco + APPS)</li>
		<li>Selecione a porta 3:SD e pressione a seta da direita</li>
		<li>Selecione-o na lista e pressione a opção EVAL da tela (F5)</li>
		</ol></div>',
	'feedback' => 'Entre em contato',
	'enviar' => 'Enviar',
	'feedback-intro' => 'Escreva sua dúvida, reclamação ou elogio abaixo e, se possível, <u>diga seu nome e email</u> para podermos responder',
	'email' => 'Email',
	'feedback-anon' => 'Não desejo informar meu email e estou ciente de que não serei respondido',
	'mensagem' => 'Mensagem',
	'feedback-userAgent' => 'Dados do seu navegador',
	'feedback-arquivo' => 'Desejo enviar também o arquivo atualmente aberto para analisarmos melhor seu problema'
);
