// Representa os índices de um livro

// Índice para página
function FolhaIndice() {
	this.id = String(Math.random())
	this.nome = ""
	this.pagina = null
}

// Clona o índice
// Recebe como parâmetro a nova lista de páginas (atualiza o link com base no id)
FolhaIndice.prototype.clonar = function (novasPaginas) {
	var novo = new FolhaIndice, i
	novo.nome = this.nome
	for (i=0; i<novasPaginas.length; i++)
		if (novasPaginas[i].id == this.pagina.id) {
			novo.pagina = novasPaginas[i]
			break
		}
	return novo
}

// Novo ramo de índices
function SubIndice() {
	this.id = String(Math.random())
	this.nome = ""
	this.indices = []
}

// Clona o índice
// Recebe como parâmetro a nova lista de páginas (atualiza o link com base no id)
SubIndice.prototype.clonar = function (novasPaginas) {
	var novo = new SubIndice
	novo.nome = this.nome
	novo.indices = this.indices.map(function (indice) {
		return indice.clonar(novasPaginas)
	})
	return novo
}
