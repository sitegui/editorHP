// Controla a exibição das miniaturas
var InterfacePaginas = {}

// Define os ouvintes para os botões
InterfacePaginas.init = function () {
	get("paginas-remover").onclick = InterfacePaginas.remover
	get("paginas-acrescentar").onclick = InterfacePaginas.acrescentar
	get("paginas-opcoes").onclick = function () {
		opcoes = {}
		opcoes.titulo = "Auto paginação"
		opcoes.conteudo = "<p>A função de auto paginação divide o livro automaticamente em páginas de acordo com os cabeçalhos presentes no texto</p>"+
			"<p><input type='checkbox' id='js-check'"+(Interface.abaFoco.livro.autoPaginacao ? " checked" : "")+"> <label for='js-check'>Ativar auto paginação</label></p>"
		opcoes.onconfirmar = function () {
			var antes = Interface.abaFoco.livro.autoPaginacao, novo = get("js-check").checked
			if (novo == antes)
				return
			new Acao((novo ? "ativação" : "desativação")+" da auto paginação", function () {
				Interface.abaFoco.livro.autoPaginacao = novo
			}, function () {
				Interface.abaFoco.livro.autoPaginacao = antes
			})
			if (Interface.abaFoco.livro.autoPaginacao)
				Editor.autoPaginar()
			if (Interface.abaFoco.livro.autoIndexacao)
				Editor.autoIndexar()
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	}
	get("paginas").oncontextmenu = function (evento) {
		Interface.abrirMenu(evento, "submenuEdicao")
		
		// Ajusta o estado das opções
		get("submenuEdicao-inserir").classList.remove("submenu-item-desabilitado")
		get("submenuEdicao-excluir").classList.remove("submenu-item-desabilitado")
		get("submenuEdicao-copiar").classList.remove("submenu-item-desabilitado")
		get("submenuEdicao-colar").classList[Editor.tipoColagem=="paginas" ? "remove" : "add"]("submenu-item-desabilitado")
		get("submenuEdicao-recortar").classList.remove("submenu-item-desabilitado")
		
		// Define os ouvintes
		get("submenuEdicao-inserir").onclick = InterfacePaginas.acrescentar
		get("submenuEdicao-excluir").onclick = InterfacePaginas.remover
		get("submenuEdicao-copiar").onclick = InterfacePaginas.copiar
		get("submenuEdicao-colar").onclick = InterfacePaginas.colar
		get("submenuEdicao-recortar").onclick = InterfacePaginas.recortar
		evento.preventDefault()
	}
	
	// Torna ordenável as páginas
	// TODO: deixar todas do mesmo tamanho
	new Ordenavel("paginas", function (antes, depois) {
		new Acao("movimentação da página", function () {
			var pagina = Interface.abaFoco.livro.paginas.splice(antes, 1)[0]
			Interface.abaFoco.livro.paginas.splice(depois, 0, pagina)
			InterfacePaginas.montarMiniaturas()
			InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[depois])
			InterfaceIndices.atualizarLayout()
		}, function () {
			var pagina = Interface.abaFoco.livro.paginas.splice(depois, 1)[0]
			Interface.abaFoco.livro.paginas.splice(antes, 0, pagina)
			InterfacePaginas.montarMiniaturas()
			InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[antes])
			InterfaceIndices.atualizarLayout()
		})
	})
}

// Remove as páginas selecionadas
InterfacePaginas.remover = function () {
	var i, selecao = {}, divs, n = 0
	
	// Pega a posição das páginas selecionadas
	divs = get("paginas").childNodes
	for (i=0; i<divs.length; i++)
		if (divs.item(i).dataset.pagina in Interface.abaFoco.paginasSelecionadas) {
			selecao[i] = Interface.abaFoco.livro.paginas[i]
			n++
		}
	
	new Acao("remoção de "+n+" páginas", function () {
		var i, n = 0
		for (i in selecao) {
			Interface.abaFoco.livro.paginas.splice(i-n, 1)
			n++
		}
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[i-n < 0 ? 0 : i-n])
		InterfaceIndices.atualizarLayout()
	}, function () {
		var i
		for (i in selecao)
			Interface.abaFoco.livro.paginas.splice(i, 0, selecao[i])
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[i])
		InterfaceIndices.atualizarLayout()
	})
	if (Interface.abaFoco.livro.autoIndexacao)
		Editor.autoIndexar()
}

// Adiciona um nova página
InterfacePaginas.acrescentar = function () {
	var pagina = new Pagina, pos
	pos = Interface.abaFoco.livro.paginas.indexOf(Interface.abaFoco.paginaFoco)
	new Acao("inserção de uma página", function () {
		Interface.abaFoco.livro.paginas.splice(pos+1, 0, pagina)
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(pagina)
		InterfaceIndices.atualizarLayout()
	}, function () {
		Interface.abaFoco.livro.paginas.splice(pos+1, 1)
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[pos < 0 ? 0 : pos])
		InterfaceIndices.atualizarLayout()
	})
	if (Interface.abaFoco.livro.autoIndexacao)
		Editor.autoIndexar()
}

// Copia as páginas selecionadas
InterfacePaginas.copiar = function () {
	var i
	
	Editor.tipoColagem = "paginas"
	Editor.colagem = []
	for (i=0; i<Interface.abaFoco.livro.paginas.length; i++)
		if (Interface.abaFoco.livro.paginas[i].id in Interface.abaFoco.paginasSelecionadas)
			Editor.colagem.push(Interface.abaFoco.livro.paginas[i])
}

// Cola as páginas copiadas anteriormente
InterfacePaginas.colar = function () {
	var pos, paginas
	
	if (Editor.tipoColagem != "paginas")
		return
	
	// Pega a posição e as páginas a serem inseridas
	pos = Interface.abaFoco.livro.paginas.indexOf(Interface.abaFoco.paginaFoco)
	paginas = Editor.colagem.map(function (pag) {
		return pag.clonar()
	})
	
	// Cria a ação
	new Acao("colagem de "+paginas.length+" páginas", function () {
		var i
		for (i=paginas.length-1; i>=0; i--)
			Interface.abaFoco.livro.paginas.splice(pos+1, 0, paginas[i])
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(paginas[paginas.length-1])
		InterfaceIndices.atualizarLayout()
	}, function () {
		Interface.abaFoco.livro.paginas.splice(pos+1, paginas.length)
		InterfacePaginas.montarMiniaturas()
		InterfacePaginas.atualizarPagina(Interface.abaFoco.livro.paginas[pos<0 ? 0 : pos])
		InterfaceIndices.atualizarLayout()
	})
	if (Interface.abaFoco.livro.autoIndexacao)
		Editor.autoIndexar()
}

// Recorta as páginas
InterfacePaginas.recortar = function () {
	InterfacePaginas.copiar()
	InterfacePaginas.remover()
}

// Monta todas as miniaturas do livro aberto
InterfacePaginas.montarMiniaturas = function () {
	var i, paginas, div, divPai
	
	paginas = Interface.abaFoco.livro.paginas
	divPai = get("paginas")
	divPai.innerHTML = ""
	for (i=0; i<paginas.length; i++) {
		div = InterfacePaginas.gerarDiv(paginas[i], i+1)
		if (div.dataset.pagina in Interface.abaFoco.paginasSelecionadas)
			div.classList.add("pagina-selecionada")
		divPai.appendChild(div)
	}
	
	setTimeout(function () {
		divPai.classList[divPai.scrollHeight>divPai.clientHeight ? "add" : "remove"]("painel-comRolagem")
	}, 500)
}

// Atualiza o layout de páginas selecionadas (não muda o conteúdo)
InterfacePaginas.atualizarLayout = function () {
	var i, divs
	
	divs = get("paginas").childNodes
	for (i=0; i<divs.length; i++) {
		if (divs.item(i).dataset.pagina in Interface.abaFoco.paginasSelecionadas)
			divs.item(i).classList.add("pagina-selecionada")
		else
			divs.item(i).classList.remove("pagina-selecionada")
	}
}

// Foca e atualiza o conteúdo de uma página somente
// Se pagina for undefined, retira o foco de tudo
InterfacePaginas.atualizarPagina = function (pagina) {
	var i, divs, divPai
	
	// Foca na página desejada
	if (!pagina) {
		Interface.abaFoco.paginaFoco = null
		Interface.abaFoco.paginasSelecionadas = {}
		pagina = {id: ""}
	} else {
		Interface.abaFoco.paginaFoco = pagina
		Interface.abaFoco.paginasSelecionadas = {}
		Interface.abaFoco.paginasSelecionadas[pagina.id] = true
	}
	InterfaceEdicao.atualizar()
	
	divPai = get("paginas")
	divs = divPai.childNodes
	for (i=0; i<divs.length; i++)
		if (divs.item(i).dataset.pagina == pagina.id) {
			divs.item(i).classList.add("pagina-selecionada")
			divs.item(i).childNodes.item(0).innerHTML = Compilador.gerarMiniHTML(pagina, i+1)
		} else
			divs.item(i).classList.remove("pagina-selecionada")
	
	setTimeout(function () {
		divPai.classList[divPai.scrollHeight>divPai.clientHeight ? "add" : "remove"]("painel-comRolagem")
	}, 500)
}

// Monta a div da página
InterfacePaginas.gerarDiv = function (pagina, num) {
	var div, subdiv
	
	// Cria os elementos
	div = document.createElement("div")
	div.className = "pagina"
	div.dataset.pagina = pagina.id
	subdiv = document.createElement("div")
	subdiv.className = "pagina-conteudo"
	subdiv.innerHTML = Compilador.gerarMiniHTML(pagina, num)
	div.appendChild(subdiv)
	
	// Define os ouvintes
	div.onclick = function (evento) {
		var divs, i, dentro, id
		
		if (!evento.ctrlKey)
			// Ctrl adiciona à seleção atual
			Interface.abaFoco.paginasSelecionadas = {}
		
		if (evento.shiftKey) {
			// Shift seleciona um intervalo
			divs = get("paginas").childNodes
			dentro = false
			for (i=0; i<divs.length; i++) {
				id = divs.item(i).dataset.pagina
				if (id == pagina.id || id == Interface.abaFoco.paginaFoco.id) {
					if (dentro)
						Interface.abaFoco.paginasSelecionadas[id] = true
					dentro = !dentro
				}
				if (dentro)
					Interface.abaFoco.paginasSelecionadas[id] = true
			}
		} else if (pagina.id in Interface.abaFoco.paginasSelecionadas) {
			// Se já estiver selecionado, remove. Mas só se a seleção não for ficar vazia
			for (i in Interface.abaFoco.paginasSelecionadas)
				if (i != pagina.id) {
					delete Interface.abaFoco.paginasSelecionadas[pagina.id]
					break
				}
		} else
			// Simplesmente adiciona
			Interface.abaFoco.paginasSelecionadas[pagina.id] = true
		
		Interface.abaFoco.paginaFoco = pagina
		InterfacePaginas.atualizarLayout()
		InterfaceEdicao.atualizar()
		InterfaceIndices.atualizarLayout()
	}
	
	return div
}
