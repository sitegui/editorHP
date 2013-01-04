// Controla a janela de confirmação básica
var JanelaBasica = {}

// Coloca os ouvintes nos botões
JanelaBasica.init = function () {
	get("janelaBasica-conteudo").onkeypress = function (evento) {
		if (evento.keyCode == 13) {
			get("janelaBasica-confirmar").click()
			evento.preventDefault()
		}
	}
	get("janelaBasica-cancelar").onclick = Interface.fecharJanela
}

// Abre a página desejada
// Recebe um objeto com as propriedades: titulo, conteudo, onconfirmar
JanelaBasica.onabrir = function (opcoes) {
	get("janelaBasica-titulo").textContent = opcoes.titulo
	get("janelaBasica-conteudo").innerHTML = opcoes.conteudo
	get("janelaBasica-confirmar").onclick = function () {
		if (opcoes.onconfirmar)
			opcoes.onconfirmar()
		Interface.fecharJanela()
	}
}
