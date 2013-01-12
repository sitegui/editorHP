// Implementa a interface das abas
var InterfaceAbas = {}

// Guarda as abas. Cada elemento é objeto instancia de Aba
InterfaceAbas.abas = []

// Define os callbacks dos botões
InterfaceAbas.init = function () {
	get("abaMais").onclick = function () {
		Editor.criarNovoLivro()
	}
}

// Atualiza o layout das abas
InterfaceAbas.atualizarLayout = function () {
	var largura, i, aba
	largura = Math.min((get("abas").clientWidth-30)/InterfaceAbas.abas.length, 150)
	for (i=0; i<InterfaceAbas.abas.length; i++) {
		aba = InterfaceAbas.abas[i]
		aba.div.style.width = largura+"px"
		aba.div.style.left = (largura*i)+"px"
		if (aba == Interface.abaFoco)
			aba.div.classList.add("aba-foco")
		else
			aba.div.classList.remove("aba-foco")
		aba.div.childNodes.item(0).textContent = (aba.livro.modificado ? "*" : "")+aba.livro.nome
		aba.div.childNodes.item(1).style.display = ""
	}
	get("abaMais").style.left = (largura*i)+"px"
	
	// Evita de fechar a última aba
	if (InterfaceAbas.abas.length == 1)
		InterfaceAbas.abas[0].div.childNodes.item(1).style.display = "none"
}

// Representa cada aba
function Aba(livro) {
	var nome, fechar, div, that
	
	// Cria os elementos
	div = document.createElement("div")
	div.className = "aba"
	div.style.opacity = "0"
	nome = document.createElement("div")
	nome.className = "aba-nome"
	nome.textContent = livro.nome
	fechar = document.createElement("div")
	fechar.className = "aba-fechar minibotao-vermelho"
	fechar.innerHTML = "&times;"
	fechar.title = _("fecharArquivo")
	
	// Define os ouvintes
	that = this
	fechar.onclick = function (evento) {
		that.fechar()
		evento.stopPropagation()
	}
	div.onclick = function () {
		Interface.abaFoco = that
	}
	div.ondblclick = function () {
		var opcoes = {}
		
		if (that.livro.novo) {
			// Melhor salvar de uma vez, do que renomear depois salvar
			InterfaceMenus.salvarLivro(that.livro)
			return
		}
		
		opcoes.titulo = _("renomear", that.livro.nome)
		opcoes.conteudo = "<p>"+_("novoNome")+": <input size='50' id='js-nome' value=\""+that.livro.nome+"\"></p>"
		opcoes.onconfirmar = function () {
			var antes, depois, novoAntes
			antes = that.livro.nome
			novoAntes = that.livro.novo
			depois = Compilador.sanitizar(get("js-nome").value)
			if (depois)
				new Acao(_("renomeacao"), function () {
					that.livro.nome = depois
					that.livro.novo = false
					InterfaceAbas.atualizarLayout()
				}, function () {
					that.livro.nome = antes
					that.livro.novo = novoAntes
					InterfaceAbas.atualizarLayout()
				})
		}
		Interface.abrirJanela("janelaBasica", opcoes)
	}
	
	// Monta os elementos
	div.appendChild(nome)
	div.appendChild(fechar)
	div.style.opacity = "0"
	get("abas").insertBefore(div, get("abaMais"))
	setTimeout(function () {
		div.style.opacity = "1"
	}, 250)
	
	// Define as propriedades do objeto
	this.div = div
	this.livro = livro
	this.paginaFoco = livro.paginas.length ? livro.paginas[0] : null
	this.paginasSelecionadas = {}
	this.historico = []
	this.posHistorico = 0
	this.idAcaoSalvo = ""
	if (livro.paginas.length)
		this.paginasSelecionadas[livro.paginas[0].id] = true
}

// Fecha a aba
Aba.prototype.fechar = function () {
	var pos, that = this
	
	if (this.livro.modificado) {
		Interface.abrirJanela("janelaBasica", {titulo: _("fecharSemSalvar"), onconfirmar: function () {
			that.livro.modificado = false
			that.fechar()
		}, conteudo: _("fecharSemSalvar_conteudo")})
	} else {
		pos = InterfaceAbas.abas.indexOf(this)
		if (pos != -1)
			InterfaceAbas.abas.splice(pos, 1)
		this.div.style.opacity = "0"
		setTimeout(function () {
			get("abas").removeChild(that.div)
		}, 500)
		
		// Muda o foco
		if (Interface.abaFoco == this)
			if (InterfaceAbas.abas.length)
				if (pos > 0)
					Interface.abaFoco = InterfaceAbas.abas[pos-1]
				else
					Interface.abaFoco = InterfaceAbas.abas[pos]
			else
				Editor.criarNovoLivro()
		InterfaceAbas.atualizarLayout()
	}
}
