// Reúne métodos gerais da interface
var Interface = {}

// Guarda a aba em foco
;(function () {
	var foco = null
	Object.defineProperty(Interface, "abaFoco", {get: function () {
		return foco
	}, set: function (novo) {
		foco = novo
		Interface.atualizar()
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
}

// Atualiza toda a interface (usado quando se abre um outro livro)
Interface.atualizar = function () {
	InterfacePaginas.montarMiniaturas()
	InterfaceEdicao.atualizar()
}

// Abre o menu especificado abaixo do elemento
// menu e base são elementos HTML ou um id
Interface.menuAberto = null
Interface.abrirMenu = function (submenu, base) {
	Interface.fecharMenu()
	submenu = get(submenu)
	base = get(base)
	submenu.style.display = ""
	submenu.style.top = (base.getBoundingClientRect().top+base.clientHeight+3)+"px"
	submenu.style.left = base.getBoundingClientRect().left+"px"
	submenu.style.minWidth = base.clientWidth+"px"
	Interface.menuAberto = submenu
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
