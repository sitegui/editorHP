// Controla a janela de seleção da imagem e edição do filtro
var JanelaImagem = {}

// Imagem sendo atualmente editada
// É um objeto Image. Se tiver valores definidos no dataset, então é uma imagem já inserida na página
JanelaImagem.imagem = null

// Define os ouvintes dos botões
JanelaImagem.init = function () {
	get("janelaImagem-fechar").onclick = get("janelaImagem-cancelar").onclick = JanelaImagem.finalizarEdicao
	get("janelaImagem-filtro").onchange = function () {
		get("janelaImagem-ajuste").value = "0"
		JanelaImagem.aplicarFiltro()
	}
	get("janelaImagem-ajuste").onchange = JanelaImagem.aplicarFiltro
	get("janelaImagem-tamanho").onchange = JanelaImagem.aplicarFiltro
	
	// Define os ouvintes de um botão + ou - de ajuste de valor
	var criarAjuste = function (botao, alvo, delta, min, max) {
		var intervalo = null, intervalo2 = null, ajustar, limpar
		
		ajustar = function () {
			var valor = Number(get(alvo).value)
			if (isNaN(valor)) valor = 0
			valor = Math.min(max, Math.max(valor+delta, min))
			get(alvo).value = valor
			JanelaImagem.aplicarFiltro()
		}
		
		limpar = function () {
			clearInterval(intervalo)
			clearInterval(intervalo2)
			removeEventListener("mouseup", limpar)
		}
		
		botao = get(botao)
		botao.onmousedown = function () {
			clearInterval(intervalo)
			clearInterval(intervalo2)
			intervalo = setTimeout(function () {
				intervalo = setInterval(ajustar, 100)
				intervalo2 = setTimeout(function () {
					clearInterval(intervalo)
					intervalo = setInterval(ajustar, 50)
				}, 1e3)
			}, 500)
			ajustar()
			addEventListener("mouseup", limpar)
		}
	}
	criarAjuste("janelaImagem-ajuste-menos", "janelaImagem-ajuste", -1, -100, 100)
	criarAjuste("janelaImagem-ajuste-mais", "janelaImagem-ajuste", 1, -100, 100)
	criarAjuste("janelaImagem-tamanho-menos", "janelaImagem-tamanho", -2, 3, 500)
	criarAjuste("janelaImagem-tamanho-mais", "janelaImagem-tamanho", 2, 3, 500)
	
	get("janelaImagem-remover").onclick = function () {
		JanelaImagem.imagem.parentNode.removeChild(JanelaImagem.imagem)
		JanelaImagem.finalizarEdicao()
	}
	get("janelaImagem-trocar").onclick = function () {
		JanelaImagem.inserirImagem()
	}
	get("janelaImagem-confirmar").onclick = JanelaImagem.inserirElemento
}

// Abre a janela para selecionar a fonte da imagem
JanelaImagem.inserirImagem = function () {
	var opcoes = {}
	opcoes.titulo = "Inserir imagem"
	opcoes.conteudo = "<p>Inserir imagem a partir de um arquivo: "+
		"<input type='file' id='js-arquivo' accept='image/*' onchange='JanelaImagem.carregarImagem()'></p>"+
		"<p>ou URL: <input size='50' id='js-url'></p>"+
		"<p>ou <span class='botao-azul' onclick='Interface.abrirJanela(\"janelaDesenho\")'>desenhar agora</span></p>"
	opcoes.onconfirmar = JanelaImagem.carregarImagem
	opcoes.oncancelar = JanelaImagem.finalizarEdicao
	Interface.abrirJanela("janelaBasica", opcoes)
}

// Insere a imagem na página usando o filtro escolhido
JanelaImagem.inserirElemento = function () {
	Interface.carregando = true
	JanelaImagem.aplicarFiltro(function (elemento, canvas) {
		var url, cache, html
		
		// Exporta para dataURL e para o formato da HP
		url = canvas.toDataURL()
		cache = Compilador.precompilarPixels(elemento.pixels)
		
		if (JanelaImagem.imagem.parentNode) {
			// Troca a referência à imagem original
			if (JanelaImagem.imagem.dataset.novaImagem) {
				JanelaImagem.imagem.dataset.imagem = JanelaImagem.imagem.dataset.novaImagem
				JanelaImagem.imagem.dataset.novaImagem = ""
			}
			
			// Atualiza na página
			JanelaImagem.imagem.src = url
			JanelaImagem.imagem.dataset.filtro = elemento.filtro
			JanelaImagem.imagem.dataset.ajuste = elemento.ajuste
			JanelaImagem.imagem.dataset.tamanho = elemento.tamanho
			JanelaImagem.imagem.dataset.cache = cache
			InterfaceEdicao.focar()
		} else {
			// Insere na página
			html = "<div align='center'><img onclick='InterfaceEdicao.editarImagem(event)' src='"+url+"' data-imagem='"+
				elemento.imagem+"' data-filtro='"+elemento.filtro+"' data-ajuste='"+elemento.ajuste+"' data-tamanho='"+
				elemento.tamanho+"' data-cache='"+cache+"'"+(JanelaImagem.imagem.dataset.desenhado ? " data-desenhado='1'" : "")+"></div>"
			InterfaceEdicao.focar()
			document.execCommand("insertHTML", false, html)
		}
		
		Interface.carregando = false
		JanelaImagem.finalizarEdicao()
	})
}

// Gera um objeto Image a partir de uma string dataURL
JanelaImagem.gerarImagem = function (dataURL, desenhado) {
	var imagem
	imagem = new Image
	imagem.onload = function () {
		var novoId
		Interface.carregando = false
		if (JanelaImagem.imagem && JanelaImagem.imagem.parentNode) {
			// Trocou uma imagem que já está na página
			novoId = Imagem.getId(imagem)
			imagem = JanelaImagem.imagem
			imagem.dataset.novaImagem = novoId
		}
		if (desenhado)
			imagem.dataset.desenhado = "1"
		Interface.abrirJanela("janelaImagem", imagem)
	}
	imagem.onerror = function () {
		alert("Erro ao abrir imagem")
		JanelaImagem.finalizarEdicao()
	}
	imagem.src = dataURL
}

// Carrega a imagem selecionada no campo de arquivo ou URL
JanelaImagem.carregarImagem = function () {
	var arquivo, leitor, xhr, gerarImagem
	
	// Carrega o arquivo
	Interface.carregando = true
	if (get("js-arquivo").files.length) {
		// Carrega direto do arquivo local
		arquivo = get("js-arquivo").files.item(0)
		leitor = new FileReader
		leitor.onload = function () {
			JanelaImagem.gerarImagem(leitor.result)
		}
		leitor.onerror = function () {
			alert("Erro ao carregar imagem")
			JanelaImagem.finalizarEdicao()
		}
		leitor.readAsDataURL(arquivo)
	} else if (get("js-url").value.match(/^https?:\/\//)) {
		// Pede ao servidor para carregar a URL
		xhr = new XMLHttpRequest
		xhr.open("GET", "carregarImagem.php?url="+encodeURIComponent(get("js-url").value))
		xhr.onload = function () {
			JanelaImagem.gerarImagem(xhr.responseText)
		}
		xhr.onerror = function () {
			alert("Erro ao carregar imagem")
			JanelaImagem.finalizarEdicao()
		}
		xhr.send()
	} else {
		alert("Imagem inválida")
		JanelaImagem.finalizarEdicao()
	}
}

// Abre a janela de edição da imagem
// Recebe um objeto Image
JanelaImagem.onabrir = function (imagem) {
	JanelaImagem.imagem = imagem
	get("janelaImagem-canvas").style.display = "none"
	if (imagem.parentNode && imagem.dataset.imagem) {
		// Imagem já na página, coloca os valores salvos na tela
		get("janelaImagem-filtro").value = imagem.dataset.filtro
		get("janelaImagem-ajuste").value = imagem.dataset.ajuste
		get("janelaImagem-tamanho").value = imagem.dataset.tamanho
		get("janelaImagem-opcoes").style.display = ""
		get("janelaImagem-confirmar").style.display = ""
		get("janelaImagem-aviso").style.display = "none"
		JanelaImagem.aplicarFiltro()
	} else if (imagem.parentNode && !imagem.dataset.novaImagem) {
		// Imagem já na página, mas sem referência à original e sem nova opção
		get("janelaImagem-remover").style.display = ""
		get("janelaImagem-confirmar").style.display = "none"
		get("janelaImagem-opcoes").style.display = "none"
		get("janelaImagem-aviso").style.display = ""
	} else {
		// Nova imagem ou imagem antiga sem original mas com alternativa
		get("janelaImagem-filtro").value = imagem.dataset.desenhado ? "areas": "basico"
		get("janelaImagem-ajuste").value = "0"
		get("janelaImagem-tamanho").value = "131"
		get("janelaImagem-remover").style.display = "none"
		get("janelaImagem-opcoes").style.display = ""
		get("janelaImagem-confirmar").style.display = ""
		get("janelaImagem-aviso").style.display = "none"
		JanelaImagem.aplicarFiltro()
	}
}

/*
Métodos internos
*/

// Finaliza a edição da imagem
JanelaImagem.finalizarEdicao = function () {
	Interface.carregando = false
	Interface.fecharJanela()
	InterfaceEdicao.editandoImagem = false
	if (JanelaImagem.imagem && JanelaImagem.imagem.dataset.novaImagem)
		JanelaImagem.imagem.dataset.novaImagem = ""
	JanelaImagem.imagem = null
	InterfaceEdicao.focar()
}

// Aplica o filtro e mostra o preview
// Se onload for uma função, a executa depois de tudo pronto
// Ela recebe os argumentos imagem (o mesmo de CompiladorParalelo.aplicarFiltro) e canvas (com a imagem desenhada)
JanelaImagem.aplicarFiltro = function (onload) {
	var filtro, ajuste, tamanho, onsucesso, imagem
	
	// Pega a imagem
	if (JanelaImagem.imagem.dataset.novaImagem)
		imagem = Imagem.imagens[JanelaImagem.imagem.dataset.novaImagem]
	else if (JanelaImagem.imagem.dataset.imagem)
		imagem = Imagem.imagens[JanelaImagem.imagem.dataset.imagem]
	else
		imagem = JanelaImagem.imagem
	
	filtro = get("janelaImagem-filtro").value
	ajuste = Number(get("janelaImagem-ajuste").value)
	tamanho = Number(get("janelaImagem-tamanho").value)
	if (isNaN(ajuste)) ajuste = 0
	if (isNaN(tamanho)) tamanho = 131
	ajuste = Math.min(100, Math.max(ajuste, -100))
	tamanho = Math.min(500, Math.max(tamanho, 3))
	get("janelaImagem-ajuste").value = ajuste
	get("janelaImagem-tamanho").value = tamanho
	onsucesso = function (elemento) {
		var canvas
		canvas = get("janelaImagem-canvas")
		canvas.style.display = ""
		canvas.width = elemento.pixels.width
		canvas.height = elemento.pixels.height
		canvas.style.width = 2*elemento.pixels.width+"px"
		canvas.style.height = 2*elemento.pixels.height+"px"
		canvas.getContext("2d").putImageData(elemento.pixels, 0, 0)
		if (typeof onload == "function")
			onload(elemento, canvas)
	}
	
	// Executa
	CompiladorParalelo.aplicarFiltro(imagem, filtro, ajuste, tamanho, onsucesso)
}
