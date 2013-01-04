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
	}
	get("abaMais").style.left = (largura*i)+"px"
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
	fechar.title = "Fechar arquivo"
	
	// Define os ouvintes
	that = this
	fechar.onclick = function (evento) {
		that.fechar()
		evento.stopPropagation()
	}
	div.onclick = function () {
		that.focar()
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
// TODO: perguntar se quer fechar sem salvar
Aba.prototype.fechar = function () {
	var pos, that = this
	
	if (this.livro.modificado) {
		Interface.abrirJanela("janelaBasica", {titulo: "Fechar sem salvar", onconfirmar: function () {
			that.livro.modificado = false
			that.fechar()
		}, conteudo: "Deseja realmente fechar esse livro e perder todas as modificações não salvas?"})
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

// Abre o arquivo da aba
Aba.prototype.focar = function () {
	Interface.abaFoco = this
	InterfaceAbas.atualizarLayout()
}
