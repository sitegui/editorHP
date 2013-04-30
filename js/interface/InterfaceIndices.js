// Controla a interface dos índices
var InterfaceIndices = {}

// Guarda a última div clicada
InterfaceIndices.foco = null

// Define os ouvintes dos botões
InterfaceIndices.init = function () {
	var ordenavel
	
	get("indices-remover").onclick = InterfaceIndices.remover
	get("indices-acrescentar").onclick = InterfaceIndices.adicionar
	get("indices-opcoes").onclick = function () {
		var opcoes = {}
		opcoes.titulo = _("autoIndexacao")
		opcoes.conteudo = "<p>"+_("autoIndexacao_dica")+"</p>"+
			"<p><input type='checkbox' id='js-check'"+(Interface.abaFoco.livro.autoIndexacao ? " checked" : "")+"> <label for='js-check'>"+_("autoIndexacao_ativar")+"</label></p>"
		opcoes.onconfirmar = function () {
			var antes = Interface.abaFoco.livro.autoIndexacao, novo = get("js-check").checked
			if (novo == antes)
				return
			new Acao(novo ? _("autoIndexacao_ativacao") : _("autoIndexacao_desativacao"), function () {
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
	
	ordenavel = new Ordenavel("indices", function () {
		var antes, depois
		
		antes = Interface.abaFoco.livro.indices
		depois = InterfaceIndices.montarDasDivs()
		
		new Acao(_("movimentacaoIndice"), function () {
			Interface.abaFoco.livro.indices = depois
			InterfaceIndices.atualizar()
		}, function () {
			Interface.abaFoco.livro.indices = antes
			InterfaceIndices.atualizar()
		})
	})
	ordenavel.indices = true
}

// Monta o índice a partir das divs na interface
InterfaceIndices.montarDasDivs = function () {
	var indices, divs, i, nivelAntes, dif, localAtual, novo, ultimo, temp, div
	
	// Gera o índice a partir da estrutura das divs
	indices = []
	indices.acima = null
	localAtual = indices
	nivelAntes = 6
	divs = get("indices").childNodes
	for (i=0; i<divs.length; i++) {
		div = divs.item(i)
		dif = nivelAntes-Number(div.dataset.nivel)
		if (dif < 0) {
			// Transforma o último índice folha em sub-índice
			ultimo = localAtual[localAtual.length-1]
			novo = new SubIndice
			novo.nome = ultimo.nome
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
		novo.nome = Compilador.sanitizar(div.childNodes.item(0).textContent)
		if (div.childNodes.length > 1)
			novo.pagina = Interface.abaFoco.livro.paginas[Number(div.childNodes.item(1).textContent)-1]
		else
			novo.pagina = null
		localAtual.push(novo)
		nivelAntes = Number(div.dataset.nivel)
	}
	
	// Sobe para a raiz
	while (localAtual.acima) {
		temp = localAtual.acima
		delete localAtual.acima
		localAtual = temp
	}
	delete localAtual.acima
	
	return indices
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
	var indice, arrayPai, pos
	
	if (!InterfaceIndices.foco)
		return
	
	if (Interface.abaFoco.livro.autoIndexacao) {
		alert(_("erroAlterarIndices"))
		return
	}
	
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
	
	new Acao(_("remocaoIndice"), function () {
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
	
	if (Interface.abaFoco.livro.autoIndexacao) {
		alert(_("erroAlterarIndices"))
		return
	}
	
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
	opcoes.titulo = _("criarIndice")
	opcoes.conteudo = "<p>"+_("nome")+": <input size='30' id='js-nome'></p>"
	select = ""
	for (i=0; i<Interface.abaFoco.livro.paginas.length; i++)
		select += "<option value='"+i+"'>"+(i+1)+"</option>"
	opcoes.conteudo += "<p>"+_("paginaAlvo")+": <select id='js-pagina'>"+select+"</select></p>"
	opcoes.onconfirmar = function () {
		var nome, pagina, indice
		
		nome = Compilador.sanitizar(get("js-nome").value)
		pagina = Number(get("js-pagina").value)
		if (!nome)
			return
		
		indice = new FolhaIndice
		indice.nome = nome
		indice.pagina = Interface.abaFoco.livro.paginas[pagina]
		new Acao(_("criacaoIndice"), function () {
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
	
	// Verifica se é possível renomear o índice
	if (Interface.abaFoco.livro.autoIndexacao && !indice.cabecalho) {
		alert(_("erroRenomearIndice"))
		return
	}
	
	nomeAntigo = indice.nome
	opcoes = {}
	opcoes.titulo = _("editarIndice")
	opcoes.conteudo = "<p>"+_("nome")+": <input size='30' id='js-nome' value=\""+Compilador.desanitizar(nomeAntigo).replace(/"/g, "&quot;")+"\"></p>"
	if (indice instanceof FolhaIndice && !Interface.abaFoco.livro.autoIndexacao) {
		select = ""
		paginaAntiga = Interface.abaFoco.livro.paginas.indexOf(indice.pagina)
		for (i=0; i<Interface.abaFoco.livro.paginas.length; i++)
			select += "<option value='"+i+"'"+(i==paginaAntiga ? " selected" : "")+">"+(i+1)+"</option>"
		opcoes.conteudo += "<p>"+_("paginaAlvo")+": <select id='js-pagina'>"+select+"</select></p>"
	}
	opcoes.onconfirmar = function () {
		var nome, pagina
		
		nome = Compilador.sanitizar(get("js-nome").value)
		if (indice instanceof FolhaIndice && !Interface.abaFoco.livro.autoIndexacao)
			pagina = Number(get("js-pagina").value)
		if (!nome)
			return
		
		new Acao(_("edicaoIndice"), function () {
			indice.nome = nome
			if (indice instanceof FolhaIndice && !Interface.abaFoco.livro.autoIndexacao)
				indice.pagina = Interface.abaFoco.livro.paginas[pagina]
			InterfaceIndices.atualizar()
			if (Interface.abaFoco.livro.autoIndexacao && indice.cabecalho) {
				indice.cabecalho.texto = nome
				InterfacePaginas.montarMiniaturas()
				InterfaceEdicao.atualizar()
			}
		}, function () {
			indice.nome = nomeAntigo
			if (indice instanceof FolhaIndice && !Interface.abaFoco.livro.autoIndexacao)
				indice.pagina = paginaAntiga==-1 ? null : Interface.abaFoco.livro.paginas[paginaAntiga]
			InterfaceIndices.atualizar()
			if (Interface.abaFoco.livro.autoIndexacao && indice.cabecalho) {
				indice.cabecalho.texto = nomeAntigo
				InterfacePaginas.montarMiniaturas()
				InterfaceEdicao.atualizar()
			}
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
		Interface.ultimoTipoFocado = "indice"
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
