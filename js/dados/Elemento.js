// Representa cada elemento das páginas
var Elemento = {}
Elemento.ESQUERDA = -1
Elemento.CENTRO = 0
Elemento.DIRETIRA = 1

// Texto
function Texto() {
	this.alinhamento = Elemento.ESQUERDA
	this.texto = ""
}
Texto.prototype.clonar = function () {
	var novo = new Texto
	novo.alinhamento = this.alinhamento
	novo.texto = this.texto
	return novo
}

// Equacao
function Equacao() {
	this.alinhamento = Elemento.ESQUERDA
	this.texto = ""
}
Equacao.prototype.clonar = function () {
	var novo = new Equacao
	novo.alinhamento = this.alinhamento
	novo.texto = this.texto
	return novo
}

// Imagem
function Imagem() {
	this.imagem = "" // Chave da imagem original
	this.filtro = ""
	this.ajuste = ""
	this.tamanho = "" // Largura real
	this.pixels = null // Pixels após a transformação (usado temporariamente para exibi-los no preview)
	this.cache = "" // Texto compilado para a HP
	this.cacheURL = "" // Data URL para o HTML
}
Imagem.imagens = {} // Imagens originais
// Retorna o id da imagem (objeto Image)
// Se não estiver salo ainda, salva
Imagem.getId = function (imagem) {
	var id
	for (id in Imagem.imagens)
		if (imagem == Imagem.imagens[id])
			return id
	id = String(Math.random())
	Imagem.imagens[id] = imagem
	return id
}
Imagem.prototype.clonar = function () {
	var novo = new Imagem
	novo.imagem = this.imagem
	novo.filtro = this.filtro
	novo.ajuste = this.ajuste
	novo.tamanho = this.tamanho
	novo.cache = this.cache
	novo.cacheURL = this.cacheURL
	return novo
}

// Cabecalho
function Cabecalho() {
	this.alinhamento = Elemento.ESQUERDA
	this.texto = ""
	this.nivel = 1
}
Cabecalho.prototype.clonar = function () {
	var novo = new Cabecalho
	novo.alinhamento = this.alinhamento
	novo.texto = this.texto
	novo.nivel = this.nivel
	return novo
}

// Régua
function Regua() {
	this.altura = 1
}
Regua.prototype.clonar = function () {
	var novo = new Regua
	novo.altura = this.altura
	return novo
}
