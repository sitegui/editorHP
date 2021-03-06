// Controla a interface de edição
var InterfaceEdicao = {}

// Indice se está editando uma imagem
InterfaceEdicao.editandoImagem = false

// Guarda a seleção feita
InterfaceEdicao.foco = null

// Atualiza as ferramentas selecionadas
InterfaceEdicao.atualizarFerramentas = function () {
	var edicao, no, ferramenta = "", divs, i, alinhamento, e, erro
	edicao = get("edicao")
	
	JanelaSintaxe.fechar(false)
	if (InterfaceEdicao.editandoImagem)
		return
	
	// Guarda o foco
	try {
		InterfaceEdicao.foco = getSelection().getRangeAt(0) // Chrome chora bastante aqui :|
		no = InterfaceEdicao.foco.commonAncestorContainer
	} catch (e) {
		return
	}
	
	// Pega um elemento que contém toda a seleção
	while (no.nodeType != Node.ELEMENT_NODE)
		no = no.parentNode
	
	alinhamento = getComputedStyle(no).textAlign
	if (alinhamento.indexOf("right") != -1)
		alinhamento = -1
	else if (alinhamento.indexOf("center") != -1)
		alinhamento = 0
	else
		alinhamento = 1
	get("ferramenta-direita").classList[alinhamento==-1 ? "add" : "remove"]("botao-ativo")
	get("ferramenta-centro").classList[alinhamento==0 ? "add" : "remove"]("botao-ativo")
	get("ferramenta-esquerda").classList[alinhamento==1 ? "add" : "remove"]("botao-ativo")
	
	while (no != null && no != edicao) {
		if (no.nodeName == "P") {
			ferramenta = "ferramenta-texto"
			break
		} else if (no.nodeName == "H6") {
			ferramenta = "ferramenta-equacao"
			JanelaSintaxe.abrir(false)
			erro = Sintaxe.validarEquacao(Compilador.sanitizar(no.textContent))
			if (!erro) {
				no.classList.remove("erroSintaxe")
				no.title = ""
			} else {
				no.classList.add("erroSintaxe")
				no.title = erro
			}
			break
		} else if (no.nodeName.match(/^H[1-5]$/)) {
			ferramenta = "ferramenta-"+no.nodeName.toLowerCase()
			if (Compilador.sanitizar(no.textContent).length <= 33) {
				no.classList.remove("alerta")
				no.title = ""
			} else {
				no.classList.add("alerta")
				no.title = _("alerta_tamanhoTitulo")
			}
			break
		}
		no = no.parentNode
	}
	
	divs = get("ferramentasFormato").childNodes
	for (i=0; i<divs.length; i++)
		if (divs.item(i).nodeType == Node.ELEMENT_NODE)
			if (divs.item(i).id == ferramenta)
				divs.item(i).classList.add("ferramenta-selecionada")
			else
				divs.item(i).classList.remove("ferramenta-selecionada")
	
	// Verifica se a área de edição precisa de barra de rolagem
	setTimeout(function () {
		edicao.classList[edicao.scrollHeight>edicao.clientHeight ? "add" : "remove"]("edicao-comRolagem")
	}, 500)
}

// Define os ouvintes para os botões de edição
InterfaceEdicao.init = function () {
	var executar, intervalo = null, tds, i, inserirChar, anular, edicaoOnBlur
	
	anular = function (evento) {
		evento.preventDefault()
	}
	
	get("edicao").onfocus = function () {
		clearInterval(intervalo)
		intervalo = setInterval(InterfaceEdicao.atualizarFerramentas, 1e3)
		get("ferramentasConteudo").style.opacity = "1"
		get("ferramentasMascara").style.display = "none"
		setTimeout(InterfaceEdicao.atualizarFerramentas, 100) // Chrome só define a seleção depois do onfocus
		document.execCommand("enableObjectResizing", false, false)
	}
	
	get("edicao").onblur = function () {
		// Esconde as ferramentas e inicia o processo de normalização do HTML
		if (InterfaceEdicao.editandoImagem)
			return
		
		if (document.activeElement == get("edicao"))
			// O elemento tem o foco novamente
			return
		
		clearInterval(intervalo)
		get("ferramentasConteudo").style.opacity = ".5"
		get("ferramentasMascara").style.display = ""
		
		Interface.carregando = true
		Compilador.normalizar(get("edicao"), function (novosElementos) {
			var pos, pagina, novosElementos, elementosAntigos
			pagina = Interface.abaFoco.paginaFoco
			elementosAntigos = pagina.elementos
			pos = Interface.abaFoco.livro.paginas.indexOf(pagina)+1
			
			new Acao(_("alteracaoPagina", pos), function () {
				pagina.elementos = novosElementos
				InterfacePaginas.atualizarPagina(pagina)
			}, function () {
				pagina.elementos = elementosAntigos
				InterfacePaginas.atualizarPagina(pagina)
			})
			
			if (Interface.abaFoco.livro.autoPaginacao)
				Editor.autoPaginar()
			if (Interface.abaFoco.livro.autoIndexacao)
				Editor.autoIndexar()
			Interface.carregando = false
		})
	}
	
	// Evita que atalhos atrapalhem a edição
	get("edicao").onkeydown = function (evento) {
		evento.stopPropagation()
	}
	
	get("ferramentas").onmousedown = anular
	
	// Gera uma função para executar um dado comando no campo de edição
	executar = function (comando, arg) {
		return function () {
			document.execCommand(comando, false, arg)
			InterfaceEdicao.atualizarFerramentas()
		}
	}
	
	// Formatação
	get("ferramenta-texto").onclick = executar("formatBlock", "P")
	get("ferramenta-equacao").onclick = function () {
		var no, str, range
		document.execCommand("formatBlock", false, "H6")
		no = getSelection().getRangeAt(0).commonAncestorContainer
		str = no.textContent
		if (str.charAt(0) != "'" || str.charAt(str.length-1) != "'") {
			no.textContent = "'"+str+"'"
			range = document.createRange()
			range.setStart(no.childNodes[0], 1)
			range.setEnd(no.childNodes[0], 1)
			window.getSelection().removeAllRanges()
			window.getSelection().addRange(range)
		}
		InterfaceEdicao.atualizarFerramentas()
	}
	get("ferramenta-h1").onclick = executar("formatBlock", "H1")
	get("ferramenta-h2").onclick = executar("formatBlock", "H2")
	get("ferramenta-h3").onclick = executar("formatBlock", "H3")
	get("ferramenta-h3").addEventListener("click", function () {
		get("ferramenta-h4").style.display = ""
	})
	get("ferramenta-h4").onclick = executar("formatBlock", "H4")
	get("ferramenta-h4").style.display = "none"
	get("ferramenta-h4").addEventListener("click", function () {
		get("ferramenta-h5").style.display = ""
	})
	get("ferramenta-h5").onclick = executar("formatBlock", "H5")
	get("ferramenta-h5").style.display = "none"
	get("ferramenta-esquerda").onclick = executar("justifyLeft")
	get("ferramenta-centro").onclick = executar("justifyCenter")
	get("ferramenta-direita").onclick = executar("justifyRight")
	
	// Desfazer e refazer
	get("ferramenta-desfazer").onclick = InterfaceEdicao.desfazer
	get("ferramenta-refazer").onclick = InterfaceEdicao.refazer
	
	// Inserção de régua
	get("ferramenta-regua").onclick = function (evento) {
		Interface.abrirMenu(evento, "submenuRegua", "ferramenta-regua")
	}
	get("submenuRegua-fina").onmousedown = anular
	get("submenuRegua-media").onmousedown = anular
	get("submenuRegua-grossa").onmousedown = anular
	get("submenuRegua-fina").onclick = executar("insertHTML", "<hr size='1' color='black'>")
	get("submenuRegua-media").onclick = executar("insertHTML", "<hr size='3' color='black'>")
	get("submenuRegua-grossa").onclick = executar("insertHTML", "<hr size='5' color='black'>")
	
	// Abre a janela de inserção de caractere
	get("ferramenta-caractere").onclick = function (evento) {
		Interface.abrirMenu(evento, "submenuCaracteres", "ferramenta-caractere")
	}
	
	// Botões para inserir caractere
	inserirChar = function (charc) {
		return function (evento) {
			evento.currentTarget.classList.add("caracteres-usado")
			document.execCommand("insertHTML", false, charc)
		}
	}
	tds = get("submenuCaracteres").querySelectorAll("td")
	for (i=0; i<tds.length; i++) {
		tds.item(i).onmousedown = anular
		tds.item(i).onclick = inserirChar(tds.item(i).innerHTML)
	}
	
	// Botão de inserir imagem
	get("ferramenta-imagem").onclick = function () {
		InterfaceEdicao.editandoImagem = true
		JanelaImagem.inserirImagem()
	}
}

// Atualiza os botões de desfazer/refazer
InterfaceEdicao.atualizarDesfazer = function () {
	var undo, redo
	undo = Acao.getDesfazer()
	redo = Acao.getRefazer()
	if (undo == null) {
		get("ferramenta-desfazer").classList.add("botao-inativo")
		get("ferramenta-desfazer").title = _("desfazerNada")
	} else {
		get("ferramenta-desfazer").classList.remove("botao-inativo")
		get("ferramenta-desfazer").title = _("desfazer", undo)
	}
	if (redo == null) {
		get("ferramenta-refazer").classList.add("botao-inativo")
		get("ferramenta-refazer").title = _("refazerNada")
	} else {
		get("ferramenta-refazer").classList.remove("botao-inativo")
		get("ferramenta-refazer").title = _("refazer", redo)
	}
}

// Desfaz uma ação realizada na aba atual
InterfaceEdicao.desfazer = function () {
	Acao.desfazer(Interface.abaFoco)
	InterfaceEdicao.atualizarDesfazer()
}

// Refaz uma ação desfeita na aba atual
InterfaceEdicao.refazer = function () {
	Acao.refazer(Interface.abaFoco)
	InterfaceEdicao.atualizarDesfazer()
}

// Foca no campo de edição
InterfaceEdicao.focar = function () {
	get("edicao").focus()
	if (InterfaceEdicao.foco) {
		getSelection().removeAllRanges()
		getSelection().addRange(InterfaceEdicao.foco)
		InterfaceEdicao.foco = null
	}
}

// Ouvinte de clique em imagem no campo de edição
InterfaceEdicao.editarImagem = function (evento) {
	if (Interface.abaFoco.paginaFoco) {
		InterfaceEdicao.editandoImagem = true
		Interface.abrirJanela("janelaImagem", evento.currentTarget)
	}
}

// Mostra a página no campo de edição
InterfaceEdicao.atualizar = function () {
	var edicao = get("edicao")
	if (Interface.abaFoco.paginaFoco) {
		InterfaceEdicao.foco = null
		edicao.classList.remove("edicao-inativo")
		edicao.contentEditable = "true"
		edicao.innerHTML = Compilador.gerarHTML(Interface.abaFoco.paginaFoco)
		edicao.scrollTop = 0
	} else {
		edicao.classList.add("edicao-inativo")
		edicao.contentEditable = "false"
	}
	InterfaceEdicao.atualizarFerramentas()
}
