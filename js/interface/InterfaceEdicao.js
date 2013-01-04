// Controla a interface de edição
var InterfaceEdicao = {}

// Atualiza as ferramentas selecionadas
InterfaceEdicao.atualizarFerramentas = function () {
	var edicao, no, ferramenta = "", divs, i, alinhamento
	edicao = get("edicao")
	
	// Pega um elemento que contém toda a seleção
	no = window.getSelection().getRangeAt(0).commonAncestorContainer
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
		} else if (no.nodeName == "PRE") {
			ferramenta = "ferramenta-equacao"
			break
		} else if (no.nodeName.match(/^H[1-6]$/)) {
			ferramenta = "ferramenta-"+no.nodeName.toLowerCase()
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
}

// Define os ouvintes para os botões de edição
InterfaceEdicao.init = function () {
	var executar, intervalo = null, tds, i, inserirChar, anular
	
	anular = function (evento) {
		evento.preventDefault()
	}
	
	get("edicao").onfocus = function () {
		clearInterval(intervalo)
		intervalo = setInterval(InterfaceEdicao.atualizarFerramentas, 1e3)
		get("ferramentasConteudo").style.opacity = "1"
		get("ferramentasMascara").style.display = "none"
	}
	
	get("edicao").onblur = function () {
		var pos, pagina, novosElementos, elementosAntigos
		
		clearInterval(intervalo)
		get("ferramentasConteudo").style.opacity = ".5"
		get("ferramentasMascara").style.display = ""
		
		pagina = Interface.abaFoco.paginaFoco
		novosElementos = Compilador.normalizar(get("edicao"))
		elementosAntigos = pagina.elementos
		pos = Interface.abaFoco.livro.paginas.indexOf(pagina)+1
		
		new Acao("alteração da página "+pos, function () {
			pagina.elementos = novosElementos
			InterfacePaginas.atualizarPagina(pagina)
		}, function () {
			pagina.elementos = elementosAntigos
			InterfacePaginas.atualizarPagina(pagina)
		})
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
	get("ferramenta-equacao").onclick = executar("formatBlock", "PRE")
	get("ferramenta-h1").onclick = executar("formatBlock", "H1")
	get("ferramenta-h2").onclick = executar("formatBlock", "H2")
	get("ferramenta-h3").onclick = executar("formatBlock", "H3")
	get("ferramenta-h4").onclick = executar("formatBlock", "H4")
	get("ferramenta-h5").onclick = executar("formatBlock", "H5")
	get("ferramenta-h6").onclick = executar("formatBlock", "H6")
	get("ferramenta-esquerda").onclick = executar("justifyLeft")
	get("ferramenta-centro").onclick = executar("justifyCenter")
	get("ferramenta-direita").onclick = executar("justifyRight")
	
	// Desfazer e refazer
	get("ferramenta-desfazer").onclick = InterfaceEdicao.desfazer
	get("ferramenta-refazer").onclick = InterfaceEdicao.refazer
	
	// Abre a janela de inserção de caractere
	get("ferramenta-caractere").onclick = function (evento) {
		Interface.abrirMenu(evento, "submenuCaracteres", "ferramenta-caractere")
	}
	
	// Botões para inserir caractere
	inserirChar = function (char) {
		return function () {
			document.execCommand("insertHTML", false, char)
		}
	}
	tds = get("submenuCaracteres").querySelectorAll("td")
	for (i=0; i<tds.length; i++) {
		tds.item(i).onmousedown = anular
		tds.item(i).onclick = inserirChar(tds.item(i).innerHTML)
	}
}

// Atualiza os botões de desfazer/refazer
InterfaceEdicao.atualizarDesfazer = function () {
	var undo, redo
	undo = Acao.getDesfazer()
	redo = Acao.getRefazer()
	if (undo == null) {
		get("ferramenta-desfazer").classList.add("botao-inativo")
		get("ferramenta-desfazer").title = "Nada pode ser desfeito"
	} else {
		get("ferramenta-desfazer").classList.remove("botao-inativo")
		get("ferramenta-desfazer").title = "Desfazer "+undo
	}
	if (redo == null) {
		get("ferramenta-refazer").classList.add("botao-inativo")
		get("ferramenta-refazer").title = "Nada pode ser refeito"
	} else {
		get("ferramenta-refazer").classList.remove("botao-inativo")
		get("ferramenta-refazer").title = "Refazer "+redo
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

// Mostra a página no campo de edição
InterfaceEdicao.atualizar = function () {
	var edicao = get("edicao")
	if (Interface.abaFoco.paginaFoco) {
		edicao.classList.remove("edicao-inativo")
		edicao.contentEditable = "true"
		edicao.innerHTML = Compilador.gerarHTML(Interface.abaFoco.paginaFoco)
	} else {
		edicao.classList.add("edicao-inativo")
		edicao.contentEditable = "false"
	}
}
