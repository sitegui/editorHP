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
	var livro, pagina, indice, cabecalho, texto, aba
	
	// Cria o livro
	Editor.numNovosLivros++
	livro = new Livro
	livro.nome = "Sem título "+Editor.numNovosLivros
	livro.criacao = Date.now()
	livro.modificacao = Date.now()
	livro.novo = true
	
	// Cria elementos básicos
	pagina = new Pagina
	cabecalho = new Cabecalho
	cabecalho.texto = "Página inicial"
	texto = new Texto
	texto.texto = "Basta escrever seu texto aqui"
	pagina.elementos.push(cabecalho)
	pagina.elementos.push(texto)
	indice = new FolhaIndice
	indice.nome = "Página inicial"
	indice.pagina = pagina
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

// Aplica a auto indexação no livro aberto
Editor.autoIndexar = function () {
	var novosIndices, i, livro, j, elemento, ultimoNivel, localAtual, dif, novo, ultimo, temp, antes, criado
	
	// Sobe até a raiz
	var subir = function () {
		while (localAtual.acima) {
			temp = localAtual.acima
			delete localAtual.acima
			localAtual = temp
		}
	}
	
	// Percorre cada página, criando os índices para os cabecalhos
	novosIndices = []
	novosIndices.acima = null
	localAtual = novosIndices
	livro = Interface.abaFoco.livro
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
				localAtual.push(novo)
				ultimoNivel = elemento.nivel
				criado = true
			}
		}
		
		// Força um índice caso a página não tenha cabeçalhos
		if (!criado) {
			subir()
			novo = new FolhaIndice
			novo.nome = "Página "+(i+1)
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
		if (indices.length>1 && indices[0].pagina == indices[1].pagina)
			indices.splice(0, 1)
		for (i=0; i<indices.length; i++)
			if (indices[i] instanceof SubIndice)
				limpar(indices[i].indices)
	}
	limpar(novosIndices)
	
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
	new Acao("auto indexação", function () {
		livro.indices = novosIndices
		InterfaceIndices.atualizar()
	}, function () {
		livro.indices = antes
		InterfaceIndices.atualizar()
	})
}
