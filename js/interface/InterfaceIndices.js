// Controla a interface dos índices
var InterfaceIndices = {}

// Guarda a última div clicada
InterfaceIndices.foco = null

// Define os ouvintes dos botões
InterfaceIndices.init = function () {
	get("indices-remover").onclick = InterfaceIndices.remover
	get("indices-acrescentar").onclick = InterfaceIndices.adicionar
	get("indices-opcoes").onclick = function () {
		opcoes = {}
		opcoes.titulo = "Auto indexação"
		opcoes.conteudo = "<p>A função de auto indexação cria automaticamente os índices para as páginas de acordo com os cabeçalhos presentes no texto</p>"+
			"<p><input type='checkbox' id='js-check'"+(Interface.abaFoco.livro.autoIndexacao ? " checked" : "")+"> <label for='js-check'>Ativar auto indexação</label></p>"
		opcoes.onconfirmar = function () {
			var antes = Interface.abaFoco.livro.autoIndexacao, novo = get("js-check").checked
			if (novo == antes)
				return
			new Acao((novo ? "ativação" : "desativação")+" da auto indexação", function () {
				Interface.abaFoco.livro.autoIndexacao = novo
			}, function () {
				Interface.abaFoco.livro.autoIndexacao = antes
			})
			if (Interface.abaFoco.livro.autoIndexacao)
				Editor.autoIndexar()
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	}
	get("indices").onclick = function (evento) {
		// Se clicar fora de todos os anexos, deseleciona
		if (evento.target == evento.currentTarget) {
			InterfaceIndices.foco = null
			InterfaceIndices.atualizarLayout()
		}
	}
}

// Atualiza a lista de índices
InterfaceIndices.atualizar = function () {
	var indices, i, div
	
	// Gera os índices recursivamente
	var gerarIndice = function (indice, nivel) {
		var i
		div.appendChild(InterfaceIndices.criarDiv(indice, nivel))
		if (indice instanceof SubIndice)
			for (i=0; i<indice.indices.length; i++)
				gerarIndice(indice.indices[i], nivel+1)
	}
	
	indices = Interface.abaFoco.livro.indices
	div = get("indices")
	InterfaceIndices.foco = null
	div.innerHTML = ""
	for (i=0; i<indices.length; i++)
		gerarIndice(indices[i], 1)
	
	InterfaceIndices.atualizarLayout()
}

// Atualiza somente o layout dos índices, sem trocar as divs
InterfaceIndices.atualizarLayout = function () {
	var div, divs, i, indice, subFoco, nivelFoco, pos, subdiv
	
	// Atualiza a exibição dos indices focados
	div = get("indices")
	divs = div.childNodes
	subFoco = false
	nivelFoco = 0
	for (i=0; i<divs.length; i++) {
		indice = divs.item(i)
		if (subFoco && Number(indice.dataset.nivel)<=nivelFoco)
			subFoco = false
		indice.classList[subFoco ? "add" : "remove"]("indice-subFoco")
		if (indice==InterfaceIndices.foco) {
			indice.classList.add("indice-foco")
			subFoco = true
			nivelFoco = Number(indice.dataset.nivel)
		} else
			indice.classList.remove("indice-foco")
		
		// Atualiza o número da página alvo
		if (indice.childNodes.length>1) {
			subdiv = indice.childNodes.item(1)
			pos = Interface.abaFoco.livro.paginas.indexOf(InterfaceIndices.getIndice(indice).pagina)
			subdiv.textContent = pos+1
			subdiv.classList[pos==-1 ? "add" : "remove"]("indice-alvo-erro")
			subdiv.classList[pos==-1 ? "add" : "remove"]("minibotao-vermelho")
			subdiv.classList[pos!=-1 ? "add" : "remove"]("minibotao-azul")
			
			// Coloca subFoco se a página apontada está na área de edição
			if (pos != -1 && Interface.abaFoco.livro.paginas[pos] == Interface.abaFoco.paginaFoco)
				indice.classList.add("indice-subFoco")
		}
	}
	
	// Coloca a barra de rolagem
	div.classList[div.scrollHeight>div.clientHeight ? "add" : "remove"]("painel-comRolagem")
	
	// Habilita ou desabilita o botão de remover
	get("indices-remover").classList[InterfaceIndices.foco ? "remove" : "add"]("botao-inativo")
}

// Remove o índice selecionado
InterfaceIndices.remover = function () {
	var indice, arrayPai
	
	if (!InterfaceIndices.foco)
		return
	
	indice = InterfaceIndices.getIndice(InterfaceIndices.foco)
	
	// Busca a array e posição que esse indice ocupa
	var buscarIndice = function (indices) {
		var pos, i, r
		pos = indices.indexOf(indice)
		if (pos != -1)
			return indices
		for (i=0; i<indices.length; i++)
			if ((indices[i] instanceof SubIndice) && (r = buscarIndice(indices[i].indices)))
				return r
		return null
	}
	arrayPai = buscarIndice(Interface.abaFoco.livro.indices)
	pos = arrayPai.indexOf(indice)
	
	new Acao("remoção de um índice", function () {
		arrayPai.splice(pos, 1)
		InterfaceIndices.atualizar()
	}, function () {
		arrayPai.splice(pos, 0, indice)
		InterfaceIndices.atualizar()
	})
}

// Adiciona um índice após o selecionado
InterfaceIndices.adicionar = function () {
	var indice, opcoes, select, i, pos, arrayPai
	
	// Pega a posição que vai inserir
	// Busca a array e posição que esse indice ocupa
	var buscarIndice = function (indices) {
		var pos, i, r
		pos = indices.indexOf(indice)
		if (pos != -1)
			return indices
		for (i=0; i<indices.length; i++)
			if ((indices[i] instanceof SubIndice) && (r = buscarIndice(indices[i].indices)))
				return r
		return null
	}
	if (InterfaceIndices.foco) {
		indice = InterfaceIndices.getIndice(InterfaceIndices.foco)
		arrayPai = buscarIndice(Interface.abaFoco.livro.indices)
		pos = arrayPai.indexOf(indice)+1
	} else {
		arrayPai = Interface.abaFoco.livro.indices
		pos = arrayPai.length
	}
	
	opcoes = {}
	opcoes.titulo = "Criar índice"
	opcoes.conteudo = "<p>Nome: <input size='30' id='js-nome'></p>"
	select = ""
	for (i=0; i<Interface.abaFoco.livro.paginas.length; i++)
		select += "<option value='"+i+"'>"+(i+1)+"</option>"
	opcoes.conteudo += "<p>Página alvo: <select id='js-pagina'>"+select+"</select></p>"
	opcoes.onconfirmar = function () {
		var nome, pagina, indice
		
		nome = Compilador.sanitizar(get("js-nome").value)
		pagina = Number(get("js-pagina").value)
		if (!nome)
			return
		
		indice = new FolhaIndice
		indice.nome = nome
		indice.pagina = Interface.abaFoco.livro.paginas[pagina]
		new Acao("criação de um índice", function () {
			arrayPai.splice(pos, 0, indice)
			InterfaceIndices.atualizar()
		}, function () {
			arrayPai.splice(pos, 1)
			InterfaceIndices.atualizar()
		})
	}
	Interface.abrirJanela("janelaBasica", opcoes)
}

// Edita o índice focado
InterfaceIndices.editar = function () {
	var indice, opcoes, select, i, nomeAntigo, paginaAntiga
	
	if (!InterfaceIndices.foco)
		return
	
	indice = InterfaceIndices.getIndice(InterfaceIndices.foco)
	nomeAntigo = indice.nome
	opcoes = {}
	opcoes.titulo = "Editar índice"
	opcoes.conteudo = "<p>Nome: <input size='30' id='js-nome' value=\""+Compilador.desanitizar(nomeAntigo).replace(/"/g, "&quot;")+"\"></p>"
	if (indice instanceof FolhaIndice) {
		select = ""
		paginaAntiga = Interface.abaFoco.livro.paginas.indexOf(indice.pagina)
		for (i=0; i<Interface.abaFoco.livro.paginas.length; i++)
			select += "<option value='"+i+"'"+(i==paginaAntiga ? " selected" : "")+">"+(i+1)+"</option>"
		opcoes.conteudo += "<p>Página alvo: <select id='js-pagina'>"+select+"</select></p>"
	}
	opcoes.onconfirmar = function () {
		var nome, pagina
		
		nome = Compilador.sanitizar(get("js-nome").value)
		if (indice instanceof FolhaIndice)
			pagina = Number(get("js-pagina").value)
		if (!nome)
			return
		
		new Acao("edição de um índice", function () {
			indice.nome = nome
			if (indice instanceof FolhaIndice)
				indice.pagina = Interface.abaFoco.livro.paginas[pagina]
			InterfaceIndices.atualizar()
		}, function () {
			indice.nome = nomeAntigo
			if (indice instanceof FolhaIndice)
				indice.pagina = paginaAntiga==-1 ? null : Interface.abaFoco.livro.paginas[paginaAntiga]
			InterfaceIndices.atualizar()
		})
	}
	Interface.abrirJanela("janelaBasica", opcoes)
}

// Pega o anexo associado à div
InterfaceIndices.getIndice = function (div) {
	var i, r, indices
	
	var buscarIndice = function (indice) {
		var i, r
		if (indice.id == div.dataset.indice)
			return indice
		if (indice instanceof SubIndice)
			for (i=0; i<indice.indices.length; i++)
				if (r = buscarIndice(indice.indices[i]))
					return r
	}
	
	indices = Interface.abaFoco.livro.indices
	for (i=0; i<indices.length; i++)
		if (r = buscarIndice(indices[i]))
			return r
	
	return null
}

// Cria a div pra guardar um índice
InterfaceIndices.criarDiv = function (indice, nivel) {
	var div, pos, subdiv
	
	// Cria a div
	div = document.createElement("div")
	div.className = "indice"+nivel
	div.textContent = Compilador.desanitizar(indice.nome)
	div.dataset.indice = indice.id
	div.dataset.nivel = nivel
	
	// Define os ouvintes para a div principal
	div.addEventListener("click", function () {
		InterfaceIndices.foco = div
		InterfaceIndices.atualizarLayout()
	}, true)
	div.ondblclick = InterfaceIndices.editar
	
	if (indice instanceof FolhaIndice) {
		// Coloca o número da página
		subdiv = document.createElement("div")
		subdiv.classList.add("indice-alvo")
		div.appendChild(subdiv)
		
		// Define o ouvinte
		subdiv.onclick = function (evento) {
			var pos = Number(subdiv.textContent)
			if (pos)
				// Vai para a página apontada
				get("paginas").childNodes.item(pos-1).click()
			else
				// Página incorreta: abre a edição para corrigi-la
				InterfaceIndices.editar()
		}
	}
	
	return div
}
