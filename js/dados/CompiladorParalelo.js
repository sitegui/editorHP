// Controla o acesso ao compilador paralelo, usado para compilar imagens
var CompiladorParalelo = {}

// Worker
CompiladorParalelo.worker = new Worker("js/dados/CompiladorParalelo-worker.js")
CompiladorParalelo.worker.ocupado = false
CompiladorParalelo.worker.onerror = function (evento) {
	alert(_("erroInterno"))
}

// Aplica o filtro na imagem (objeto Image com src necessariamente local)
// Recebe a imagem (Image), o filtro ("basico" ou "areas"), o ajuste (-100 a 100) e o tamanho (3 a 500)
// onsucesso será chamado depois que o trabalho acabar
// Será passado um elemento Imagem com as propriedades imagem, filtro, ajuste, tamanho e pixels
// Caso o worker esteja ocupado, coloca a requisição na fila, mas somente a última será executada
CompiladorParalelo.aplicarFiltro = function (imagem, filtro, ajuste, tamanho, onsucesso) {
	var pixels, canvas, contexto, dados, callback, id, funcao
	
	funcao = CompiladorParalelo.aplicarFiltro
	
	// Se estiver ocupado, coloca na fila
	if (CompiladorParalelo.worker.ocupado) {
		funcao.fila = [imagem, filtro, ajuste, tamanho, onsucesso]
		return
	}
	funcao.fila = null
	
	// Salva uma referência para a imagem original
	id = Imagem.getId(imagem)
	
	// Pega os pixels da imagem (no tamanho desejado)
	// Busca na cache primeiro
	if (funcao.cache.id == id && funcao.cache.tamanho == tamanho)
		pixels = funcao.cache.pixels
	else {
		canvas = document.createElement("canvas")
		canvas.width = tamanho
		canvas.height = imagem.height*canvas.width/imagem.width
		contexto = canvas.getContext("2d")
		contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)
		pixels = contexto.getImageData(0, 0, canvas.width, canvas.height)
		funcao.cache = {id: id, tamanho: tamanho, pixels: pixels}
	}
	
	// Envia para o worker
	dados = {}
	dados.pixels = pixels
	dados.filtro = filtro
	dados.ajuste = ajuste
	dados.tamanho = tamanho
	dados.id = ""
	CompiladorParalelo.worker.postMessage(dados)
	CompiladorParalelo.worker.ocupado = true
	
	// Monta o callback
	callback = function (evento) {
		var elemento
		
		// Remove o callback
		CompiladorParalelo.worker.removeEventListener("message", callback)
		CompiladorParalelo.worker.ocupado = false
		
		// Cria o elemento Imagem
		elemento = new Imagem
		elemento.imagem = id
		elemento.filtro = filtro
		elemento.ajuste = ajuste
		elemento.tamanho = tamanho
		elemento.pixels = evento.data.pixels
		onsucesso(elemento)
		
		// Executa o pedido na fila
		if (funcao.fila)
			funcao.apply(null, funcao.fila)
	}
	CompiladorParalelo.worker.addEventListener("message", callback)
}
CompiladorParalelo.aplicarFiltro.fila = null
CompiladorParalelo.aplicarFiltro.cache = {id: "", tamanho: 0, pixels: null}

// Aplica um filtro básico padrão na imagem (objeto Image, com src possivelmente externa)
// onload será chamado depois que o trabalho acabar
// Será passado um elemento Imagem com as propriedades imagem, filtro, ajuste, tamanho e pixels
// Em caso de erro, será chamado com null
CompiladorParalelo.aplicarFiltroPadrao = function (imagem, onload) {
	var xhr, xhronload, imagemonload, workeronmessage, id, tamanho
	
	// Define o que fazer quando receber a resposta do worker
	workeronmessage = function (evento) {
		var elemento
		
		// Verifica se é a resposta certa
		if (evento.data.id != id)
			return
		
		// Remove o callback
		CompiladorParalelo.worker.removeEventListener("message", workeronmessage)
		
		// Cria o elemento Imagem
		elemento = new Imagem
		elemento.imagem = id
		elemento.filtro = "basico"
		elemento.ajuste = 0
		elemento.tamanho = tamanho
		elemento.pixels = evento.data.pixels
		onload(elemento)
	}
	
	// Define o que fazer quando o servidor acabar de abrir a imagem
	imagemonload = function (imagem) {
		var pixels, canvas, contexto, dados
		
		// Salva uma referência para a imagem original
		id = Imagem.getId(imagem)
		
		// Pega os pixels da imagem (no tamanho desejado)
		tamanho = Math.min(131, imagem.width)
		canvas = document.createElement("canvas")
		canvas.width = tamanho
		canvas.height = imagem.height*canvas.width/imagem.width
		contexto = canvas.getContext("2d")
		contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)
		pixels = contexto.getImageData(0, 0, canvas.width, canvas.height)
		
		// Envia para o worker
		dados = {}
		dados.pixels = pixels
		dados.filtro = "basico"
		dados.ajuste = 0
		dados.tamanho = tamanho
		dados.id = id
		CompiladorParalelo.worker.postMessage(dados)
		
		// Monta o callback
		CompiladorParalelo.worker.addEventListener("message", workeronmessage)
	}
	
	// Define o que fazer quando acabar de carregar a imagem do servidor
	xhronload = function (src) {
		var imagem
		imagem = new Image
		imagem.onload = function () {
			imagemonload(imagem)
		}
		imagem.onerror = function () {
			alert(_("erroAbrirImagem"))
			onload(null)
		}
		imagem.src = src
	}
	
	// Inicia o processo, carregando a imagem (pede ao servidor)
	xhr = new XMLHttpRequest
	xhr.open("GET", "carregarImagem.php?url="+encodeURIComponent(imagem.src))
	xhr.onload = function () {
		xhronload(xhr.responseText)
	}
	xhr.onerror = function () {
		alert(_("erroCarregarImagem"))
		onload(null)
	}
	xhr.send()
}
