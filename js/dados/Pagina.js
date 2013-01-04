// Representa uma página de um livro
function Pagina() {
	this.id = String(Math.random())
	this.elementos = []
	this.cacheMiniatura = null
}

// Clona uma página
Pagina.prototype.clonar = function () {
	var novo = new Pagina
	novo.cache = this.cache
	novo.elementos = this.elementos.map(function (elemento) {
		return elemento.clonar()
	})
	return novo
}
