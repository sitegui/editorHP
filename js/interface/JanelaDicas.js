// Controla a janela de dicas
var JanelaDicas = {}

// Define as mensagens
JanelaDicas.dicas = [
	{id: 0, tempo: 0, dica: _("dica0")},
	{id: 1, tempo: 5, dica: _("dica1")},
	{id: 2, tempo: 10, dica: _("dica2")},
	{id: 4, acao: "temSalvo", dica: _("dica4")},
	{id: 5, tempo: 20, dica: _("dica5")}, 
	{id: 6, tempo: 40, dica: _("dica6")},
	{id: 7, tempo: 60, dica: _("dica7")},
	{id: 8, tempo: 90, dica: _("dica8")},
	{id: 9, tempo: 120, dica: _("dica9")},
	{id: 10, acao: "baixarBiblioteca", dica: _("dica10")},
	{id: 11, acao: "offline", dica: _("dica11")}
]

// Guarda os ids das mensagens já disparadas
JanelaDicas.disparadas = []

// Guarda quanto tempo já foi
JanelaDicas.tempo = 0
JanelaDicas.inicio = Date.now()

// Limpa as dicas já dadas
JanelaDicas.limpar = function () {
  JanelaDicas.tempo = 0
  JanelaDicas.disparadas = []
}

// Define os ouvintes e carrega os dados salvos no navegador
JanelaDicas.init = function () {
	get("janelaDicas").onclick = JanelaDicas.fechar
	
	// Carrega quanto tempo o usuário já usou o editor
	if (localStorage.getItem("editorHP-tempo") != null)
		JanelaDicas.tempo = Number(localStorage.getItem("editorHP-tempo"))
	
	// Percorre as dicas, vendo qual já foi mostrada
	if (localStorage.getItem("editorHP-dicas") != null)
		JanelaDicas.disparadas = JSON.parse(localStorage.getItem("editorHP-dicas"))
	JanelaDicas.dicas.forEach(function (dica) {
		dica.disparada = JanelaDicas.disparadas.indexOf(dica.id)!=-1
		
		// Agenda para disparar as dicas de tempo não disparadas
		if (("tempo" in dica) && !dica.disparada) {
			setTimeout(function () {
				JanelaDicas.disparar("tempo", dica.tempo)
			}, (dica.tempo-JanelaDicas.tempo)*60e3)
		}
	})
	
	// Salva antes de sair
	addEventListener("unload", function () {
		localStorage.setItem("editorHP-dicas", JSON.stringify(JanelaDicas.disparadas))
		localStorage.setItem("editorHP-tempo", JanelaDicas.tempo+(Date.now()-JanelaDicas.inicio)/60e3)
	})
}

// Dispara e exibe uma dica (se não disparada ainda)
// Recebe o tipo de evento e valor atingido para identificar a dica
// Retorna a dica (null se não for encontrada)
// Se forcar for true, mostra a dica mesmo que ela já tenha sido disparada
JanelaDicas.disparar = function (evento, valor, forcar) {
	var i, dica
	for (i=0; i<JanelaDicas.dicas.length; i++) {
		dica = JanelaDicas.dicas[i]
		if ((evento in dica) && dica[evento] == valor && (forcar || !dica.disparada)) {
			JanelaDicas.abrir(dica.dica)
			JanelaDicas.disparadas.push(dica.id)
			dica.disparada = true
			return dica
		}
	}
	return null
}

// Marca uma dica como disparada, sem exibi-la
// Recebe os mesmos argumentos de JanelaDicas.disparar
// Retorna a dica (null se não for encontrada)
JanelaDicas.marcarDisparada = function (evento, valor) {
	var i, dica
	for (i=0; i<JanelaDicas.dicas.length; i++) {
		dica = JanelaDicas.dicas[i]
		if ((evento in dica) && dica[evento] == valor) {
			dica.disparada = true
			JanelaDicas.disparadas.push(dica.id)
			return dica
		}
	}
	return null
}

// Abre a janela de dicas com o conteúdo desejado
JanelaDicas.abrir = function (html) {
	get("janelaDicas").style.bottom = "0"
	get("janelaDicas-conteudo").innerHTML = html
}

// Fecha a janela
JanelaDicas.fechar = function () {
	get("janelaDicas").style.bottom = "-26%"
	if (JanelaDicas.onfechar)
		JanelaDicas.onfechar()
}
