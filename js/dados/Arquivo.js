// Representa um arquivo salvo no navegador
function Arquivo() {
	this.conteudo = ""
	this.nome = ""
	this.modificacao = 0
	this.id = ""
	this.versao = 0
}

// Salva o livro no arquivo (sobreescreve se já exisitir)
// Retorna um objeto arquivo
Arquivo.salvarLivro = function (livro) {
	var arquivo
	
	livro.modificacao = Date.now()
	livro.modificado = false
	
	arquivo = new Arquivo
	arquivo.conteudo = Compilador.compilar(livro)
	arquivo.nome = livro.nome
	arquivo.id = livro.id
	arquivo.modificacao = livro.modificacao
	arquivo.versao = 1
	Arquivo.arquivos[livro.id] = arquivo
	
	return arquivo
}

// Guarda todos os arquivos recentes, indexados pelo id
Arquivo.arquivos = {}

// Carrega a lista de arquivos
Arquivo.carregarArquivos = function () {
	var str = localStorage.getItem("editorHP-arquivos"), obj, id, novo, temSalvo = false
	
	Arquivo.arquivos = {}
	if (str != null) {
		obj = JSON.parse(str)
		for (id in obj) {
			novo = new Arquivo
			novo.conteudo = obj[id].conteudo
			novo.nome = obj[id].nome
			novo.modificacao = obj[id].modificacao
			novo.versao = obj[id].versao
			novo.id = obj[id].id
			Arquivo.arquivos[id] = novo
			temSalvo = true
		}
		if (temSalvo)
			setTimeout(function () {
				JanelaDicas.disparar("acao", "temSalvo")
			}, 1e3)
	}
}

// Define os ouvintes
Arquivo.carregarArquivos()

// Salva os arquivos no navegador logo antes de sair
addEventListener("unload", function () {
	localStorage.setItem("editorHP-arquivos", JSON.stringify(Arquivo.arquivos))
})
