// Representa um anexo de um livro
function Anexo() {
	this.id = String(Math.random())
	this.nome = ""
	this.conteudo = ""
}

// Clona um anexo
Anexo.prototype.clonar = function () {
	var novo = new Anexo
	novo.nome = this.nome
	novo.conteudo = this.conteudo
	return novo
}
