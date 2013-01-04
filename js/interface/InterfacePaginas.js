// Controla a exibição das miniaturas
var InterfacePaginas = {}

// Monta todas as miniaturas do livro aberto
InterfacePaginas.montarMiniaturas = function () {
	var i, paginas, div
	
	paginas = Interface.abaFoco.livro.paginas
	get("paginas").innerHTML = ""
	for (i=0; i<paginas.length; i++) {
		div = InterfacePaginas.gerarDiv(paginas[i], i+1)
		if (div.dataset.pagina in Interface.abaFoco.paginasSelecionadas)
			div.classList.add("pagina-selecionada")
		get("paginas").appendChild(div)
	}
}

// Atualiza o layout de páginas selecionadas (não muda o conteúdo)
InterfacePaginas.atualizarLayout = function () {
	var i, divs
	
	divs = get("paginas").childNodes
	for (i=0; i<divs.length; i++) {
		if (divs.item(i).dataset.pagina in Interface.abaFoco.paginasSelecionadas)
			divs.item(i).classList.add("pagina-selecionada")
		else
			divs.item(i).classList.remove("pagina-selecionada")
	}
}

// Atualiza o conteúdo de uma página somente
InterfacePaginas.atualizarPagina = function (pagina) {
	var i, divs
	
	divs = get("paginas").childNodes
	for (i=0; i<divs.length; i++)
		if (divs.item(i).dataset.pagina == pagina.id) {
			divs.item(i).classList[(pagina.id in Interface.abaFoco.paginasSelecionadas) ? "add" : "remove"]("pagina-selecionada")
			divs.item(i).childNodes.item(0).innerHTML = Compilador.gerarMiniHTML(pagina, i+1)
			break
		}
}

// Monta a div da página
InterfacePaginas.gerarDiv = function (pagina, num) {
	var div, subdiv
	
	// Cria os elementos
	div = document.createElement("div")
	div.className = "pagina"
	div.dataset.pagina = pagina.id
	subdiv = document.createElement("div")
	subdiv.className = "pagina-conteudo"
	subdiv.innerHTML = Compilador.gerarMiniHTML(pagina, num)
	div.appendChild(subdiv)
	
	// Define os ouvintes
	div.onclick = function (evento) {
		var divs, i, dentro, id
		
		if (!evento.ctrlKey)
			// Ctrl adiciona à seleção atual
			Interface.abaFoco.paginasSelecionadas = {}
		
		if (evento.shiftKey) {
			// Shift seleciona um intervalo
			divs = get("paginas").childNodes
			dentro = false
			for (i=0; i<divs.length; i++) {
				id = divs.item(i).dataset.pagina
				if (id == pagina.id || id == Interface.abaFoco.paginaFoco.id) {
					if (dentro)
						Interface.abaFoco.paginasSelecionadas[id] = true
					dentro = !dentro
				}
				if (dentro)
					Interface.abaFoco.paginasSelecionadas[id] = true
			}
		} else if (pagina.id in Interface.abaFoco.paginasSelecionadas) {
			// Se já estiver selecionado, remove. Mas só se a seleção não for ficar vazia
			for (i in Interface.abaFoco.paginasSelecionadas)
				if (i != pagina.id) {
					delete Interface.abaFoco.paginasSelecionadas[pagina.id]
					break
				}
		} else
			// Simplesmente adiciona
			Interface.abaFoco.paginasSelecionadas[pagina.id] = true
		
		Interface.abaFoco.paginaFoco = pagina
		InterfacePaginas.atualizarLayout()
	}
	
	return div
}
