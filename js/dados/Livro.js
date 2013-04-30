// Representa cada livro aberto
function Livro() {
	var modificado = false
	this.id = String(Math.random())
	this.nome = ""
	this.paginas = []
	this.anexos = []
	this.indices = []
	this.criacao = 0
	this.modificacao = 0
	this.autoPaginacao = true
	this.autoIndexacao = true
	this.naoUsuario = false // Indica se o usuário desligou a auto-indexação e confirmou isso ao salvar
	this.novo = false // Indice se o livro foi criado do zero
	Object.defineProperty(this, "modificado", {get: function () {
		return modificado
	}, set: function (novo) {
		modificado = Boolean(novo)
		InterfaceAbas.atualizarLayout()
	}, enumerable: true})
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
	novo.naoUsuario = this.naoUsuario
	novo.novo = this.novo
	
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
