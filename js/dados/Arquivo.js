// Representa um arquivo salvo no navegador
function Arquivo() {
	this.conteudo = ""
	this.nome = ""
	this.modificado = 0
	this.versao = 0
}

// Abre o arquivo para um livro
Arquivo.prototype.abrir = function () {
	return Compilador.inflar(this.conteudo)
}

// Guarda todos os arquivos recentes, indexados pelo id
Arquivo.arquivos = {}

// Carrega a lista de arquivos
Arquivo.carregarArquivos = function () {
	var str = localStorage.getItem("editorHP-arquivos"), obj, id, novo
	
	Arquivo.arquivos = {}
	if (str != null) {
		obj = JSON.parse(str)
		for (id in obj) {
			novo = new Arquivo
			novo.conteudo = obj[id].conteudo
			novo.nome = obj[id].nome
			novo.modificado = obj[id].modificado
			novo.versao = obj[id].versao
			Arquivos.arquivos[id] = novo
		}
	}
}

// Salva os arquivos no navegador
Arquivo.salvar = function () {
	localStorage.setItem("editorHP-arquivos", JSON.stringify(Arquivo.arquivos))
}

// Define os ouvintes
Arquivo.carregarArquivos()
addEventListener("unload", Arquivo.salvar)
