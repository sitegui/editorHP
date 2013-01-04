// Implementa a interface dos menus
var InterfaceMenus = {}

// Define os callbacks dos botões
InterfaceMenus.init = function () {
	// Menu abrir
	get("menuAbrir").onclick = function (evento) {
		if (evento.target.id == "menuAbrirMais")
			Interface.abrirMenu(evento, "submenuAbrir", "menuAbrir")
		else
			Interface.abrirJanela("janelaAbrir", "recentes")
	}
	get("submenuAbrir-upload").onclick = function () {
		Interface.abrirJanela("janelaAbrir", "upload")
	}
	get("submenuAbrir-link").onclick = function () {
		Interface.abrirJanela("janelaAbrir", "link")
	}
	get("submenuAbrir-novo").onclick = function () {
		Editor.criarNovoLivro()
	}
	
	// Menu salvar
	get("menuSalvar").onclick = function (evento) {
		if (evento.target.id == "menuSalvarMais")
			// TODO: desabilitar botões sem ação (salvar, salvarTodos)
			Interface.abrirMenu(evento, "submenuSalvar", "menuSalvar")
		else
			console.log("Salvar e baixar")
	}
	get("submenuSalvar-link").onclick = function () {
		console.log("Gerar link")
	}
	get("submenuSalvar-salvar").onclick = function () {
		console.log("Salvar")
	}
	get("submenuSalvar-salvarTodos").onclick = function () {
		console.log("Salvar todos")
	}
	get("submenuSalvar-salvarComo").onclick = function () {
		var opcoes = {}
		opcoes.titulo = "Salvar como"
		opcoes.conteudo = "Novo nome: <input>"
		opcoes.onconfirmar = function () {
			console.log("Salvar como")
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	}
	
	// Menu ajuda
	get("menuAjuda").onclick = function () {
		Interface.abrirJanela("janelaAjuda")
	}
}

// Abre o janela de abrir arquivos
InterfaceMenus.abrirJanelaAbrir = function () {
	document.getElementById("janelaAbrir").style.display = ""
}
