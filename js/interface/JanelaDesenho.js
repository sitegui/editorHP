// Controla a janela de desenho manual
var JanelaDesenho = {}

// Armazena as etapas do desenho (para desfazer/refazer)
JanelaDesenho.historico = []
JanelaDesenho.posHistorico = 0

// Indica se está desenhando
JanelaDesenho.desenhando = false

// Define os ouvintes
JanelaDesenho.init = function () {
	var cores = ["000", "fff", "f00", "0f0", "00f", "0ff", "f0f", "ff0"]
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
	get("janelaDesenho-confirmar").onclick = function () {
		JanelaImagem.gerarImagem(get("janelaDesenho-canvas").toDataURL(), true)
	}
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
}

// Inicia a operação de desenho
JanelaDesenho.onabrir = function () {
	var canvas, contexto
	canvas = get("janelaDesenho-canvas")
	contexto = canvas.getContext("2d")
	contexto.fillStyle = "#FFF"
	contexto.fillRect(0, 0, 393, 240)
	contexto.lineWidth = 5
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
	contexto.moveTo(x, y)
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
