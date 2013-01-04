// Representa cada livro aberto
function Livro() {
	var modificado = false
	this.id = String(Math.random())
	this.nome = ""
	this.paginas = []
	this.anexos = []
	this.indices = []
	this.criacao = null
	this.modificacao = null
	this.autoPaginacao = true
	this.autoIndexacao = true
	Object.defineProperty(this, "modificado", {get: function () {
		return modificado
	}, set: function (novo) {
		modificado = Boolean(novo)
		InterfaceAbas.atualizarLayout()
	}, enumerable: true})
}

// Aplica a autopaginação
Livro.prototype.autoPaginar = function () {
}

// Aplica a autoindexação
Livro.prototype.autoIndexar = function () {
}

// Clona o livro todo
Livro.prototype.clonar = function () {
	var novo = new Livro
	
	// Copia propriedades básicas
	novo.nome = this.nome
	novo.criacao = this.criacao
	novo.modificacao = this.modificacao
	novo.autoPaginacao = this.autoPaginacao
	novo.autoIndexacao = this.autoIndexacao
	
	// Copia páginas, anexos e indices
	novo.paginas = this.paginas.map(function (pagina) {
		return pagina.clonar()
	})
	novo.anexos = this.anexos.map(function (anexo) {
		return anexo.clonar()
	})
	novo.indices = this.indices.map(function (indice) {
		return indice.clonar(novo.paginas)
	})
	
	return novo
}
