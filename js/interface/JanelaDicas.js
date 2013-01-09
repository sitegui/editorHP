// Controla a janela de dicas
var JanelaDicas = {}

// Define as mensagens
JanelaDicas.dicas = [
	{id: 0, tempo: 0, dica: "olá"},
	{id: 1, tempo: 5, dica: "use cabeçalhos"},
	{id: 2, tempo: 10, dica: "clique salvar"},
	{id: 3, acao: "salvar", dica: "salve num sd ou use cabo+software depois vá em files > eval"},
	{id: 4, acao: "temSalvo", dica: "vá em abrir"},
	{id: 5, tempo: 20, dica: "você pode fazer upload"}, 
	{id: 6, tempo: 40, dica: "auto paginação e auto indexação"},
	{id: 7, tempo: 60, dica: "arraste índice"}
]

// Guarda os ids das mensagens já disparadas
JanelaDicas.disparadas = []

// Guarda quanto tempo já foi
JanelaDicas.tempo = 0
JanelaDicas.inicio = Date.now()

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
	
	alert(JanelaDicas.tempo)
}

// TODO: remover isso
JanelaDicas.limpar = function () {
	JanelaDicas.disparadas = []
	JanelaDicas.tempo = 0
	JanelaDicas.inicio = Date.now()
}

// Dispara e exibe uma dica (se não disparada ainda)
// Recebe o tipo de evento e valor atingido para identificar a dica
// Retorna a dica (null se não for encontrada)
JanelaDicas.disparar = function (evento, valor) {
	var i, dica
	for (i=0; i<JanelaDicas.dicas.length; i++) {
		dica = JanelaDicas.dicas[i]
		if ((evento in dica) && dica[evento] == valor && !dica.disparada) {
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
