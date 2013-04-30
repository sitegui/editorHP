// Reúne métodos para abrir e gerar o formato da HP

/*
Fluxo das transformações:

+------+ normalizar +---------+ compilar +--------+ gerarDownload.php +---------+
|      | ---------> |         | -------> |        | ----------------> |         |
| HTML |            | Objetos |          | String |                   | Arquivo |
|      | <--------- |         | <------- |        | <---------------- |         |
+------+ gerarHTML* +---------+ inflar   +--------+ abrirUpload.php   +---------+

*Existe também gerarMiniHTML para a miniatura da página

Toda string salva na estrutura é sanitizada automaticamente

Os métodos para transformar de string em link são gerarLink e abrirLink

O método precompilarPixels converte ImageData no formato da HP
O método transcompilarPixels converte do formato HP para dataURL
*/
var Compilador = {}

// Interpreta o livro a partir de uma string
Compilador.inflar = function (str) {
	var obj, livro, i, pagina, elemento, temp, anexo, gerarIndice, j
	
	// Junta as linhas de um elemento de texto, preservando os \n impostos pelo usuário
	var juntarLinhas = function (linhas) {
		var i, j = 0, linhasReais = [""]
		for (i=0; i<linhas.length; i++) {
			if (linhas[i].substr(0, 6) == "\x13\x01\x13\x13\x01\x13") {
				// Inserido pelo usuário
				linhasReais[j] = linhasReais[j].substr(0, linhasReais[j].length-1)
				j++
				linhasReais.push("")
				linhas[i] = linhas[i].substr(6)
			}
			linhasReais[j] += linhas[i]+" "
		}
		linhasReais[j] = linhasReais[j].substr(0, linhasReais[j].length-1)
		return linhasReais.join("\n")
	}
	
	// Contrói o livro
	obj = Compilador.interpretarString(str)
	livro = new Livro
	livro.nome = obj[1]
	livro.criacao = obj[2][0]
	livro.modificacao = obj[2][1]
	livro.autoPaginacao = Boolean(obj[2][2])
	livro.autoIndexacao = Boolean(obj[2][3])
	livro.naoUsuario = !livro.autoIndexacao
	
	// Constrói as páginas
	for (i=0; i<obj[4].length; i++) {
		pagina = new Pagina
		
		// Constróis os elementos da página
		for (j=0; j<obj[4][i].length; j++) {
			temp = obj[4][i][j]
			switch (temp[temp.length-1]) {
				case 0:
					elemento = new Texto
					elemento.alinhamento = temp[0]
					elemento.texto = juntarLinhas(temp[1])
					break
				case 1:
					elemento = new Equacao
					elemento.alinhamento = temp[0]
					elemento.texto = temp[1]
					break
				case 2:
					elemento = new Imagem
					elemento.tamanho = Number(temp[1])
					elemento.cache = temp[0]+" "+temp[1]+" "+temp[2]+" "+temp[3]
					elemento.cacheURL = Compilador.transcompilarPixels(elemento.cache)
					break
				case 3:
					elemento = new Cabecalho
					elemento.alinhamento = temp[0]
					elemento.nivel = temp[1]
					elemento.texto = temp[2]
					if (elemento.nivel == 1)
						elemento.texto = elemento.texto.substr(6, elemento.texto.length-12)
					else if (elemento.nivel == 2 || elemento.nivel == 3 || elemento.nivel == 5)
						elemento.texto = elemento.texto.substr(3, elemento.texto.length-6)
					break
				case 4:
					elemento = new Regua
					elemento.altura = temp[0]
					break
			}
			pagina.elementos.push(elemento)
		}
		
		livro.paginas.push(pagina)
	}
	
	// Constrói um índice recursivamente
	gerarIndice = function (obj) {
		var indice, subindice, i
		if (obj[obj.length-1]) {
			indice = new FolhaIndice
			indice.pagina = livro.paginas[obj[1]-1] || null
		} else {
			indice = new SubIndice
			for (i=1; i<obj.length-1; i++)
				indice.indices.push(gerarIndice(obj[i]))
		}
		indice.nome = obj[0]
		return indice
	}
	
	// Constrói o índice
	if (livro.autoIndexacao)
		Editor.autoIndexar(livro)
	else
		for (i=0; i<obj[3].length; i++)
			livro.indices.push(gerarIndice(obj[3][i]))
	
	// Constrói os anexos
	for (i=0; i<obj[5].length; i++) {
		anexo = new Anexo
		anexo.nome = obj[5][i][0]
		anexo.conteudo = obj[5][i][1]
		livro.anexos.push(anexo)
	}
	
	return livro
}

// Compila um livro para um string
Compilador.compilar = function (livro) {
	var paginas, elementos, elementos2, elemento, alinhamento, indices, anexos, strings, texto
	var i, j
	var obj = []
	
	// Coloca a string dentro de uma string
	var escapar = function (str) {
		return "\""+str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")+"\""
	}
	
	// Compila um índice recursivamente
	var gerarIndice = function (indice) {
		var subs, i, pos
		if (indice instanceof FolhaIndice) {
			return "{"+escapar(indice.nome)+" "+(livro.paginas.indexOf(indice.pagina)+1)+". 1.}"
		} else {
			subs = []
			for (i=0; i<indice.indices.length; i++)
				subs.push(gerarIndice(indice.indices[i]))
			return "{"+escapar(indice.nome)+" "+subs.join(" ")+" 0.}"
		}
	}
	
	// Gera um string de busca para uma string
	var gerarBusca = function (str) {
		return str
		.replace(/[ÁÀÂÃÄÅ]/gi, "A")
		.replace(/Æ/gi, "AE")
		.replace(/Ç/gi, "C")
		.replace(/[ÈÉÊË]/gi, "E")
		.replace(/[ÌÍÎÏ]/gi, "I")
		.replace(/Ð/gi, "D")
		.replace(/Ñ/gi, "N")
		.replace(/[ÒÓÔÕÖ]/gi, "O")
		.replace(/[ÙÚÛÜ]/gi, "U")
		.replace(/Ý/gi, "Y")
		.replace(/[a-z]+/g, function (str) {
			return str.toUpperCase()
		})
		.replace(/\s+/g, " ")
	}
	
	// Quebra o texto em linhas
	// "um\nlinha grande" -> "{\"um\" \"linha\" \"grande\"}"
	var quebrarTexto = function (str) {
		var linhas, i, pos, novo
		
		// Já quebra nos \n do usuário
		linhas = str.split("\n")
		for (i=0; i<linhas.length; i++) {
			// Usa o objeto String para marcar que foi uma quebra feita pelo usuário
			linhas[i] = new String(linhas[i])
			linhas[i].usuario = true
		}
		
		// Quebra as linhas necessárias
		for (i=0; i<linhas.length; i++) {
			pos = linhas[i].lastIndexOf(" ", 33)
			if (pos == -1)
				// Não tem como quebrar antes, então tenta quebrar logo depois
				pos = linhas[i].indexOf(" ", 33)
			if (linhas[i].length > 33 && pos != -1) {
				// A linha é maior que o visor e tem onde quebrar
				novo = new String(linhas[i].substr(pos+1))
				novo.usuario = false
				linhas.splice(i+1, 0, novo)
				novo = new String(linhas[i].substr(0, pos))
				novo.usuario = linhas[i].usuario
				linhas[i] = novo
			}
		}
		
		// Marca com bytes invisíveis os \n do usuário
		linhas[0] = escapar(linhas[0])
		for (i=1; i<linhas.length; i++)
			if (linhas[i].usuario)
				linhas[i] = escapar("\x13\x01\x13\x13\x01\x13"+linhas[i])
			else
				linhas[i] = escapar(linhas[i])
		
		return "{"+linhas.join(" ")+"}"
	}
	
	// Dados básicos
	obj[0] = "1."
	obj[1] = escapar(livro.nome)
	obj[2] = "{"+livro.criacao+" "+livro.modificacao+" "+Number(livro.autoPaginacao)+" "+Number(livro.autoIndexacao)+"}"
	
	// Monta os índices
	indices = []
	for (i=0; i<livro.indices.length; i++)
		indices.push(gerarIndice(livro.indices[i]))
	obj[3] = "{"+indices.join(" ")+"}"
	
	// Monta as páginas e as strings de busca
	paginas = []
	strings = []
	for (i=0; i<livro.paginas.length; i++) {
		elementos = []
		elementos2 = []
		for (j=0; j<livro.paginas[i].elementos.length; j++) {
			elemento = livro.paginas[i].elementos[j]
			alinhamento = "-1."
			switch (elemento.alinhamento) {
				case 0: alinhamento = "0."; break
				case 1: alinhamento = "1."; break
			}
			if (elemento instanceof Texto) {
				elementos.push("{"+alinhamento+" "+quebrarTexto(elemento.texto)+" 0.}")
				elementos2.push(gerarBusca(elemento.texto))
			} else if (elemento instanceof Equacao)
				elementos.push("{"+alinhamento+" "+escapar(elemento.texto)+" 1.}")
			else if (elemento instanceof Imagem)
				elementos.push("{"+elemento.cache+" 2.}")
			else if (elemento instanceof Cabecalho) {
				texto = elemento.texto
				switch (elemento.nivel) {
					case 1: texto = "\x13\x01\x13\x13\x03\x13"+texto+"\x13\x03\x13\x13\x01\x13"; break
					case 2: texto = "\x13\x01\x13"+texto+"\x13\x01\x13"; break
					case 3: texto = "\x13\x03\x13"+texto+"\x13\x03\x13"; break
					case 5: texto = "\x13\x02\x13"+texto+"\x13\x02\x13"; break
				}
				elementos.push("{"+alinhamento+" "+elemento.nivel+". "+escapar(texto)+" 3.}")
				elementos2.push(gerarBusca(elemento.texto))
			} else if (elemento instanceof Regua)
				elementos.push("{"+elemento.altura+". 4.}")
		}
		paginas.push("{"+elementos.join(" ")+"}")
		strings.push(escapar(elementos2.join(";")))
	}
	obj[4] = "{"+paginas.join(" ")+"}"
	obj[6] = "{"+strings.join(" ")+"}"
	
	// Monta os anexos
	anexos = []
	for (i=0; i<livro.anexos.length; i++)
		anexos.push("{"+escapar(livro.anexos[i].nome)+" "+escapar(livro.anexos[i].conteudo)+"}")
	obj[5] = "{"+anexos.join(" ")+"}"
	
	return "{"+obj.join(" ")+"}"
}

// Gera HTML de uma página
Compilador.gerarHTML = function (pagina) {
	var i, html, el, getAlinhamento, escaparHTML
	
	getAlinhamento = function (elemento) {
		switch (elemento.alinhamento) {
			case 0: return "align='center'"
			case 1: return "align='right'"
		}
		return ""
	}
	
	escaparHTML = function (elemento) {
		return Compilador.desanitizar(elemento.texto).replace(/&/g, "&amp;").replace(/</g, "&lt;")
	}
	
	html = ""
	for (i=0; i<pagina.elementos.length; i++) {
		el = pagina.elementos[i]
		if (el instanceof Texto)
			html += "<p "+getAlinhamento(el)+">"+escaparHTML(el).replace(/\n/g, "<br>")+"</p>"
		else if (el instanceof Equacao)
			html += "<h6 "+getAlinhamento(el)+">"+escaparHTML(el)+"</h6>"
		else if (el instanceof Imagem)
			html += "<figure><img src='"+el.cacheURL+"' data-imagem='"+el.imagem+
			"' onclick='InterfaceEdicao.editarImagem(event)' data-filtro='"+el.filtro+"' width='"+(2*el.tamanho)+"px' data-ajuste='"+el.ajuste+
			"' data-tamanho='"+el.tamanho+"' data-cache='"+el.cache+"'"+(el.desenhado ? " data-desenhado='1'" : "")+"></figure>"
		else if (el instanceof Cabecalho)
			html += "<h"+el.nivel+" "+getAlinhamento(el)+">"+escaparHTML(el)+"</h"+el.nivel+">"
		else if (el instanceof Regua)
			html += "<hr size='"+el.altura+"' color='black'>"
	}
	
	return html
}

// Gera HTML em miniatura de uma página
Compilador.gerarMiniHTML = function (pagina, num) {
	var i, html, el, getAlinhamento, escaparHTML, estilo
	
	getAlinhamento = function (elemento) {
		switch (elemento.alinhamento) {
			case 0: return "align='center'"
			case 1: return "align='right'"
		}
		return ""
	}
	
	escaparHTML = function (elemento) {
		return Compilador.desanitizar(elemento.texto).replace(/&/g, "&amp;").replace(/</g, "&lt;")
	}
	
	html = "<div class='pagina-numero'>"+num+"</div>"
	for (i=0; i<pagina.elementos.length; i++) {
		el = pagina.elementos[i]
		if (el instanceof Texto)
			html += "<p "+getAlinhamento(el)+">"+escaparHTML(el).replace(/\n/g, "<br>")+"</p>"
		else if (el instanceof Equacao)
			html += "<h6 style='font-size:inherit' "+getAlinhamento(el)+">"+escaparHTML(el)+"</h6>"
		else if (el instanceof Imagem)
			html += "<div align='center'><img src='"+el.cacheURL+"' data-imagem='"+el.imagem+
			"' data-filtro='"+el.filtro+"' data-ajuste='"+el.ajuste+"' width='"+(el.tamanho/2)+"px'"+
			" data-tamanho='"+el.tamanho+"' data-cache='"+el.cache+"'></div>"
		else if (el instanceof Cabecalho) {
			switch (el.nivel) {
				case 1: estilo = "font-weight:bold;text-decoration:underline"; break
				case 2: estilo = "font-weight:bold"; break
				case 3: estilo = "text-decoration:underline"; break
				case 4: estilo = ""; break
				case 5: estilo = "font-style:italic"; break
			}
			html += "<p "+getAlinhamento(el)+" style='font-size:larger;"+estilo+"'>"+escaparHTML(el)+"</p>"
		} else if (el instanceof Regua)
			html += "<hr size='"+el.altura+"' color='black'>"
	}
	
	return html
}

// Normaliza o HTML para uma página
// Recebe o nó raiz da árvore
// Executa a função onsucesso com um vetor de elementos
// Caso haja imagens não filtradas, o filtro é aplicado em paralelo
Compilador.normalizar = function (raiz, onsucesso) {
	var lista, no, i, validos, primeiro, agrupar, elementos, elemento, imagensSemFiltro, total, img
	
	// Percorre a árvore enraizando elementos válidos
	validos = ["P", "IMG", "H1", "H2", "H3", "H4", "H5", "H6", "HR"]
	lista = [raiz]
	while (lista.length) {
		no = lista.pop()
		for (i=0; i<no.childNodes.length; i++)
			lista.push(no.childNodes.item(i))
		
		if (no.nodeType == Node.ELEMENT_NODE && validos.indexOf(no.nodeName) != -1 && no.parentNode != raiz)
			// Enraiza o nó válido
			Compilador.enraizarNo(no, raiz)
	}
	
	// Agrupa nós enraizados não válidos
	no = raiz.firstChild
	primeiro = null
	agrupar = function (primeiro, ultimo) {
		var novoNo, temp
		novoNo = document.createElement("P")
		while (primeiro != ultimo) {
			temp = primeiro.nextSibling
			novoNo.appendChild(primeiro)
			primeiro = temp
		}
		raiz.insertBefore(novoNo, ultimo)
	}
	while (no) {
		if (validos.indexOf(no.nodeName) == -1 && !primeiro) {
			primeiro = no
		} else if (validos.indexOf(no.nodeName) != -1 && primeiro) {
			agrupar(primeiro, no)
			primeiro = null
		}
		no = no.nextSibling
	}
	if (primeiro)
		agrupar(primeiro, no)
	
	// Normaliza os elementos
	elementos = []
	imagensSemFiltro = []
	for (i=0; i<raiz.childNodes.length; i++) {
		no = raiz.childNodes.item(i)
		if (no.textContent == "" && no.nodeName != "IMG" && no.nodeName != "HR") {
			raiz.removeChild(no)
			i--
			continue
		}
		elemento = Compilador.normalizarElemento(no)
		if (elemento) {
			elementos.push(elemento)
			if (elemento.nodeName == "IMG")
				imagensSemFiltro.push(elemento)
		}
	}
	
	// Aplica filtro em todas as imagens sem filtro
	total = imagensSemFiltro.length
	var tratarRetorno = function (img) {
		return function (elemento) {
			var pos, canvas
			
			total--
			if (!elemento)
				return
			
			// Desenha no canvas e pega a dataURL
			canvas = document.createElement("canvas")
			canvas.width = elemento.pixels.width
			canvas.height = elemento.pixels.height
			canvas.getContext("2d").putImageData(elemento.pixels, 0, 0)
			elemento.cacheURL = canvas.toDataURL()
			
			// Pré-compila para o formato da HP
			elemento.cache = Compilador.precompilarPixels(elemento.pixels)
			elemento.pixels = null
			
			pos = elementos.indexOf(img)
			elementos.splice(pos, 1, elemento)
			
			if (total == 0)
				onsucesso(elementos)
		}
	}
	for (i=0; i<total; i++) {
		img = imagensSemFiltro[i]
		CompiladorParalelo.aplicarFiltroPadrao(img, tratarRetorno(img))
	}
	if (total == 0)
		onsucesso(elementos)
}

// Abre um arquivo enviado pelo usuário
// Função assíncrona, executa onsucesso quando acabar (o conteúdo do arquivo vai como argumento)
Compilador.abrirUpload = function (arquivo, onsucesso) {
	var xhr, dados
	
	dados = new FormData
	dados.append("arquivo", arquivo)
	
	xhr = new XMLHttpRequest
	xhr.open("POST", "abrirUpload.php")
	xhr.send(dados)
	xhr.onload = function () {
		onsucesso(xhr.responseText)
	}
}

// Gera um arquivo de download a partir de um objeto arquivo
Compilador.gerarDownload = (function () {
	var iframe, form, input, input2
	
	// Monta o formulário quando a página estiver carregada
	addEventListener("load", function () {
		iframe = document.createElement("iframe")
		iframe.name = "iframeDownload"
		form = document.createElement("form")
		form.target = "iframeDownload"
		form.method = "post"
		form.action = "gerarDownload.php"
		form.style.display = "none"
		input = document.createElement("textarea") // Chrome não funciona com input :|
		input.name = "livro"
		input2 = document.createElement("input")
		input2.name = "nome"
		form.appendChild(input)
		form.appendChild(input2)
		form.appendChild(iframe)
		document.body.appendChild(form)
	})
	
	return function (arquivo) {
		// Envia
		input.value = arquivo.conteudo
		input2.value = arquivo.nome
		form.submit()
		
		// Mostra ajuda
		JanelaDicas.disparar("acao", "salvar")
	}
})()

// Interpreta o livro a partir de uma dataURL
Compilador.abrirURL = function (url, onsucesso) {
	var xhr, dados
	xhr = new XMLHttpRequest
	xhr.open("POST", "abrirURL.php")
	dados = new FormData
	dados.append("url", url)
	xhr.send(dados)
	xhr.onload = function () {
		onsucesso(xhr.responseText)
	}
	xhr.onerror = function () {
		alert(_("erroAbrirUrl"))
	}
}

// Gera um link para abrir o arquivo
// Função assíncrona, executa onsucesso quando obtiver a resposta
Compilador.gerarUrl = function (livro, onsucesso) {
	var str, xhr, dados
	str = Compilador.compilar(livro)
	xhr = new XMLHttpRequest
	xhr.open("POST", "gerarURL.php")
	dados = new FormData
	dados.append("livro", str)
	xhr.send(dados)
	xhr.onload = function () {
		onsucesso(xhr.responseText)
	}
	xhr.onerror = function () {
		alert(_("erroGerarUrl"))
	}
}

// Sanitiza uma string do PC (troca os tri-graphs e remove caracteres inválidos)
Compilador.sanitizar = function (str) {
	var i, str2 = ""
	str = str.replace(/[\r\t]/g, "")
	for (i in Compilador.triGraphs)
		str = str.replace(new RegExp(i, "g"), Compilador.triGraphs[i])
	for (i=0; i<str.length; i++)
		if (str[i] in Compilador.mapaPC2HP)
			str2 += str[i]
	return str2
}

// Um método quase inverso de sanitizar, para tornar caracteres invisíveis em \nnn
Compilador.desanitizar = function (str) {
	return str.replace(/[\x00-\x09\x0B-\x1B]/g, function (c) {
		var n = c.charCodeAt(0)
		return n<10 ? "\\00"+n : (n<100 ? "\\0"+n : "\\"+n)
	})
}

// Transforma pixels pós-filtro na representação da HP (ex: "GROB 1 1 00")
Compilador.precompilarPixels = function (pixels) {
	var w, h, cores, i, str, x, y, b1, b2
	w = pixels.width
	h = pixels.height
	
	// Pega os pixels e transforma em preto/branco
	cores = new Array(pixels.data.length/4)
	for (i=0; i<pixels.data.length; i+=4)
		cores[i/4] = pixels.data[i+3] > 128
	
	// Transforma a imagem
	str = "GROB "+w+" "+h+" "
	for (y=0; y<h; y++) {
		// Percorre de 8 em 8 pixels
		for (x=0; x<w; x+=8) {
			i = y*w+x
			b1 = 1*cores[i]
			b2 = 0
			if (x+1 < w) b1 += 2*cores[i+1]
			if (x+2 < w) b1 += 4*cores[i+2]
			if (x+3 < w) b1 += 8*cores[i+3]
			if (x+4 < w) b2 += 1*cores[i+4]
			if (x+5 < w) b2 += 2*cores[i+5]
			if (x+6 < w) b2 += 4*cores[i+6]
			if (x+7 < w) b2 += 8*cores[i+7]
			str += b1.toString(16).toUpperCase()+b2.toString(16).toUpperCase()
		}
	}
	
	return str
}

// Transcompila os pixels do formato da HP para o uma dataURL
Compilador.transcompilarPixels = function (str) {
	var w, h, x, y, partes, pixels, canvas, contexto, b1, b2, i, j
	
	// Pega o tamanho
	partes = str.split(" ")
	w = Number(partes[1])
	h = Number(partes[2])
	
	// Cria um canvas, pega o contexto e aloca os pixels
	canvas = document.createElement("canvas")
	contexto = canvas.getContext("2d")
	pixels = contexto.createImageData(w, h)
	
	// Monta os pixels
	i = 0
	for (y=0; y<h; y++) {
		for (x=0; x<w; x+=8) {
			j = y*w+x
			b1 = parseInt(partes[3].charAt(i), 16)
			b2 = parseInt(partes[3].charAt(i+1), 16)
			pixels.data[4*j+3] = 255*(b1%2)
			if (x+1 < w) pixels.data[4*j+7] = 255*((b1>>1)%2)
			if (x+2 < w) pixels.data[4*j+11] = 255*((b1>>2)%2)
			if (x+3 < w) pixels.data[4*j+15] = 255*((b1>>3)%2)
			if (x+4 < w) pixels.data[4*j+19] = 255*(b2%2)
			if (x+5 < w) pixels.data[4*j+23] = 255*((b2>>1)%2)
			if (x+6 < w) pixels.data[4*j+27] = 255*((b2>>2)%2)
			if (x+7 < w) pixels.data[4*j+31] = 255*((b2>>3)%2)
			i+=2
		}
	}
	
	// Desenha no canvas e pega o resultado
	canvas.width = w
	canvas.height = h
	contexto.putImageData(pixels, 0, 0)
	return canvas.toDataURL()
}

/*
Métodos para uso interno
*/

// Sobe um nó válido até a raiz
Compilador.enraizarNo = function (no, raiz) {
	var pai, esq, dir, validos
	
	validos = ["P", "IMG", "H1", "H2", "H3", "H4", "H5", "H6", "HR"]
	pai = no.parentNode
	while (pai != raiz) {
		if (pai.firstChild != no) {
			// Tira os nós da esquerda
			esq = pai.cloneNode(false)
			while (pai.firstChild != no)
				esq.appendChild(pai.firstChild)
			pai.parentNode.insertBefore(esq, pai)
		}
		
		if (pai.lastChild != no) {
			// Tira os nós da direita
			dir = pai.cloneNode(false)
			while (pai.childNodes.length>1)
				dir.appendChild(pai.childNodes.item(1))
			pai.parentNode.insertBefore(dir, pai.nextSibling)
		}
		
		// Sobe o nó
		pai.parentNode.insertBefore(no, pai)
		pai.parentNode.removeChild(pai)
		if (no.nodeName == "P" && validos.indexOf(pai.nodeName) == -1) {
			// Troca o papel de pai-filho no nó
			while(no.childNodes.length)
				pai.appendChild(no.firstChild)
			no.appendChild(pai)
		}
		pai = no.parentNode
	}
}

// Normaliza um elemento HTML válido (P, IMG, H1, H2, H3, H4, H5, H6, HR)
Compilador.normalizarElemento = function (no) {
	var elemento, texto, alinhamento = -1, css
	
	// Pega o alinhamento
	css = getComputedStyle(no).textAlign
	if (css.indexOf("right") != -1)
		alinhamento = 1
	else if (css.indexOf("center") != -1)
		alinhamento = 0
	
	switch (no.nodeName) {
		case "P":
			no.innerHTML = no.innerHTML.replace(/<br(?=\W)[^>]*?>/gi, "\n")
			texto = Compilador.sanitizar(no.textContent.trim())
			if (texto == "")
				return null
			elemento = new Texto
			elemento.texto = texto
			elemento.alinhamento = alinhamento
			return elemento
		case "H6":
			texto = Compilador.sanitizar(no.textContent.trim())
			if (texto == "")
				return null
			elemento = new Equacao
			elemento.texto = texto
			elemento.alinhamento = alinhamento
			return elemento
		case "IMG":
			if (!no.dataset.cache) {
				// Imagem sem filtro aplicado
				// Retorna o nó para que Compilador.normalizar rode o filtro depois
				return no
			} else {
				elemento = new Imagem
				elemento.imagem = no.dataset.imagem
				elemento.filtro = no.dataset.filtro
				elemento.ajuste = no.dataset.ajuste
				elemento.tamanho = no.dataset.tamanho
				elemento.cache = no.dataset.cache
				elemento.cacheURL = no.src
				if (no.dataset.desenhado)
					elemento.desenhado = true
				return elemento
			}
		case "H1":
		case "H2":
		case "H3":
		case "H4":
		case "H5":
			texto = Compilador.sanitizar(no.textContent.trim())
			if (texto == "")
				return null
			elemento = new Cabecalho
			elemento.texto = texto
			elemento.nivel = Number(no.nodeName.substr(1))
			elemento.alinhamento = alinhamento
			return elemento
		case "HR":
			elemento = new Regua
			elemento.altura = Number(no.size)
			return elemento
	}
	
	// Elemento inválido
	return null
}

// Interpreta uma string com um objeto da HP, retorna uma array com ele
// Ex: "{ 1 2 { 3 .14 } }" -> [1, 2, [3, .14]]
Compilador.interpretarString = function (str) {
	var obj, objAtual, i, c, strLiteral, buffer, salvarBuffer, novo, escape
	
	obj = []
	obj.pai = null
	objAtual = obj
	strLiteral = false
	buffer = ""
	escape = false
	
	salvarBuffer = function () {
		if (buffer) {
			if (buffer.length > 1 && buffer.charAt(0) == "\"" && buffer.charAt(buffer.length-1) == "\"")
				objAtual.push(buffer.substr(1, buffer.length-2).replace(/\\"/g, "\"").replace(/\\\\/g, "\\"))
			else if (!isNaN(Number(buffer)))
				objAtual.push(Number(buffer))
			else
				objAtual.push(buffer)
			buffer = ""
		}
	}
	
	for (i=0; i<str.length; i++) {
		c = str.charAt(i)
		if (c == "{" && !strLiteral) {
			salvarBuffer()
			novo = []
			novo.pai = objAtual
			objAtual.push(novo)
			objAtual = novo
		} else if (c == "}" && !strLiteral) {
			salvarBuffer()
			novo = objAtual.pai
			delete objAtual.pai
			objAtual = novo
		} else if (c == "\"" && !escape) {
			buffer += c
			strLiteral = !strLiteral
		} else if (c == "\\" && strLiteral && !escape) {
			escape = true
			buffer += c
		} else if ((c == " " || c == "\n" || c == "\r" || c == "\t") && !strLiteral) {
			salvarBuffer()
		} else {
			buffer += c
			escape = false
		}
	}
	
	salvarBuffer()
	delete obj.pai
	
	return obj[0]
}

// Conversão HP -> PC
// Códigos vão de 0 a 255
Compilador.mapaHP2PC = [
"\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07",
"\x08", "\x09", "\n", "\x0B", "\x0C", "\x0D", "\x0E", "\x0F",
"\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17",
"\x18", "\x19", "\x1A", "\x1B", "\u21D0", "\u25A0", "\u2026", "\u2026",
" ", "!", "\"", "#", "$", "%", "&", "'",
"(", ")", "*", "+", ",", "-", ".", "/",
"0", "1", "2", "3", "4", "5", "6", "7",
"8", "9", ":", ";", "<", "=", ">", "?",
"@", "A", "B", "C", "D", "E", "F", "G",
"H", "I", "J", "K", "L", "M", "N", "O",
"P", "Q", "R", "S", "T", "U", "V", "W",
"X", "Y", "Z", "[", "\\", "]", "^", "_",
"`", "a", "b", "c", "d", "e", "f", "g",
"h", "i", "j", "k", "l", "m", "n", "o",
"p", "q", "r", "s", "t", "u", "v", "w",
"x", "y", "z", "{", "|", "}", "~", "\x7F",
"\u2221", "", "\u2207", "\u221A", "\u222B", "\u03A3", "\u25B6", "\u03C0",
"\u2202", "\u2264", "\u2265", "\u2260", "\u03B1", "\u2192", "\u2190", "\u2193",
"\u2191", "\u03B3", "\u03B4", "\u03B5", "\u03B7", "\u03B8", "\u03BB", "\u03C1",
"\u03C3", "\u03C4", "\u03C9", "\u0394", "\u03A0", "\u03A9", "\u25AA", "\u221E",
"\u20AC", "¡", "¢", "£", "¤", "¥", "¦", "§",
"¨", "©", "ª", "«", "¬", "­", "®", "¯",
"°", "±", "²", "³", "´", "µ", "¶", "·",
"¸", "¹", "º", "»", "¼", "½", "¾", "¿",
"À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç",
"È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï",
"Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×",
"Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß",
"à", "á", "â", "ã", "ä", "å", "æ", "ç",
"è", "é", "ê", "ë", "ì", "í", "î", "ï",
"ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷",
"ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ"
]

// Conversão PC -> HP
// Valores inexistentes são inválidos
Compilador.mapaPC2HP = (function () {
	var i, retorno = {
		"\u2211": 133,
		"\u2206": 155,
		"\u220F": 156,
		"\u2126": 157,
		"\xA0": 32
	}
	for (i in Compilador.mapaHP2PC)
		retorno[Compilador.mapaHP2PC[i]] = Number(i)
	return retorno
})()

// Conversão tri-graphs
// Para sanitizar completamente a str é preciso retirar caracteres não presentes no mapaPC2HP
Compilador.triGraphs = {
	"\\\\028": "\u21D0",
	"\\\\029": "\u25A0",
	"\\\\030": "\u2026",
	"\\\\031": "\u2026",
	"\\\\<\\)": "\u2221",
	"\\\\x-": "x\u0305",
	"\\\\\\.V": "\u2207",
	"\\\\v/": "\u221A",
	"\\\\\\.S": "\u222B",
	"\\\\GS": "\u03A3",
	"\\\\\\|>": "\u25B6",
	"\\\\pi": "\u03C0",
	"\\\\\\.d": "\u2202",
	"\\\\<=": "\u2264",
	"\\\\>=": "\u2265",
	"\\\\=/": "\u2260",
	"\\\\Ga": "\u03B1",
	"\\\\->": "\u2192",
	"\\\\<-": "\u2190",
	"\\\\\\|v": "\u2193",
	"\\\\\\|\\^": "\u2191",
	"\\\\Gg": "\u03B3",
	"\\\\Gd": "\u03B4",
	"\\\\Ge": "\u03B5",
	"\\\\Gn": "\u03B7",
	"\\\\Gh": "\u03B8",
	"\\\\Gl": "\u03BB",
	"\\\\Gr": "\u03C1",
	"\\\\Gs": "\u03C3",
	"\\\\Gt": "\u03C4",
	"\\\\Gw": "\u03C9",
	"\\\\GD": "\u0394",
	"\\\\PI": "\u03A0",
	"\\\\GW": "\u03A9",
	"\\\\\\[\\]": "\u25AA",
	"\\\\oo": "\u221E",
	"\\\\160": "\u20AC",
	"\\\\<<": "«",
	"\\\\\\^o": "°",
	"\\\\Gm": "µ",
	"\\\\>>": "»",
	"\\\\\\.x": "×",
	"\\\\0/": "Ø",
	"\\\\Gb": "ß",
	"\\\\:-": "÷",
	"\\\\(\\d\\d\\d)": function (match, num) {
		return Compilador.mapaHP2PC[Number(num)]
	}
}
