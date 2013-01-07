// Represeta o editor com um todo
var Editor = {}

// Indica o número de novos livros criados
Editor.numNovosLivros = 0

// Contém uma referência ao elementos copiados (deve-se clona-los antes de colar)
Editor.colagem = []

// Indica o tipo de elementos copiados ("paginas" ou "anexos")
Editor.tipoColagem = ""

// Evita que a pessoa feche sem salvar algum arquivo
addEventListener("beforeunload", function (evento) {
	var i
	for (i=0; i<InterfaceAbas.abas.length; i++)
		if (InterfaceAbas.abas[i].livro.modificado) {
			evento.preventDefault()
			return
		}
})

// Cria um livro vazio
Editor.criarNovoLivro = function () {
	var livro, pagina, indice, cabecalho, texto, aba, i, anexo
	
	// Cria o livro
	Editor.numNovosLivros++
	livro = new Livro
	livro.nome = "Sem título "+Editor.numNovosLivros
	livro.criacao = Date.now()
	livro.modificacao = Date.now()
	livro.novo = true
	
	;(function () {
		var indice = new SubIndice
		indice.nome = "Páginas"
		livro.indices.push(indice)
	})()
	
	// Cria elementos básicos
	for (i=1; i<=3; i++) {
		pagina = new Pagina
		cabecalho = new Cabecalho
		cabecalho.texto = "Página "+i
		texto = new Texto
		texto.texto = "Basta escrever seu texto aqui"
		pagina.elementos.push(cabecalho)
		pagina.elementos.push(texto)
		indice = new FolhaIndice
		indice.nome = "Página "+i
		indice.pagina = pagina
		anexo = new Anexo
		anexo.nome = "Anexo "+i
		anexo.conteudo = Compilador.sanitizar("\\<< "+i+" + \\>>")
		livro.paginas.push(pagina)
		livro.indices.push(indice)
		livro.anexos.push(anexo)
		livro.indices[0].indices.push(indice.clonar())
	}
	indice = new FolhaIndice
	indice.nome = "Página x"
	livro.indices.push(indice)
		
	// Exibe
	aba = new Aba(livro)
	InterfaceAbas.abas.push(aba)
	Interface.abaFoco = aba
	
	return livro
}

// Aplica a auto paginação no livro aberto
Editor.autoPaginar = function () {
	var elementos, i, j, paginas, pagina, soCabecalhos, paginasAntes, livro, inicios, relacao, focoAntes, indices, novosIndices, inicios2
	
	// Junta todos os elementos
	livro = Interface.abaFoco.livro
	focoAntes = livro.paginas.indexOf(Interface.abaFoco.paginaFoco)
	inicios = []
	elementos = []
	for (i=0; i<livro.paginas.length; i++) {
		inicios.push(elementos.length)
		for (j=0; j<livro.paginas[i].elementos.length; j++)
			elementos.push(livro.paginas[i].elementos[j])
	}
	
	// Vai separando
	paginas = []
	pagina = new Pagina
	soCabecalhos = true
	relacao = [] // Relação entre o número da página antes e depois
	inicios2 = [0]
	for (i=0; i<elementos.length; i++) {
		if ((elementos[i] instanceof Cabecalho) && elementos[i].nivel < 3 && !soCabecalhos) {
			// Quebra a página
			paginas.push(pagina)
			pagina = new Pagina
			inicios2.push(i)
			soCabecalhos = true
		}
		if (!(elementos[i] instanceof Cabecalho))
			soCabecalhos = false
		pagina.elementos.push(elementos[i])
		if (inicios.indexOf(i) != -1)
			relacao.push(paginas.length)
	}
	if (pagina.elementos.length)
		paginas.push(pagina)
	
	// Verifica se houve alguma alteração
	if (inicios.length == inicios2.length) {
		for (i=0; i<inicios.length; i++)
			if (inicios[i] != inicios2[i])
				break
		if (i == inicios.length)
			// Nada a fazer
			return
	}
	
	// Costrói o novo índice
	indices = livro.indices
	var atualizarIndice = function (indice) {
		if (indice instanceof FolhaIndice)
			indice.pagina = paginas[relacao[livro.paginas.indexOf(indice.pagina)]]
		else
			indice.indices.forEach(atualizarIndice)
	}
	novosIndices = indices.map(function (indice) {
		return indice.clonar()
	})
	novosIndices.forEach(atualizarIndice)
	
	// Executa a ação
	paginasAntes = livro.paginas
	new Acao("auto paginação", function () {
		livro.paginas = paginas
		livro.indices = novosIndices
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(livro.paginas[relacao[focoAntes]])
		InterfaceIndices.atualizar()
	}, function () {
		livro.paginas = paginasAntes
		livro.indices = indices
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(livro.paginas[focoAntes])
		InterfaceIndices.atualizar()
	})
}
