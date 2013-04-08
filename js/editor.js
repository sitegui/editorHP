// Reúne processos mais gerais

addEventListener("load", function () {
	// Inicia a interface
	Interface.init()
	Editor.reabrirSessao()
})

// Apelido para document.getElementById
function get(id) {
	return (typeof id == "string") ? document.getElementById(id) : id
}
