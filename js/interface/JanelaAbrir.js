// Controla a janela de abrir arquivos
var JanelaAbrir = {}

// Coloca os ouvintes nos botões
JanelaAbrir.init = function () {
	get("janelaAbrir-recentes").onclick = JanelaAbrir.mostrarAbaRecentes
	get("janelaAbrir-upload").onclick = JanelaAbrir.mostrarAbaUpload
	get("janelaAbrir-link").onclick = JanelaAbrir.mostrarAbaLink
	get("janelaAbrir-novo").onclick = function () {
		Interface.fecharJanela()
		Editor.criarNovoLivro()
	}
	get("janelaAbrir-upload-arquivo").onchange = get("janelaAbrir-upload-abrir").onclick = function () {
		// Inicia a abertura
		Compilador.abrirUpload(get("janelaAbrir-upload-arquivo").files.item(0), function (str) {
			var livro, aba
			
			Interface.fecharJanela()
			
			// Abre o livro numa nova aba
			livro = Compilador.inflar(str)
			aba = new Aba(livro)
			InterfaceAbas.abas.push(aba)
			Interface.abaFoco = aba
			
			// Salva no arquivo
			Arquivo.salvarLivro(livro)
		})
		
		// Desativa o formulário
		get("janelaAbrir-upload-arquivo").disabled = true
		get("janelaAbrir-upload-abrir").classList.add("botao-inativo")
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
		case "link":
			JanelaAbrir.mostrarAbaLink()
			break
	}
}

// Mostra a aba de arquivos recentes
JanelaAbrir.mostrarAbaRecentes = function () {
	var aba = get("janelaAbrir-abaRecentes"), id, arquivos, i
	get("janelaAbrir-recentes").classList.add("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-link").classList.remove("janela-lista-selecionado")
	aba.style.display = ""
	get("janelaAbrir-abaUpload").style.display = "none"
	get("janelaAbrir-abaLink").style.display = "none"
	
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
		aba.innerHTML = "Você não tem nenhum arquivo salvo recentemente"
}

// Mostra a aba de upload de arquivo
JanelaAbrir.mostrarAbaUpload = function () {
	get("janelaAbrir-recentes").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.add("janela-lista-selecionado")
	get("janelaAbrir-link").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-abaRecentes").style.display = "none"
	get("janelaAbrir-abaUpload").style.display = ""
	get("janelaAbrir-abaLink").style.display = "none"
	get("janelaAbrir-upload-arquivo").value = ""
	get("janelaAbrir-upload-arquivo").disabled = false
	get("janelaAbrir-upload-arquivo").click()
	get("janelaAbrir-upload-abrir").classList.remove("botao-inativo")
}

// Mostra a aba de importar de um link
JanelaAbrir.mostrarAbaLink = function () {
	get("janelaAbrir-recentes").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-link").classList.add("janela-lista-selecionado")
	get("janelaAbrir-abaRecentes").style.display = "none"
	get("janelaAbrir-abaUpload").style.display = "none"
	get("janelaAbrir-abaLink").style.display = ""
}

// Cria um item pra lista de arquivos recentes
JanelaAbrir.gerarItemRecente = function (arquivo) {
	var el, elNome, elData, elBaixar, elExcluir, dif, difData
	
	// Calcula a diferença das datas
	dif = (Date.now()-arquivo.modificacao)/(24*60*60*1e3)
	if (dif < 1)
		difData = "hoje"
	else if (dif < 2)
		difData = "ontem"
	else if (dif < 30.4)
		difData = Math.round(dif)+" dias atrás"
	else if (dif < 60.8)
		difData = "mês passado"
	else
		difData = Math.round(dif/30.4)+" meses atrás"
	
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
		Compilador.gerarDownload(arquivo)
		evento.stopPropagation()
	}
	elExcluir.onclick = function (evento) {
		var opcoes = {}, i
		
		// Verifica se não está sendo editado
		for (i=0; i<InterfaceAbas.abas.length; i++)
			if (InterfaceAbas.abas[i].livro.id == arquivo.id) {
				alert("Esse arquivo esstá aberto no editor, feche-o antes")
				// Retorna, propagando o evento e focando na aba do arquivo aberto
				return
			}
		
		opcoes.titulo = "Excluir arquivo"
		opcoes.conteudo = "Tem certeza que deseja excluir de forma permanente esse arquivo da lista?"
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
	}
	
	// Junta os elementos
	el.appendChild(elNome)
	el.appendChild(elData)
	el.appendChild(elBaixar)
	el.appendChild(elExcluir)
	return el
}
