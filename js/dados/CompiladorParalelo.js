// Controla o acesso ao compilador paralelo, usado para compilar imagens
var CompiladorParalelo = {}

// Worker
CompiladorParalelo.worker = new Worker("js/dados/CompiladorParalelo-worker.js")
CompiladorParalelo.worker.ocupado = false
CompiladorParalelo.worker.onerror = function (evento) {
	console.log(evento)
}

// Aplica o filtro na imagem
// Recebe a imagem (Image), o filtro ("basico" ou "areas"), o ajuste (-100 a 100) e o tamanho (1 a 1000)
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
		canvas.width = Math.min(imagem.width, tamanho)
		canvas.height = imagem.height*canvas.width/imagem.width
		contexto = canvas.getContext("2d")
		contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)
		pixels = contexto.getImageData(0, 0, canvas.width, canvas.height)
		funcao.cache = {id: id, tamanho: tamanho, pixels: pixels}
	}
	
	// Envia para o worker
	dados = {}
	dados.comando = "aplicarFiltro"
	dados.pixels = pixels
	dados.filtro = filtro
	dados.ajuste = ajuste
	dados.tamanho = tamanho
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
		elemento.pixels = evento.data
		onsucesso(elemento)
		
		// Executa o pedido na fila
		if (funcao.fila)
			funcao.apply(null, funcao.fila)
	}
	CompiladorParalelo.worker.addEventListener("message", callback)
}
CompiladorParalelo.aplicarFiltro.fila = null
CompiladorParalelo.aplicarFiltro.cache = {id: "", tamanho: 0, pixels: null}
