// Reúne métodos gerais da interface
var Interface = {}

// Guarda o último tipo de elemento focado ("pagina", "anexo", "indice", "desenho")
Interface.ultimoTipoFocado = ""

// Guarda a aba em foco
;(function () {
	var foco = null
	Object.defineProperty(Interface, "abaFoco", {get: function () {
		return foco
	}, set: function (novo) {
		foco = novo
		Interface.ultimoTipoFocado = ""
		InterfaceAbas.atualizarLayout()
		InterfacePaginas.montarMiniaturas()
		InterfaceEdicao.atualizar()
		InterfaceEdicao.atualizarDesfazer()
		InterfaceAnexos.atualizar()
		InterfaceIndices.atualizar()
		document.title = "EditorHP - "+foco.livro.nome
	}, enumerable: true})
})()

// Indica se alguma operação está em andamento
;(function () {
	var carregando = false
	Object.defineProperty(Interface, "carregando", {get: function () {
		return carregando
	}, set: function (novo) {
		carregando = Boolean(novo)
		get("janelaCarregando").style.display = carregando ? "" : "none"
	}, enumerable: true})
})()

// Define os ouvintes para os botões
Interface.init = function () {
	var els, i
	els = document.querySelectorAll(".janela-fechar")
	for (i=0; i<els.length; i++)
		els.item(i).onclick = Interface.fecharJanela
	JanelaAbrir.init()
	JanelaBasica.init()
	InterfaceMenus.init()
	InterfaceAbas.init()
	InterfaceEdicao.init()
	InterfacePaginas.init()
	InterfaceAnexos.init()
	InterfaceIndices.init()
	JanelaDicas.init()
	JanelaAjuda.init()
	JanelaImagem.init()
	JanelaDesenho.init()
}

// Controla atalhos
addEventListener("keydown", function (evento) {
	var atalho = true, i
	
	if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 79)
		// Ctrl+O = abrir
		Interface.abrirJanela("janelaAbrir", "recentes")
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 83)
		// Ctrl+S = salvar
		InterfaceMenus.salvarLivro(Interface.abaFoco.livro, Compilador.gerarDownload)
	else if (evento.ctrlKey && evento.shiftKey && evento.keyCode == 83)
		// Ctrl+Shift+S = salvar todos
		for (i=0; i<InterfaceAbas.abas.length; i++)
			InterfaceMenus.salvarLivro(InterfaceAbas.abas[i].livro)
	else if (!evento.ctrlKey && !evento.shiftKey && evento.keyCode == 112)
		// F1 = ajuda
		Interface.abrirJanela("janelaAjuda")
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 78)
		// Ctrl+N = novo
		Editor.criarNovoLivro()
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 90)
		// Ctrl+Z = desfazer
		if (Interface.janelaAberta == get("janelaDesenho"))
			JanelaDesenho.desfazer()
		else
			InterfaceEdicao.desfazer()
	else if (evento.ctrlKey && evento.shiftKey && evento.keyCode == 90)
		// Ctrl+Shift+Z = refazer
		if (Interface.janelaAberta == get("janelaDesenho"))
			JanelaDesenho.refazer()
		else
			InterfaceEdicao.refazer()
	else if (!evento.ctrlKey && !evento.shiftKey && evento.keyCode == 46)
		// Del = excluir
		switch (Interface.ultimoTipoFocado) {
			case "pagina": InterfacePaginas.remover(); break
			case "anexo": InterfaceAnexos.remover(); break
			case "indice": InterfaceIndices.remover(); break
		}
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 67)
		// Ctrl+C = copiar
		switch (Interface.ultimoTipoFocado) {
			case "pagina": InterfacePaginas.copiar(); break
			case "anexo": InterfaceAnexos.copiar(); break
		}
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 86)
		// Ctrl+V = colar
		switch (Interface.ultimoTipoFocado) {
			case "pagina": InterfacePaginas.colar(); break
			case "anexo": InterfaceAnexos.colar(); break
		}
	else if (evento.ctrlKey && !evento.shiftKey && evento.keyCode == 88)
		// Ctrl+X = recortar
		switch (Interface.ultimoTipoFocado) {
			case "pagina": InterfacePaginas.recortar(); break
			case "anexo": InterfaceAnexos.recortar(); break
		}
	else
		atalho = false
	
	if (atalho)
		evento.preventDefault()
})

// Atualiza as interfaces dos paineis
addEventListener("resize", function () {
	var corrigir = function (div, classe) {
		div = get(div)
		div.classList[div.scrollHeight>div.clientHeight ? "add" : "remove"](classe)
	}
	corrigir("paginas", "painel-comRolagem")
	corrigir("edicao", "edicao-comRolagem")
	corrigir("anexos", "painel-comRolagem")
	corrigir("indices", "painel-comRolagem")
})

// Abre o menu especificado abaixo do elemento
// menu e base são elementos HTML ou um id
// Se base não for enviado, abre perto do mouse
Interface.menuAberto = null
Interface.abrirMenu = function (evento, submenu, base) {
	Interface.fecharMenu()
	submenu = get(submenu)
	
	submenu.style.cssText = ""
	submenu.style.display = ""
	if (base) {
		base = get(base)
		submenu.style.top = (base.getBoundingClientRect().top+base.clientHeight+3)+"px"
		submenu.style.left = base.getBoundingClientRect().left+"px"
		submenu.style.minWidth = base.clientWidth+"px"
	} else {
		if (evento.clientY+submenu.clientHeight > document.body.clientHeight)
			submenu.style.bottom = (document.body.clientHeight-evento.clientY)+"px"
		else
			submenu.style.top = evento.clientY+"px"
		if (evento.clientX+submenu.clientWidth > document.body.clientWidth)
			submenu.style.right = (document.body.clientWidth-evento.clientX)+"px"
		else
			submenu.style.left = evento.clientX+"px"
	}
	Interface.menuAberto = submenu
	
	// Evita que o menu feche nesse clique
	evento.stopPropagation()
}

// Controla menus abertos
Interface.fecharMenu = function () {
	if (Interface.menuAberto) {
		Interface.menuAberto.style.display = "none"
		Interface.menuAberto = null
	}
}
addEventListener("click", Interface.fecharMenu)

// Abre a janela desejada (envia o argumento para o ouvinte de abertura da janela)
Interface.janelaAberta = null
Interface.abrirJanela = function (janela, argumento) {
	Interface.fecharJanela()
	get("fundoJanela").style.display = ""
	janela = get(janela)
	janela.style.display = ""
	Interface.janelaAberta = janela
	
	// Chama o ouvinte da janela
	switch (janela.id) {
		case "janelaAbrir":
			JanelaAbrir.onabrir(argumento)
			break
		case "janelaBasica":
			JanelaBasica.onabrir(argumento)
			break
		case "janelaImagem":
			JanelaImagem.onabrir(argumento)
			break
		case "janelaAjuda":
			JanelaAjuda.onabrir()
			break
		case "janelaDesenho":
			JanelaDesenho.onabrir()
			break
	}
}

// Fecha a janela aberta
Interface.fecharJanela = function () {
	if (Interface.janelaAberta) {
		get("fundoJanela").style.display = "none"
		Interface.janelaAberta.style.display = "none"
		Interface.janelaAberta = null
	}
}
