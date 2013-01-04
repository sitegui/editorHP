// Represeta o editor com um todo
var Editor = {}

// Indica o número de novos livros criados
Editor.numNovosLivros = 0

// Cria um livro vazio
Editor.criarNovoLivro = function () {
	var livro, pagina, indice, cabecalho, texto, aba
	
	// Cria o livro
	Editor.numNovosLivros++
	livro = new Livro
	livro.nome = "Sem título "+Editor.numNovosLivros
	livro.criacao = Date.now()
	livro.modificacao = Date.now()
	
	// Cria elementos básicos
	pagina = new Pagina
	cabecalho = new Cabecalho
	cabecalho.texto = "Olá"
	texto = new Texto
	texto.texto = "Basta escrever seu texto aqui"
	pagina.elementos.push(cabecalho)
	pagina.elementos.push(texto)
	indice = new FolhaIndice
	indice.nome = "Olá"
	indice.pagina = pagina
	livro.paginas.push(pagina)
	livro.paginas.push(pagina.clonar())
	livro.paginas.push(pagina.clonar())
	livro.paginas.push(pagina.clonar())
	livro.paginas.push(pagina.clonar())
	livro.paginas.push(pagina.clonar())
	livro.paginas.push(pagina.clonar())
	livro.indices.push(indice)
	
	// Exibe
	aba = new Aba(livro)
	InterfaceAbas.abas.push(aba)
	Interface.abaFoco = aba
	InterfaceAbas.atualizarLayout()
	
	return livro
}
