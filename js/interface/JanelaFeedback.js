// Controla a janela de feedback (contato)
var JanelaFeedback = {}

// Inicializa a janela
JanelaFeedback.init = function () {
	get("janelaFeedback-anon").onchange = function () {
		get("janelaFeedback-email").disabled = get("janelaFeedback-anon").checked
	}
	
	get("janelaFeedback-enviar").onclick = JanelaFeedback.enviar
	get("janelaFeedback-cancelar").onclick = Interface.fecharJanela
}

// Abre a janela
JanelaFeedback.onabrir = function () {
	get("janelaFeedback-email").value = ""
	get("janelaFeedback-email").disabled = false
	get("janelaFeedback-anon").checked = false
	get("janelaFeedback-msg").value = ""
	get("janelaFeedback-userAgent").textContent = navigator.userAgent
	get("janelaFeedback-arquivo").checked = false
	get("janelaFeedback-email").focus()
}

// Envia o feedback
JanelaFeedback.enviar = function () {
	var ajax, dados, email
	
	// Carrega os dados
	dados = new FormData
	email = get("janelaFeedback-email").value
	if (!get("janelaFeedback-anon").checked) {
		if (!email.length) {
			alert(_("erro_email"))
			return
		}
		dados.append("email", email)
	}
	dados.append("msg", get("janelaFeedback-msg").value)
	dados.append("userAgent", navigator.userAgent)
	if (get("janelaFeedback-arquivo").checked)
		dados.append("arquivo", Compilador.compilar(Interface.abaFoco.livro))
	
	// Envia as informações
	ajax = new XMLHttpRequest
	ajax.open("POST", "enviarFeedback.php", true)
	ajax.send(dados)
	
	// Dá o feedback de execução para o usuário
	JanelaDicas.abrir(_("feedback_enviando"))
	
	ajax.onload = function () {
		var msg = ajax.responseText, sucesso = false
		switch (msg) {
		case "true":
			msg = _("feedback_enviado")
			sucesso = true
			break
		case "msg":
			msg = _("erro_mensagem")
			break
		case "email":
			msg = _("erro_email")
			break
		default:
			msg = _("feedback_erroEnvio")
		}
		JanelaDicas.abrir(msg)
		if (sucesso)
			Interface.fecharJanela()
	}
	ajax.onerror = function () {
		JanelaDicas.abrir(_("feedback_erroEnvio"))
	}
}
