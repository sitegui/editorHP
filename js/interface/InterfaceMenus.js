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
	get("submenuAbrir-URL").onclick = function () {
		Interface.abrirJanela("janelaAbrir", "URL")
	}
	get("submenuAbrir-novo").onclick = function () {
		Editor.criarNovoLivro()
	}
	
	// Menu salvar
	get("menuSalvar").onclick = function (evento) {
		var i, arquivo, livro
		livro = Interface.abaFoco.livro
		if (evento.target.id == "menuSalvarMais") {
			Interface.abrirMenu(evento, "submenuSalvar", "menuSalvar")
			get("submenuSalvar-salvar").classList[(livro.modificado || livro.novo) ? "remove" : "add"]("submenu-item-desabilitado")
			get("submenuSalvar-salvarTodos").classList.add("submenu-item-desabilitado")
			for (i=0; i<InterfaceAbas.abas.length; i++)
				if (InterfaceAbas.abas[i].livro.modificado || InterfaceAbas.abas[i].livro.novo) {
					get("submenuSalvar-salvarTodos").classList.remove("submenu-item-desabilitado")
					break
				}
			get("submenuSalvar-salvarComo").classList[livro.novo ? "add" : "remove"]("submenu-item-desabilitado")
		} else {
			// Salva e baixa o livro
			InterfaceMenus.salvarLivro(Interface.abaFoco.livro, Compilador.gerarDownload)
		}
	}
	get("submenuSalvar-URL").onclick = function () {
		Compilador.gerarUrl(Interface.abaFoco.livro, function (url) {
			var opcoes = {}
			opcoes.titulo = "URL gerada"
			opcoes.conteudo = "<p>Basta copiar e colar esse link no seu navegador para baixar o arquivo. Ou use a opção de abrir link para edita-lo</p>"
			opcoes.conteudo += "<input style='width:100%' onclick='this.select()' value='"+url+"'>"
			Interface.abrirJanela("janelaBasica", opcoes)
		})
	}
	get("submenuSalvar-salvar").onclick = function () {
		InterfaceMenus.salvarLivro(Interface.abaFoco.livro)
	}
	get("submenuSalvar-salvarTodos").onclick = function () {
		var i
		for (i=0; i<InterfaceAbas.abas.length; i++)
			InterfaceMenus.salvarLivro(InterfaceAbas.abas[i].livro)
	}
	get("submenuSalvar-salvarComo").onclick = function () {
		var livro, opcoes = {}
		
		livro = Interface.abaFoco.livro
		if (livro.novo)
			// Sem efeito
			return
		
		opcoes.titulo = "Salvar "+livro.nome+" como"
		opcoes.conteudo = "<p>Novo nome: <input id='js-nome' value=\""+livro.nome+"\" size='50'></p>"
		opcoes.onconfirmar = function () {
			var nome, livro, abaAntiga, arquivo, novaAba
			
			// Reúne os dadaos
			nome = Compilador.sanitizar(get("js-nome").value)
			livro = Interface.abaFoco.livro
			arquivo = Arquivo.arquivos[livro.id]
			abaAntiga = Interface.abaFoco
			if (!nome)
				return
			
			// Muda os dados do livro e salva como novo
			livro.id = String(Math.random())
			livro.nome = nome
			livro.criacao = Date.now()
			livro.modificacao = Date.now()
			Arquivo.salvarLivro(livro)
			
			// Cria uma aba pra exibi-lo
			novaAba = new Aba(livro)
			InterfaceAbas.abas.push(novaAba)
			novaAba.paginaFoco = abaAntiga.paginaFoco
			novaAba.paginasSelecionadas = abaAntiga.paginasSelecionadas
			novaAba.historico = abaAntiga.historico
			novaAba.posHistorico = abaAntiga.posHistorico
			novaAba.idAcaoSalvo = novaAba.posHistorico ? novaAba.historico[novaAba.posHistorico-1].id : ""
			
			// Volta o antigo para onde estava
			abaAntiga.livro = Compilador.inflar(arquivo.conteudo)
			abaAntiga.livro.id = arquivo.id
			abaAntiga.paginaFoco = abaAntiga.livro.paginas.length ? abaAntiga.livro.paginas[0] : null
			abaAntiga.paginasSelecionadas = {}
			abaAntiga.historico = []
			abaAntiga.posHistorico = 0
			abaAntiga.idAcaoSalvo = ""
			if (abaAntiga.livro.paginas.length)
				abaAntiga.paginasSelecionadas[abaAntiga.livro.paginas[0].id] = true
			
			// Foca na nova aba
			Interface.abaFoco = novaAba
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	}
	
	// Menu ajuda
	get("menuAjuda").onclick = function () {
		Interface.abrirJanela("janelaAjuda")
	}
}

// Salva o arquivo (pergunta pelo nome caso seja novo)
// Função assíncrona. Executa o callback enviando o objeto arquivo associado como argumento
InterfaceMenus.salvarLivro = function (livro, onsucesso) {
	var arquivo, opcoes, aba
	
	aba = Interface.abaFoco
	if (livro.novo) {
		// Pergunta pelo nome
		opcoes = {}
		opcoes.titulo = "Salvar "+livro.nome
		opcoes.conteudo = "<p>Nome: <input id='js-nome' size='50'></p>"
		opcoes.onconfirmar = function () {
			var nome
			nome = Compilador.sanitizar(get("js-nome").value)
			if (nome) {
				livro.nome = nome
				livro.modificado = true
				livro.novo = false
				InterfaceMenus.salvarLivro(livro, onsucesso)
			}
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	} else {
		if (livro.modificado) {
			// Salva
			arquivo = Arquivo.salvarLivro(livro)
			aba.idAcaoSalvo = aba.posHistorico ? aba.historico[aba.posHistorico-1].id : ""
		} else
			// Busca o arquivo
			arquivo = Arquivo.arquivos[livro.id]
		if (onsucesso)
			onsucesso(arquivo)
	}
}

// Abre o janela de abrir arquivos
InterfaceMenus.abrirJanelaAbrir = function () {
	document.getElementById("janelaAbrir").style.display = ""
}
