// Reúne várias funções comuns à aplicação toda

addEventListener("load", function () {
	// Inicia a interface
	Interface.init()
	Editor.criarNovoLivro()
})

// Apelido para document.getElementById
function get(id) {
	return (typeof id == "string") ? document.getElementById(id) : id
}
