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
	var aba = get("janelaAbrir-abaRecentes")
	get("janelaAbrir-recentes").classList.add("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-link").classList.remove("janela-lista-selecionado")
	aba.style.display = ""
	get("janelaAbrir-abaUpload").style.display = "none"
	get("janelaAbrir-abaLink").style.display = "none"
	
	// Cria a lista de itens recentes
	// TODO: pegar dos dados
	aba.innerHTML = ""
	aba.appendChild(JanelaAbrir.gerarItemRecente("Arquivo um", Date.now()-1e7))
	aba.appendChild(JanelaAbrir.gerarItemRecente("Arquivo dois", Date.now()-1e8))
	aba.appendChild(JanelaAbrir.gerarItemRecente("Arquivo três", Date.now()-1e9))
}

// Mostra a aba de upload de arquivo
JanelaAbrir.mostrarAbaUpload = function () {
	get("janelaAbrir-recentes").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-upload").classList.add("janela-lista-selecionado")
	get("janelaAbrir-link").classList.remove("janela-lista-selecionado")
	get("janelaAbrir-abaRecentes").style.display = "none"
	get("janelaAbrir-abaUpload").style.display = ""
	get("janelaAbrir-abaLink").style.display = "none"
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
// nome é uma string com o título do livro
// data é o valor .getTime() de uma data
JanelaAbrir.gerarItemRecente = function (nome, data) {
	var el, elNome, elData, elBaixar, elExcluir, dif, difData
	
	// Calcula a diferença das datas
	dif = (Date.now()-data)/(24*60*60*1e3)
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
	elNome = document.createTextNode(nome+" ")
	elData = document.createElement("span")
	elData.className = "janela-listaRecente-modificado"
	elData.textContent = "("+difData+")"
	elBaixar = document.createElement("div")
	elBaixar.className = "janela-listaRecente-baixar minibotao-azul"
	elBaixar.innerHTML = "&#x2B07;"
	elExcluir = document.createElement("div")
	elExcluir.className = "janela-listaRecente-excluir minibotao-vermelho"
	elExcluir.innerHTML = "&times;"
	
	// Junta os elementos
	el.appendChild(elNome)
	el.appendChild(elData)
	el.appendChild(elBaixar)
	el.appendChild(elExcluir)
	return el
}
