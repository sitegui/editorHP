// Controla a janela de desenho manual
var JanelaDesenho = {}

// Armazena as etapas do desenho (para desfazer/refazer)
JanelaDesenho.historico = []
JanelaDesenho.posHistorico = 0

// Indica se está desenhando
JanelaDesenho.desenhando = false

// Define os ouvintes
JanelaDesenho.init = function () {
	var contexto, cores = ["000", "fff", "f00", "0f0", "00f", "0ff", "f0f", "ff0"]
	cores.forEach(function (cor) {
		var elemento = get("janelaDesenho-cor-"+cor)
		elemento.style.backgroundColor = "#"+cor
		elemento.onclick = function () {
			get("janelaDesenho-canvas").getContext("2d").strokeStyle = "#"+cor
			cores.forEach(function (cor2) {
				var elemento = get("janelaDesenho-cor-"+cor2)
				elemento.className = cor==cor2 ? "janelaDesenho-corAtiva" : "janelaDesenho-cor"
			})
		}
	})
	
	get("janelaDesenho-canvas").onmousedown = JanelaDesenho.iniciar
	get("janelaDesenho-desfazer").onclick = JanelaDesenho.desfazer
	get("janelaDesenho-refazer").onclick = JanelaDesenho.refazer
	get("janelaDesenho-cancelar").onclick = Interface.fecharJanela
	get("janelaDesenho-confirmar").onclick = JanelaDesenho.onconfirmar
	get("janelaDesenho-limpar").onclick = function () {
		var canvas, contexto
		
		// Pinta tudo de branco
		canvas = get("janelaDesenho-canvas")
		contexto = canvas.getContext("2d")
		contexto.fillRect(0, 0, 393, 240)
		
		// Salva no histórico
		if (JanelaDesenho.posHistorico < JanelaDesenho.historico.length)
			JanelaDesenho.historico = JanelaDesenho.historico.slice(0, JanelaDesenho.posHistorico)
		JanelaDesenho.historico.push(canvas.toDataURL())
		JanelaDesenho.posHistorico = JanelaDesenho.historico.length
		JanelaDesenho.atualizarDesfazer()
	}
	
	// Define as propriedades do canvas
	contexto = get("janelaDesenho-canvas").getContext("2d")
	contexto.fillStyle = "#FFF"
	contexto.lineWidth = 5
	contexto.lineCap = "round"
	contexto.lineJoin = "round"
}

// Termina o desenho, corta espaço inútil (em branco) da imagem e manda para o filtro
JanelaDesenho.onconfirmar = function () {
	var canvas2, cntxt2, pixels, canvas, minX, maxX, minY, maxY, i, j, brancos, len, branco, iniciou, w, h, w2, h2
	
	// Carrega os pixels do desenho
	canvas = get("janelaDesenho-canvas")
	pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
	
	// Verifica quais pixels estão em branco
	len = pixels.data.length
	brancos = []
	for (i=0; i<len; i+=4)
		brancos.push(pixels.data[i] == 255 && pixels.data[i+1] == 255 && pixels.data[i+2] == 255)
	
	// Pega os valores limites de Y dos pixels pintados
	minY = pixels.height-1
	maxY = 0
	iniciou = false
	for (i=0; i<pixels.height; i++) {
		branco = true
		for (j=0; j<pixels.width; j++)
			if (!brancos[i*pixels.width+j]) {
				branco = false
				break
			}
		if (!branco) {
			if (!iniciou)
				minY = i
			maxY = i
			iniciou = true
		}
	}
	
	// Pega os valores limites de X dos pixels pintados
	minX = pixels.width-1
	maxX = 0
	iniciou = false
	for (j=0; j<pixels.width; j++) {
		branco = true
		for (i=0; i<pixels.height; i++)
			if (!brancos[i*pixels.width+j]) {
				branco = false
				break
			}
		if (!branco) {
			if (!iniciou)
				minX = j
			maxX = j
			iniciou = true
		}
	}
	
	canvas2 = document.createElement("canvas")
	cntxt2 = canvas2.getContext("2d")
	w = maxX-minX
	h = maxY-minY
	w2 = w/3
	h2 = h/3
	canvas2.width = w2
	canvas2.height = h2
	cntxt2.drawImage(canvas, minX, minY, w, h, 0, 0, w2, h2)
	
	JanelaImagem.gerarImagem(canvas2.toDataURL(), true)
}

// Inicia a operação de desenho
JanelaDesenho.onabrir = function () {
	var canvas, contexto
	canvas = get("janelaDesenho-canvas")
	contexto = canvas.getContext("2d")
	contexto.clearRect(0, 0, 393, 240)
	
	if (JanelaImagem.imagem && JanelaImagem.imagem.dataset.desenhado && JanelaImagem.imagem.dataset.imagem)
		// Desenha a imagem anterior
		contexto.drawImage(Imagem.imagens[JanelaImagem.imagem.dataset.imagem], 0, 0)
	else
		// Apaga a tela
		contexto.fillRect(0, 0, 393, 240)
	
	Interface.ultimoTipoFocado = "desenho"
	JanelaDesenho.historico = [canvas.toDataURL()]
	JanelaDesenho.posHistorico = 1
	JanelaDesenho.atualizarDesfazer()
}

// Começa a seguir os movimentos do mouse
JanelaDesenho.iniciar = function (evento) {
	var canvas, x, y, contexto
	JanelaDesenho.desenhando = true
	addEventListener("mousemove", JanelaDesenho.continuar)
	addEventListener("mouseup", JanelaDesenho.terminar)
	canvas = get("janelaDesenho-canvas")
	x = evento.clientX-canvas.getBoundingClientRect().left
	y = evento.clientY-canvas.getBoundingClientRect().top
	contexto = canvas.getContext("2d")
	contexto.beginPath()
	contexto.moveTo(x-1, y)
	contexto.lineTo(x, y)
	contexto.stroke()
	evento.preventDefault()
}

// Vai desenhando abaixo do mouse
JanelaDesenho.continuar = function (evento) {
	var canvas, x, y, contexto
	if (JanelaDesenho.desenhando) {
		canvas = get("janelaDesenho-canvas")
		x = evento.clientX-canvas.getBoundingClientRect().left
		y = evento.clientY-canvas.getBoundingClientRect().top
		contexto = canvas.getContext("2d")
		contexto.lineTo(x, y)
		contexto.stroke()
	}
}

// Para de desenhar
JanelaDesenho.terminar = function () {
	var canvas, contexto
	canvas = get("janelaDesenho-canvas")
	contexto = canvas.getContext("2d")
	JanelaDesenho.desenhando = false
	removeEventListener("mousemove", JanelaDesenho.continuar)
	removeEventListener("mouseup", JanelaDesenho.terminar)
	
	// Salva no histórico
	if (JanelaDesenho.posHistorico < JanelaDesenho.historico.length)
		JanelaDesenho.historico = JanelaDesenho.historico.slice(0, JanelaDesenho.posHistorico)
	JanelaDesenho.historico.push(canvas.toDataURL())
	JanelaDesenho.posHistorico = JanelaDesenho.historico.length
	JanelaDesenho.atualizarDesfazer()
}

// Desfaz a última ação
JanelaDesenho.desfazer = function () {
	var url, img
	if (JanelaDesenho.posHistorico > 1) {
		url = JanelaDesenho.historico[JanelaDesenho.posHistorico-2]
		img = new Image
		img.onload = function () {
			var contexto
			contexto = get("janelaDesenho-canvas").getContext("2d")
			contexto.clearRect(0, 0, 393, 240)
			contexto.drawImage(img, 0, 0)
		}
		img.src = url
		JanelaDesenho.posHistorico--
		JanelaDesenho.atualizarDesfazer()
	}
}

// Refaz a última ação
JanelaDesenho.refazer = function () {
	var url, img
	if (JanelaDesenho.posHistorico < JanelaDesenho.historico.length) {
		url = JanelaDesenho.historico[JanelaDesenho.posHistorico]
		img = new Image
		img.onload = function () {
			var contexto
			contexto = get("janelaDesenho-canvas").getContext("2d")
			contexto.clearRect(0, 0, 393, 240)
			contexto.drawImage(img, 0, 0)
		}
		img.src = url
		JanelaDesenho.posHistorico++
		JanelaDesenho.atualizarDesfazer()
	}
}

// Atualiza a interface dos botões de desfazer/refazer
JanelaDesenho.atualizarDesfazer = function () {
	get("janelaDesenho-desfazer").classList[JanelaDesenho.posHistorico>1 ? "remove" : "add"]("botao-inativo")
	get("janelaDesenho-refazer").classList[JanelaDesenho.posHistorico<JanelaDesenho.historico.length ? "remove" : "add"]("botao-inativo")
}
