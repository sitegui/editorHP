// Represeta o editor com um todo
var Editor = {}

// Indica o número de novos livros criados
Editor.numNovosLivros = 0

// Contém uma referência ao elementos copiados (deve-se clona-los antes de colar)
Editor.colagem = []

// Indica o tipo de elementos copiados ("paginas" ou "anexos")
Editor.tipoColagem = ""

// Evita que a pessoa feche sem salvar algum arquivo
addEventListener("beforeunload", function (evento) {
	var i
	for (i=0; i<InterfaceAbas.abas.length; i++)
		if (InterfaceAbas.abas[i].livro.modificado) {
			evento.preventDefault()
			return
		}
})

// Cria um livro vazio
Editor.criarNovoLivro = function () {
	var livro, pagina, indice, cabecalho, texto, aba, i, anexo
	
	// Cria o livro
	Editor.numNovosLivros++
	livro = new Livro
	livro.nome = "Sem título "+Editor.numNovosLivros
	livro.criacao = Date.now()
	livro.modificacao = Date.now()
	livro.novo = true
	
	;(function () {
		var indice = new SubIndice
		indice.nome = "Páginas"
		livro.indices.push(indice)
	})()
	
	// Cria elementos básicos
	for (i=1; i<=3; i++) {
		pagina = new Pagina
		cabecalho = new Cabecalho
		cabecalho.texto = "Página "+i
		texto = new Texto
		texto.texto = "Basta escrever seu texto aqui"
		pagina.elementos.push(cabecalho)
		pagina.elementos.push(texto)
		indice = new FolhaIndice
		indice.nome = "Página "+i
		indice.pagina = pagina
		anexo = new Anexo
		anexo.nome = "Anexo "+i
		anexo.conteudo = Compilador.sanitizar("\\<< "+i+" + \\>>")
		livro.paginas.push(pagina)
		livro.indices.push(indice)
		livro.anexos.push(anexo)
		livro.indices[0].indices.push(indice.clonar())
	}
	indice = new FolhaIndice
	indice.nome = "Página x"
	livro.indices.push(indice)
		
	// Exibe
	aba = new Aba(livro)
	InterfaceAbas.abas.push(aba)
	Interface.abaFoco = aba
	
	return livro
}
