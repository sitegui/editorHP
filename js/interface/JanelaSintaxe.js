// Controla a janela de dicas de sintaxe para equações
var JanelaSintaxe = {}

// Indica se foi fechada pelo usuário
JanelaSintaxe.fechadaUsuario = false

// Indica o estado atual
// 0 = fechada, 1 = meio aberta, 2 = aberta
JanelaSintaxe.estado = 0

// Grava os ouvintes da janela
JanelaSintaxe.init = function () {
	get("janelaSintaxe").onmousedown = function (evento) {
		// Evita perder o foco da edição
		evento.preventDefault()
	}
	get("janelaSintaxe").onclick = function () {
		if (JanelaSintaxe.estado == 2) {
			JanelaSintaxe.fechar(true)
		} else
			JanelaSintaxe.abrir(true)
	}
}

// Abre a janela
JanelaSintaxe.abrir = function (forcar) {
	if (JanelaSintaxe.fechadaUsuario && !forcar) {
		get("janelaSintaxe").style.right = "-20%"
		JanelaSintaxe.estado = 1
	} else {
		get("janelaSintaxe").style.right = "0"
		JanelaSintaxe.estado = 2
		JanelaSintaxe.fechadaUsuario = false
	}
}

// Fecha a janela
JanelaSintaxe.fechar = function (usuario) {
	if (usuario)
		JanelaSintaxe.fechadaUsuario = true
	if (JanelaSintaxe.estado == 2 && usuario) {
		get("janelaSintaxe").style.right = "-20%"
		JanelaSintaxe.estado = 1
	} else {
		get("janelaSintaxe").style.right = "-26%"
		JanelaSintaxe.estado = 0
	}
}
