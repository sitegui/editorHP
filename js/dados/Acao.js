// Representa um ação que pode ser desfeita e refeita
// A ação é associada a uma aba aberta
// Nas funções redo e undo, this se refere à aba associada à ação
function Acao(nome, redo, undo) {
	var aba = Interface.abaFoco
	
	this.id = String(Math.random())
	this.nome = nome
	this.redo = redo
	this.undo = undo
	
	if (aba.posHistorico < aba.historico.length)
		aba.historico = aba.historico.slice(0, aba.posHistorico)
	aba.historico.push(this)
	aba.posHistorico = aba.historico.length
	
	redo.call(aba)
	aba.livro.modificado = true
	InterfaceEdicao.atualizarDesfazer()
}

// Retorna o nome da ação a ser desfeita na aba ativa (null caso nada possa ser desfeito)
Acao.getDesfazer = function () {
	var aba, acao
	aba = Interface.abaFoco
	acao = aba.historico[aba.posHistorico-1]
	if (aba.posHistorico > 0 && acao.undo)
		return acao.nome
	return null
}

// Retorna o nome da ação a ser refeita na aba ativa (null caso nada possa ser refeito)
Acao.getRefazer = function () {
	var aba, acao
	aba = Interface.abaFoco
	acao = aba.historico[aba.posHistorico]
	if (aba.posHistorico < aba.historico.length && acao.redo)
		return acao.nome
	return null
}

// Desfaz a última ação na aba
Acao.desfazer = function (aba) {
	var acao
	if (aba.posHistorico > 0) {
		acao = aba.historico[aba.posHistorico-1]
		if (acao.undo) {
			acao.undo.call(aba)
			aba.posHistorico--
			if ((aba.posHistorico && aba.historico[aba.posHistorico-1].id!=aba.idAcaoSalvo)
				|| (!aba.posHistorico && aba.idAcaoSalvo!=""))
				aba.livro.modificado = true
			else
				aba.livro.modificado = false
		}
	}
}

// Refaz a ação na aba
Acao.refazer = function (aba) {
	var acao
	if (aba.posHistorico < aba.historico.length) {
		acao = aba.historico[aba.posHistorico]
		if (acao.redo) {
			acao.redo.call(aba)
			aba.posHistorico++
			if ((aba.posHistorico && aba.historico[aba.posHistorico-1].id!=aba.idAcaoSalvo)
				|| (!aba.posHistorico && aba.idAcaoSalvo!=""))
				aba.livro.modificado = true
			else
				aba.livro.modificado = false
		}
	}
}
