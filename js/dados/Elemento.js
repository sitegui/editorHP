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
	this.imagem = null // Chave da imagem original
	this.alinhamento = Elemento.ESQUERDA
	this.filtro = null
	this.ajuste = null
	this.tamanho = null
	this.cache = null // Texto compilado para a HP
	this.cacheURL = null // Data URL para o HTML
}
Imagem.imagens = {} // Imagens originais
Imagem.prototype.clonar = function () {
	var novo = new Imagem
	novo.imagem = this.imagem
	novo.alinhamento = this.alinhamento
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
