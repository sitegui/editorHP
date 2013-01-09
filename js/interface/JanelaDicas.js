// Controla a janela de dicas
var JanelaDicas = {}

// Define as mensagens
JanelaDicas.dicas = [
	{id: 0, tempo: 0, dica: "Bem-vindo ao editor de textos para a HP50g. Basta escrever o que quiser no campo acima que tudo acontece"},
	{id: 1, tempo: 5, dica: "Use cabeçalhos pra facilitar a navegação. O editor divide seu texto em páginas e cria o índice com base neles"},
	{id: 2, tempo: 10, dica: "Quando quiser, clique salvar para poder baixar o arquivo para a sua calculadora"},
	{id: 3, acao: "salvar", dica: "Salve esse arquivo diretamente num cartão SD (ou use cabo+software). Para abri-lo na calculadora, vá em FILES > SD > seuarquivo > EVAL"},
	{id: 4, acao: "temSalvo", dica: "Seus arquivos antigos ficam sempre salvos no seu navegador. Para vê-los clique no menu Abrir"},
	{id: 5, tempo: 20, dica: "Você pode também pode editar um arquivo já baixado. Basta clicar ir no menu Abrir > Upload"}, 
	{id: 6, tempo: 40, dica: "Se quiser desativar a criação automática de páginas e índices, clique no botão &#9660; nos paineis Páginas e Índices"},
	{id: 7, tempo: 60, dica: "Você pode trocar páginas, anexos e índices de lugar. Basta arrasta-los"},
	{id: 8, tempo: 90, dica: "Você pode anexar equações, fórmulas, tabelas e imagens junto com seu arquivo"},
	{id: 9, tempo: 120, dica: "Gostou desse programa? Fale para seus amigos! Ajude a <a href='https://github.com/sitegui/editorHP/' target='_blank'>desenvolver</a> mais ferramentas"}
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
