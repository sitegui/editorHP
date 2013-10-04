// Controla a janela de abrir arquivos
var JanelaAbrir = {}

// Coloca os ouvintes nos botões
JanelaAbrir.init = function () {
	get("janelaAbrir-recentes").onclick = JanelaAbrir.mostrarAbaRecentes
	get("janelaAbrir-upload").onclick = JanelaAbrir.mostrarAbaUpload
	get("janelaAbrir-novo").onclick = function () {
		Interface.fecharJanela()
		Editor.criarNovoLivro()
	}
	get("janelaAbrir-upload-arquivo").onchange = get("janelaAbrir-upload-abrir").onclick = function () {
		// Inicia a abertura
		Compilador.file2string(get("janelaAbrir-upload-arquivo").files.item(0), function (str) {
			var livro, aba
			
			Interface.fecharJanela()
			
			// Abre o livro numa nova aba
			livro = Compilador.inflar(str)
			aba = new Aba(livro)
			InterfaceAbas.abas.push(aba)
			Interface.abaFoco = aba
			
			// Salva no arquivo
			Arquivo.salvarLivro(livro)
			Interface.carregando = false
		
			// Se só tinha uma aba antes e era um novo arquivo, pode fecha-la
			if (InterfaceAbas.abas.length == 2 && InterfaceAbas.abas[0].livro.novo && !InterfaceAbas.abas[0].livro.modificado) {
				InterfaceAbas.abas[0].fechar()
				Editor.numNovosLivros--
			}
		})
		Interface.carregando = true
	}
}

// Abre a página desejada
JanelaAbrir.onabrir = function (pagina) {
	switch (pagina) {
		case "recentes":
			JanelaAbrir.mostrarAbaRecentes()
			break
		case "upload":
			JanelaAbrir.mostrarAbaUpload()
			break
	}
}

// Mostra a aba de arquivos recentes
JanelaAbrir.mostrarAbaRecentes = function () {
	var aba = get("janelaAbrir-abaRecentes"), id, arquivos, i
	get("janelaAbrir-recentes").classList.add("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.remove("janela-lista-selecionado")
	aba.style.display = ""
	get("janelaAbrir-abaUpload").style.display = "none"
	
	// Cria a lista de itens recentes
	aba.innerHTML = ""
	arquivos = []
	for (id in Arquivo.arquivos)
		arquivos.push(Arquivo.arquivos[id])
	arquivos.sort(function (a, b) {
		return b.modificacao-a.modificacao
	})
	for (i=0; i<arquivos.length; i++)
		aba.appendChild(JanelaAbrir.gerarItemRecente(arquivos[i]))
	
	// Mostra mensagem de nada a ser aberto
	if (aba.innerHTML == "")
		aba.innerHTML = "<p>"+_("semArquivos")+"</p>"
}

// Mostra a aba de upload de arquivo
JanelaAbrir.mostrarAbaUpload = function () {
	get("janelaAbrir-recentes").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.add("janela-lista-selecionado")
	get("janelaAbrir-abaRecentes").style.display = "none"
	get("janelaAbrir-abaUpload").style.display = ""
	get("janelaAbrir-upload-arquivo").value = ""
	get("janelaAbrir-upload-arquivo").click()
}

// Cria um item pra lista de arquivos recentes
JanelaAbrir.gerarItemRecente = function (arquivo) {
	var el, elNome, elData, elBaixar, elExcluir, dif, difData
	
	// Calcula a diferença das datas em horas
	dif = (Date.now()-arquivo.modificacao)/(60*60*1e3)
	if (dif < 1)
		difData = _("agoraPouco")
	else if (dif < 24)
		difData = _("horasAtras", Math.round(dif))
	else if (dif < 48)
		difData = _("ontem")
	else if (dif < 730.5)
		difData = _("diasAtras", Math.round(dif/24))
	else if (dif < 1461)
		difData = _("mesPassado")
	else
		difData = _("mesesAtras", Math.round(dif/730.5))
	
	// Cria os elementos
	el = document.createElement("div")
	el.className = "janela-listaRecente"
	elNome = document.createTextNode(arquivo.nome+" ")
	elData = document.createElement("span")
	elData.className = "janela-listaRecente-modificado"
	elData.textContent = "("+difData+")"
	elBaixar = document.createElement("div")
	elBaixar.className = "janela-listaRecente-baixar minibotao-azul"
	elBaixar.innerHTML = "&#x2B07;"
	elExcluir = document.createElement("div")
	elExcluir.className = "janela-listaRecente-excluir minibotao-vermelho"
	elExcluir.innerHTML = "&times;"
	
	// Ouvintes
	elBaixar.onclick = function (evento) {
		InterfaceMenus.iniciarDownload(arquivo)
		evento.stopPropagation()
	}
	elExcluir.onclick = function (evento) {
		var opcoes = {}, i
		
		// Verifica se não está sendo editado
		for (i=0; i<InterfaceAbas.abas.length; i++)
			if (InterfaceAbas.abas[i].livro.id == arquivo.id) {
				alert(_("erroArquivoAberto"))
				// Retorna, propagando o evento e focando na aba do arquivo aberto
				return
			}
		
		opcoes.titulo = _("excluirArquivo")
		opcoes.conteudo = "<p>"+_("excluirArquivo_conteudo")+"</p>"
		opcoes.onconfirmar = function () {
			delete Arquivo.arquivos[arquivo.id]
			Interface.abrirJanela("janelaAbrir", "recentes")
		}
		opcoes.oncancelar = function () {
			Interface.abrirJanela("janelaAbrir", "recentes")
		}
		Interface.abrirJanela("janelaBasica", opcoes)
		evento.stopPropagation()
	}
	el.onclick = function () {
		var livro, aba, i
		
		Interface.fecharJanela()
		
		// Verifica se já não está aberto
		for (i=0; i<InterfaceAbas.abas.length; i++)
			if (InterfaceAbas.abas[i].livro.id == arquivo.id) {
				Interface.abaFoco = InterfaceAbas.abas[i]
				return
			}
		
		// Abre
		livro = Compilador.inflar(arquivo.conteudo)
		livro.id = arquivo.id
		aba = new Aba(livro)
		InterfaceAbas.abas.push(aba)
		Interface.abaFoco = aba
		
		// Se só tinha uma aba antes e era um novo arquivo, pode fecha-la
		if (InterfaceAbas.abas.length == 2 && InterfaceAbas.abas[0].livro.novo && !InterfaceAbas.abas[0].livro.modificado) {
			InterfaceAbas.abas[0].fechar()
				Editor.numNovosLivros--
		}
	}
	
	// Junta os elementos
	el.appendChild(elNome)
	el.appendChild(elData)
	el.appendChild(elBaixar)
	el.appendChild(elExcluir)
	return el
}
