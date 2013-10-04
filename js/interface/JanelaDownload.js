// Controla a janela de controle e instruções de download
var JanelaDownload = {}

// Inicializa a janela de download
JanelaDownload.init = function () {
}

// Abre a janela de download para acompanhar o andamento
// opcoes é um objeto com as propriedades url e nome
JanelaDownload.onabrir = function (opcoes) {
	get("janelaDownload-link").href = opcoes.url
	get("janelaDownload-link").download = opcoes.nome
	get("janelaDownload-cancelar").onclick = get("janelaDownload-fechar").onclick = function () {
		Interface.fecharJanela()
		URL.revokeObjectURL(opcoes.url)
		JanelaDicas.disparar("acao", "offline")
	}
}
