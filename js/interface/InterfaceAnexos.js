// Controla a exibição dos anexos
var InterfaceAnexos = {}

// Último anexo clicado
InterfaceAnexos.foco = null

// Anexos selecionados
InterfaceAnexos.selecao = []

// Define os ouvintes do botões
InterfaceAnexos.init = function () {
	get("anexos-remover").onclick = InterfaceAnexos.remover
	get("anexos-acrescentar").onclick = InterfaceAnexos.adicionar
	get("anexos").oncontextmenu = function (evento) {
		Interface.abrirMenu(evento, "submenuEdicao")
		
		// Ajusta o estado das opções
		get("submenuEdicao-inserir").classList.remove("submenu-item-desabilitado")
		get("submenuEdicao-excluir").classList[InterfaceAnexos.selecao.length ? "remove" : "add"]("submenu-item-desabilitado")
		get("submenuEdicao-copiar").classList[InterfaceAnexos.selecao.length ? "remove" : "add"]("submenu-item-desabilitado")
		get("submenuEdicao-colar").classList[Editor.tipoColagem=="anexos" ? "remove" : "add"]("submenu-item-desabilitado")
		get("submenuEdicao-recortar").classList[InterfaceAnexos.selecao.length ? "remove" : "add"]("submenu-item-desabilitado")
		
		// Define os ouvintes
		get("submenuEdicao-inserir").onclick = InterfaceAnexos.adicionar
		get("submenuEdicao-excluir").onclick = InterfaceAnexos.remover
		get("submenuEdicao-copiar").onclick = InterfaceAnexos.copiar
		get("submenuEdicao-colar").onclick = InterfaceAnexos.colar
		get("submenuEdicao-recortar").onclick = InterfaceAnexos.recortar
		evento.preventDefault()
	}
	get("anexos").onclick = function (evento) {
		// Se clicar fora de todos os anexos, deseleciona todos
		if (evento.target == evento.currentTarget) {
			InterfaceAnexos.foco = null
			InterfaceAnexos.selecao = []
			InterfaceAnexos.atualizarLayout()
		}
	}
	
	// Torna ordenável os anexos
	new Ordenavel("anexos", function (antes, depois) {
		new Acao("movimentação do anexo", function () {
			var anexo = Interface.abaFoco.livro.anexos.splice(antes, 1)[0]
			Interface.abaFoco.livro.anexos.splice(depois, 0, anexo)
			InterfaceAnexos.atualizar()
		}, function () {
			var anexo = Interface.abaFoco.livro.anexos.splice(depois, 1)[0]
			Interface.abaFoco.livro.anexos.splice(antes, 0, anexo)
			InterfaceAnexos.atualizar()
		})
	})
}

// Atualiza a lista de anexos
InterfaceAnexos.atualizar = function () {
	var anexos, i, div
	
	// Limpa a selação
	InterfaceAnexos.foco = null
	InterfaceAnexos.selecao = []
	
	// Cria as divs
	div = get("anexos")
	div.innerHTML = ""
	anexos = Interface.abaFoco.livro.anexos
	for (i=0; i<anexos.length; i++)
		div.appendChild(InterfaceAnexos.montarDiv(anexos[i]))
	
	InterfaceAnexos.atualizarLayout()
}

// Atualiza somente o layout dos anexos
InterfaceAnexos.atualizarLayout = function () {
	var div = get("anexos"), divs, i
	
	// Mostra os anexos selecionados
	divs = div.childNodes
	for (i=0; i<divs.length; i++)
		if (InterfaceAnexos.selecao.indexOf(divs.item(i)) != -1)
			divs.item(i).classList.add("anexo-selecionado")
		else
			divs.item(i).classList.remove("anexo-selecionado")
	
	// Coloca a barra de rolagem
	div.classList[div.scrollHeight>div.clientHeight ? "add" : "remove"]("painel-comRolagem")
	
	// Habilita ou desabilita o botão de remover
	get("anexos-remover").classList[InterfaceAnexos.selecao.length ? "remove" : "add"]("botao-inativo")
}

// Remove os anexos selecionados
InterfaceAnexos.remover = function () {
	var selecao = {}
	
	if (!InterfaceAnexos.selecao.length)
		return
	
	// Pega os anexos selecionados
	InterfaceAnexos.selecao.forEach(function (div) {
		var anexo = InterfaceAnexos.getAnexo(div)
		selecao[Interface.abaFoco.livro.anexos.indexOf(anexo)] = anexo
	})
	
	// Cria a ação
	new Acao("remoção de "+InterfaceAnexos.selecao.length+" anexos", function () {
		var i, n = 0
		for (i in selecao) {
			Interface.abaFoco.livro.anexos.splice(i-n, 1)
			n++
		}
		InterfaceAnexos.atualizar()
	}, function () {
		var i
		for (i in selecao)
			Interface.abaFoco.livro.anexos.splice(i, 0, selecao[i])
		InterfaceAnexos.atualizar()
	})
}

// Adiciona um anexo abaixo do último clicado
InterfaceAnexos.adicionar = function () {
	var opcoes = {}, pos
	
	// Pega a posição de inserção
	pos = InterfaceAnexos.getPosicaoFoco()+1
	
	opcoes.titulo = "Novo anexo"
	opcoes.conteudo = "<p>Nome: <input id='js-nome'></p>"+
		"<p>Conteúdo (deve ser um valor válido pra HP):<br><input size='80' id='js-conteudo'></p>"
	opcoes.onconfirmar = function () {
		var nome, conteudo, anexo
		
		nome = Compilador.sanitizar(get("js-nome").value)
		conteudo = Compilador.sanitizar(get("js-conteudo").value)
		if (!nome)
			return
		
		anexo = new Anexo
		anexo.nome = nome
		anexo.conteudo = conteudo
		
		new Acao("inserção de um anexo", function () {
			Interface.abaFoco.livro.anexos.splice(pos, 0, anexo)
			InterfaceAnexos.atualizar()
		}, function () {
			Interface.abaFoco.livro.anexos.splice(pos, 1)
			InterfaceAnexos.atualizar()
		})
	}
	Interface.abrirJanela("janelaBasica", opcoes)
}

// Copia os anexos selecionados
InterfaceAnexos.copiar = function () {
	var anexos, i, j
	
	if (!InterfaceAnexos.selecao.length)
		return
	
	Editor.colagem = InterfaceAnexos.selecao.map(InterfaceAnexos.getAnexo)
	Editor.tipoColagem = "anexos"
}

// Cola os anexos copiados logo após o último clicado
InterfaceAnexos.colar = function () {
	var anexos, pos
	
	if (Editor.tipoColagem != "anexos")
		return
	
	anexos = Editor.colagem.map(function (anexo) {
		return anexo.clonar()
	})
	pos = InterfaceAnexos.getPosicaoFoco()+1
	
	new Acao("colagem de "+anexos.length+" anexos", function () {
		var i
		for (i=anexos.length-1; i>=0; i--)
			Interface.abaFoco.livro.anexos.splice(pos, 0, anexos[i])
		InterfaceAnexos.atualizar()
	}, function () {
		Interface.abaFoco.livro.anexos.splice(pos, anexos.length)
		InterfaceAnexos.atualizar()
	})
}

// Recorta os anexos selecionados
InterfaceAnexos.recortar = function () {
	InterfaceAnexos.copiar()
	InterfaceAnexos.remover()
}

// Abre a janela de edição do anexo
InterfaceAnexos.editar = function () {
	var opcoes = {}, pos, anexo
	
	if (!InterfaceAnexos.foco)
		return
	
	// Pega a posição de anexo atual
	pos = InterfaceAnexos.getPosicaoFoco()
	anexo = InterfaceAnexos.getAnexo(InterfaceAnexos.foco)
	
	opcoes.titulo = "Editar anexo"
	opcoes.conteudo = "<p>Nome: <input id='js-nome' value=\""+Compilador.desanitizar(anexo.nome).replace(/"/g, "&quot;")+"\"></p>"+
		"<p>Conteúdo (deve ser um valor válido pra HP):<br><input size='80' id='js-conteudo' value=\""+Compilador.desanitizar(anexo.conteudo).replace(/"/g, "&quot;")+"\"></p>"
	opcoes.onconfirmar = function () {
		var nome, conteudo, novoAnexo
		
		nome = Compilador.sanitizar(get("js-nome").value)
		conteudo = Compilador.sanitizar(get("js-conteudo").value)
		if (!nome)
			return
		
		novoAnexo = new Anexo
		novoAnexo.nome = nome
		novoAnexo.conteudo = conteudo
		
		new Acao("edição de um anexo", function () {
			Interface.abaFoco.livro.anexos[pos] = novoAnexo
			InterfaceAnexos.atualizar()
		}, function () {
			Interface.abaFoco.livro.anexos[pos] = anexo
			InterfaceAnexos.atualizar()
		})
	}
	Interface.abrirJanela("janelaBasica", opcoes)
}

// Retorna a posição da div foco
InterfaceAnexos.getPosicaoFoco = function () {
	var divs
	divs = get("anexos").childNodes
	if (InterfaceAnexos.foco)
		for (i=0; i<divs.length; i++)
			if (divs.item(i) == InterfaceAnexos.foco)
				return i
	return divs.length-1
}

// Retorna o anexo relaciona à div
InterfaceAnexos.getAnexo = function (div) {
	var i
	for (i=0; i<Interface.abaFoco.livro.anexos.length; i++)
		if (Interface.abaFoco.livro.anexos[i].id == div.dataset.anexo)
			return Interface.abaFoco.livro.anexos[i]
	return null
}

// Monta uma div de anexo
InterfaceAnexos.montarDiv = function (anexo) {
	var div
	
	div = document.createElement("div")
	div.className = "anexo"
	div.textContent = Compilador.desanitizar(anexo.nome)
	div.title = Compilador.desanitizar(anexo.conteudo)
	div.dataset.anexo = anexo.id
	
	div.onclick = function (evento) {
		var divs, i, dentro, pos
		
		if (!evento.ctrlKey)
			// Ctrl adiciona à seleção atual
			InterfaceAnexos.selecao = []
		
		if (evento.shiftKey) {
			// Shift seleciona um intervalo
			divs = get("anexos").childNodes
			dentro = false
			for (i=0; i<divs.length; i++) {
				if (divs.item(i) == div || divs.item(i) == InterfaceAnexos.foco) {
					if (dentro)
						InterfaceAnexos.selecao.push(divs.item(i))
					dentro = !dentro
				}
				if (dentro)
					InterfaceAnexos.selecao.push(divs.item(i))
			}
		} else if ((pos = InterfaceAnexos.selecao.indexOf(div)) != -1)
			// Se já estiver selecionado, remove
			InterfaceAnexos.selecao.splice(pos, 1)
		else
			// Simplesmente adiciona
			InterfaceAnexos.selecao.push(div)
		
		InterfaceAnexos.foco = div
		InterfaceAnexos.atualizarLayout()
	}
	
	div.ondblclick = InterfaceAnexos.editar
	
	return div
}
