// Arquivo de línguagem para o inglês
// Substituições para o JS
var strs = {
	erroAbrirUrl: "Error on open URL",
	erroGerarUrl: "Error on generate URL",
	erroInterno: "Internal error, please save and reload the page",
	erroAbrirImagem: "Error on open image",
	erroCarregarImagem: "Error on load image",
	semTitulo: "Untitled",
	paginaInicial: "Initial page",
	paragrafoInicial: "Just write your text here\nMore at sitegui.com.br",
	acaoAutoPaginacao: "auto page",
	pagina: "Page",
	acaoAutoIndexacao: "auto index",
	titulo: "HP Editor - #",
	fecharJanela: "Close window",
	fecharArquivo: "Close file",
	renomear: "Rename #",
	novoNome: "New name",
	renomeacao: "book renaming",
	fecharSemSalvar: "Close without saving",
	fecharSemSalvar_conteudo: "Do you really want to close this book and lose all unsaved modifications?",
	alteracaoPagina: "change in page #",
	desfazerNada: "Nothing to be undone",
	desfazer: "Undo # (Ctrl+Z)",
	refazerNada: "Nothin to be redone",
	refazer: "Redo # (Ctrl+Shift+Z)",
	autoIndexacao: "Auto index",
	autoIndexacao_dica: "Auto indexing automatically creates the index for the pages, using headers in the text for that",
	autoIndexacao_ativar: "Turn auto index on",
	autoIndexacao_ativacao: "turning auto index on",
	autoIndexacao_desativacao: "turning auto index off",
	movimentacaoIndice: "moving index",
	remocaoIndice: "removing an index",
	criarIndice: "Create an index",
	paginaAlvo: "Target page",
	criacaoIndice: "creating an index",
	editarIndice: "Edit index",
	edicaoIndice: "altering an index",
	movimentacaoAnexo: "moving attachment",
	remocaoAnexos: ["removing one attachment", "removing # attachments"],
	novoAnexo: "New attachment",
	nome: "Name",
	anexoConteudo: "Content (must be a valid value for HP)",
	insercaoAnexo: "creating an attachment",
	colagemAnexos: ["pasting one attachment", "pasting # attachment"],
	editarAnexo: "Edit attachment",
	edicaoAnexo: "editing an attachment",
	urlGerada: "Generated URL",
	urlGerada_dica: "Just copy-paste this link in your browser to download the file. Or use the 'open link' option to edit it again",
	salvarComo: "Save # as",
	salvar: "Save #",
	autoPaginacao: "Auto page",
	autoPaginacao_dica: "Auto paging divides the book automatically in pages, according to the headers in the text",
	autoPaginacao_ativar: "Activate auto page",
	autoPaginacao_ativacao: "turning auto page on",
	autoPaginacao_desativacao: "turning auto page off",
	movimentacaoPagina: "moving a page",
	remocaoPaginas: ["deleting a page", "deleting # pages"],
	insercaoPagina: "creating a page",
	colagemPaginas: ["pasting a page", "pasting # pages"],
	urlInvalida: "Invalida URL",
	semArquivos: "You don't have any recently saved file",
	hoje: "today",
	ontem: "yesterday",
	diasAtras: "# day ago",
	mesPassado: "last month",
	mesesAtras: "# months ago",
	erroArquivoAberto: "This file is currently opened by the editor, please close it first",
	excluirArquivo: "Delete file",
	excluirArquivo_conteudo: "Are you sure to delete permanently this file from the list?",
	inserirImagem: "Insert image",
	inserirImagem_arquivo: "Insert imagem from file",
	inserirImagem_url: "or URL",
	ou: "or",
	desenharAgora: "draw it now",
	dica0: "Bem-vindo ao editor de textos para a HP50g. Basta escrever o que quiser no campo acima que tudo acontece",
	dica1: "Use cabeçalhos pra facilitar a navegação. O editor divide seu texto em páginas e cria o índice com base neles",
	dica2: "Quando quiser, clique salvar para poder baixar o arquivo para a sua calculadora",
	dica3: "Salve esse arquivo diretamente num cartão SD (ou use cabo+software). Para abri-lo na calculadora, vá em FILES > SD > seuarquivo > EVAL",
	dica4: "Seus arquivos antigos ficam sempre salvos no seu navegador. Para vê-los clique no menu Abrir",
	dica5: "Você pode também pode editar um arquivo já baixado. Basta clicar ir no menu Abrir > Upload",
	dica6: "Se quiser desativar a criação automática de páginas e índices, clique no botão &#9660; nos paineis Páginas e Índices",
	dica7: "Você pode trocar páginas, anexos e índices de lugar. Basta arrasta-los",
	dica8: "Você pode anexar equações, fórmulas, tabelas e imagens junto com seu arquivo",
	dica9: "Gostou desse programa? Fale para seus amigos! Ajude a <a href='https://github.com/sitegui/editorHP/' target='_blank'>desenvolver</a> mais ferramentas"
}

// Retorna a tradução correta para o texto
function _(chave, valor) {
	var str
	valor = valor || 0
	if (chave in strs) {
		str = strs[chave]
		if (typeof str != "string")
			// Seleciona a versão de plural correta
			str = valor==1 ? str[0] : str[1]
		return str.replace("#", valor)
	} else
		return "[["+chave+"]]"
}
