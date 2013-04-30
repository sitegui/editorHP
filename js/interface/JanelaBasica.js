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
}

// Abre a página desejada
// Recebe um objeto com as propriedades: titulo, conteudo, onconfirmar, oncancelar (opcional)
JanelaBasica.onabrir = function (opcoes) {
	var input
	get("janelaBasica-titulo").textContent = opcoes.titulo
	get("janelaBasica-conteudo").innerHTML = opcoes.conteudo
	get("janelaBasica-confirmar").onclick = function () {
		Interface.fecharJanela()
		if (opcoes.onconfirmar)
			opcoes.onconfirmar()
	}
	get("janelaBasica-cancelar").onclick = get("janelaBasica-fechar").onclick = function () {
		Interface.fecharJanela()
		if (opcoes.oncancelar)
			opcoes.oncancelar()
	}
	input = get("janelaBasica-conteudo").querySelector("input")
	if (input)
		setTimeout(function () {
			input.select()
		}, 100)
}
