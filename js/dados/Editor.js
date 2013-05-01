// Represeta o editor com um todo
var Editor = {}

// Indica o número de novos livros criados
Editor.numNovosLivros = 0

// Contém uma referência ao elementos copiados (deve-se clona-los antes de colar)
Editor.colagem = []

// Indica o tipo de elementos copiados ("paginas" ou "anexos")
Editor.tipoColagem = ""

// Evita que a pessoa feche sem salvar algum arquivo
// Também salva a sessão ativa
addEventListener("beforeunload", function (evento) {
	var i, ids = [], prevenir = false
	for (i=0; i<InterfaceAbas.abas.length; i++) {
		if (InterfaceAbas.abas[i].livro.modificado)
			prevenir = true
		ids.push(InterfaceAbas.abas[i].livro.id)
	}
	if (prevenir)
		evento.preventDefault()
	localStorage.setItem("editorHP-sessao", JSON.stringify(ids))
})

// Carrega os livros abertos da última vez
Editor.reabrirSessao = function () {
	var str, ids, i, n, arquivo, livro, aba
	str = localStorage.getItem("editorHP-sessao")
	n = 0
	if (str != null) {
		ids = JSON.parse(str)
		for (i=0; i<ids.length; i++)
			if (ids[i] in Arquivo.arquivos) {
				arquivo = Arquivo.arquivos[ids[i]]
				livro = Compilador.inflar(arquivo.conteudo)
				livro.id = arquivo.id
				aba = new Aba(livro)
				InterfaceAbas.abas.push(aba)
				n++
			}
	}
	if (n == 0)
		Editor.criarNovoLivro()
	else
		Interface.abaFoco = aba
}

// Cria um livro vazio
Editor.criarNovoLivro = function () {
	var livro, pagina, indice, cabecalho, texto, aba
	
	// Cria o livro
	Editor.numNovosLivros++
	livro = new Livro
	livro.nome = _("semTitulo")+" "+Editor.numNovosLivros
	livro.criacao = Date.now()
	livro.modificacao = Date.now()
	livro.novo = true
	
	// Cria elementos básicos
	pagina = new Pagina
	cabecalho = new Cabecalho
	cabecalho.texto = _("paginaInicial")
	texto = new Texto
	texto.texto = _("paragrafoInicial")
	pagina.elementos.push(cabecalho)
	pagina.elementos.push(texto)
	indice = new FolhaIndice
	indice.nome = _("paginaInicial")
	indice.pagina = pagina
	indice.cabecalho = cabecalho
	livro.paginas.push(pagina)
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
	new Acao(_("acaoAutoPaginacao"), function () {
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

// Aplica a auto indexação num livro
// Se o livro não for dado, usa o livro atualmente aberto e dispara uma ação caso seja alterado
Editor.autoIndexar = function (livro) {
	var novosIndices, i, j, elemento, ultimoNivel, localAtual, dif, novo, ultimo, temp, antes, criado, background
	
	// Sobe até a raiz
	var subir = function () {
		while (localAtual.acima) {
			temp = localAtual.acima
			delete localAtual.acima
			localAtual = temp
		}
	}
	
	background = false
	if (livro === undefined)
		livro = Interface.abaFoco.livro
	else
		background = true
	
	// Percorre cada página, criando os índices para os cabecalhos
	novosIndices = []
	novosIndices.acima = null
	localAtual = novosIndices
	ultimoNivel = 6
	for (i=0; i<livro.paginas.length; i++) {
		criado = false
		for (j=0; j<livro.paginas[i].elementos.length; j++) {
			elemento = livro.paginas[i].elementos[j]
			if (elemento instanceof Cabecalho) {
				dif = ultimoNivel-elemento.nivel
				if (dif < 0) {
					// Transforma o último índice folha em sub-índice
					ultimo = localAtual[localAtual.length-1]
					novo = new SubIndice
					novo.nome = ultimo.nome
					novo.indices.push(ultimo)
					novo.cabecalho = ultimo.cabecalho
					localAtual[localAtual.length-1] = novo
					
					// Desce e cria um índice folha
					temp = localAtual
					localAtual = novo.indices
					localAtual.acima = temp
				} else {
					// Sobe (se necessário e até onde der) e cria um índice folha
					while (localAtual.acima && dif) {
						temp = localAtual.acima
						delete localAtual.acima
						localAtual = temp
						dif--
					}
				}
				novo = new FolhaIndice
				novo.nome = elemento.texto
				novo.pagina = livro.paginas[i]
				novo.cabecalho = elemento
				localAtual.push(novo)
				ultimoNivel = elemento.nivel
				criado = true
			}
		}
		
		// Força um índice caso a página não tenha cabeçalhos
		if (!criado) {
			subir()
			novo = new FolhaIndice
			novo.nome = _("pagina")+" "+(i+1)
			novo.pagina = livro.paginas[i]
			localAtual.push(novo)
			ultimoNivel = 6
		}
	}
	
	// Sobe para a raiz
	subir()
	delete localAtual.acima
	
	// Limpa índices redundantes
	var limpar = function (indices) {
		var i
		if (indices.length>1 && indices[0] instanceof FolhaIndice && indices[0].pagina == indices[1].pagina)
			indices.splice(0, 1)
		for (i=0; i<indices.length; i++)
			if (indices[i] instanceof SubIndice)
				limpar(indices[i].indices)
	}
	limpar(novosIndices)
	
	// Se a operação for feita em background, já aplica o novo resultado
	if (background) {
		livro.indices = novosIndices
		return
	}
	
	// Compara o resultado para ver se mudou alguma coisa
	antes = livro.indices
	var saoDiferentes = function (indicesA, indicesB) {
		var i
		if (indicesA.length != indicesB.length)
			return true
		for (i=0; i<indicesA.length; i++) {
			if ((indicesA[i] instanceof FolhaIndice) && (indicesB[i] instanceof FolhaIndice)) {
				if (indicesA[i].nome != indicesB[i].nome || indicesA[i].pagina != indicesB[i].pagina)
					return true
			} else if ((indicesA[i] instanceof SubIndice) && (indicesB[i] instanceof SubIndice)) {
				if (indicesA[i].nome != indicesB[i].nome || saoDiferentes(indicesA[i].indices, indicesB[i].indices))
					return true
			} else
				return true
		}
		return false
	}
	if (!saoDiferentes(antes, novosIndices))
		return
	
	// Aplica os novos índices
	new Acao(_("acaoAutoIndexacao"), function () {
		livro.indices = novosIndices
		InterfaceIndices.atualizar()
	}, function () {
		livro.indices = antes
		InterfaceIndices.atualizar()
	})
}
