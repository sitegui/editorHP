// Permite validar as sintaxes de equações
var Sintaxe = {}

// Retorna uma string vazia se a string é uma equação válida (de acordo com a sintaxe da HP)
// Recebe a string que está dentro de uma tag <code>, por exemplo
// Aceita um subconjunto das sintaxes da HP, voltado somente a expressões, vetores e matrizes
// Caso a equação contenha um erro, retorna uma string com a explicação do erro
Sintaxe.validarEquacao = function (str) {
	var expressao
	
	str = str.trim()
	
	try {
		// Infla e interpreta a equação
		expressao = Sintaxe.inflar(str)
		Sintaxe.interpretar(expressao)
		Sintaxe.validarEstrutura(expressao)
		return ""
	} catch (e) {
		return e
	}
}

// Tipos
Sintaxe.TIPO_OPERADOR = 1 // {valor: }
Sintaxe.TIPO_NUMERO = 2 // {valor: }
Sintaxe.TIPO_VARIAVEL = 3 // {valor: }
Sintaxe.TIPO_PARENTESES = 4 // [...args]
Sintaxe.TIPO_FUNCAO = 5 // [nome, ...args]
Sintaxe.TIPO_DERIVADA = 6 // {valor: }
Sintaxe.TIPO_VETOR = 7 // [...args]
Sintaxe.TIPO_EQUACAO = 8 // [eq]
Sintaxe.TIPO_LISTA = 9 // [...args]

/*

Funções de apoio

*/

// Infla um vetor e suas expressões subsequentes
// "1 2, 3 'X+1'" => ["1", "2", "3", ["X+1"]]
// Se houver algum desbalanceamento, lança uma exceção
Sintaxe.inflar = function (str) {
	var i, len, c, retorno, nivelAtual, cache, equacao, novo, temp
	
	len = str.length
	cache = ""
	retorno = []
	retorno.tipo = Sintaxe.TIPO_LISTA
	retorno.pai = null
	nivelAtual = retorno
	equacao = false // Indica se está dentro de uma equação
	
	var salvarCache = function () {
		if (cache.length) {
			nivelAtual.push(cache)
			cache = ""
		}
	}
	
	for (i=0; i<len; i++) {
		c = str[i]
		if ((c == " " || c == ",") && !equacao) {
			// " " e "," separam elementos do vetor
			salvarCache()
		} else if (c == "'") {
			// Entra ou sai de uma equação
			if (equacao) {
				nivelAtual.push(Sintaxe.inflarEquacao(cache))
				cache = ""
			}
			equacao = !equacao
		} else if ((c == "[" || c == "{") && !equacao) {
			// Inicia um novo vetor
			salvarCache()
			novo = []
			novo.pai = nivelAtual
			novo.tipo = c=="[" ? Sintaxe.TIPO_VETOR : Sintaxe.TIPO_LISTA
			nivelAtual.push(novo)
			nivelAtual = novo
		} else if ((c == "]" || c == "}") && !equacao) {
			// Finaliza um nível de vetor
			salvarCache()
			if (nivelAtual.pai && nivelAtual.tipo == (c=="]" ? Sintaxe.TIPO_VETOR : Sintaxe.TIPO_LISTA)) {
				temp = nivelAtual
				nivelAtual = nivelAtual.pai
				delete temp.pai
			} else
				throw _("erroSintaxe_fimListaVetorInesperado")
		} else
			cache += c
	}
	salvarCache()
	
	if (nivelAtual.pai == null && i == len && !equacao) {
		delete nivelAtual.pai
		return retorno
	}
	throw _("erroSintaxe_desbalanceamento")
}

// Infla uma string nos parênteses
// "a^(b*(c+d)-e)+f" => ["a^", ["b*", ["c+d"], "-e"], "+f"]
// Se houver desbalanceamento de parênteses, lança uma exceção
Sintaxe.inflarEquacao = function (str) {
	var i, len, c, retorno, cache, novo, temp, niveis
	
	len = str.length
	retorno = []
	retorno.tipo = Sintaxe.TIPO_EQUACAO
	cache = ""
	niveis = [retorno]
	
	var salvarCache = function () {
		if (cache.length) {
			niveis[niveis.length-1].push(cache)
			cache = ""
		}
	}
	
	// Extrai os diferentes níveis de parênteses
	for (i=0; i<len; i++) {
		c = str[i]
		if (c == "(") {
			salvarCache()
			novo = [[]]
			niveis[niveis.length-1].push(novo)
			novo.tipo = Sintaxe.TIPO_PARENTESES
			niveis.push(novo)
			niveis.push(novo[0])
		} else if (c == ")") {
			salvarCache()
			if (niveis.length < 3)
				throw _("erroSintaxe_fimParentesesInesperado")
			niveis.pop()
			niveis.pop()
		} else if (c == ",") {
			salvarCache()
			novo = []
			if (niveis.length < 3)
				throw _("erroSintaxe_equacao")
			niveis.pop()
			niveis[niveis.length-1].push(novo)
			niveis.push(novo)
		} else if (c == " ")
			salvarCache()
		else
			cache += c
	}
	salvarCache()
	
	if (niveis.length != 1)
		throw _("erroSintaxe_desbalanceamentoEquacao")
	return retorno
}

// Separa operadores, variáveis e números de uma string
// Retorna uma array com objetos com as propriedades valor (string) e tipo (Sintaxe.TIPO_*)
// Lança uma exceção em caso de erro
Sintaxe.separar = function (str) {
	var i, sub, partes = [], backup = str
	
	for (i=str.length; i>0; i--) {
		sub = str.substr(0, i)
		if (sub.match(/^∂[A-Za-zΣ▶π∞α→←↓↑γδεηθλρστωΔΠΩµß][A-Za-z0-9Σ▶π∞α→←↓↑γδεηθλρστωΔΠΩµß]*$/)) {
			partes.push({valor: sub, tipo: Sintaxe.TIPO_DERIVADA})
			str = str.substr(i)
			i = str.length+1
		} else if (["+", "-", "*", "/", "^", "!", "=", "<", "\u2264", ">", "\u2265", "\u2260", "==", "\u221A"].indexOf(sub) != -1) {
			partes.push({valor: sub, tipo: Sintaxe.TIPO_OPERADOR})
			str = str.substr(i)
			i = str.length+1
		} else if (sub.match(/^[$%&?A-Za-z~Σ▶π∞α→←↓↑γδεηθλρστωΔΠΩµß∫][$%&0-9?A-Za-z~Σ▶π∞α→←↓↑γδεηθλρστωΔΠΩµß]*$/)) {
			partes.push({valor: sub, tipo: Sintaxe.TIPO_VARIAVEL})
			str = str.substr(i)
			i = str.length+1
		} else if (sub.match(/^\d*(\.\d*)?(E[+-]?\d+)?$/)) {
			partes.push({valor: sub, tipo: Sintaxe.TIPO_NUMERO})
			str = str.substr(i)
			i = str.length+1
		}
	}
	
	if (str != "")
		throw _("erroSintaxe_trechoIncorreto", backup)
	
	return partes
}

// Interpreta uma estrutura já inflada
Sintaxe.interpretar = function (estrutura) {
	var i
	
	for (i=0; i<estrutura.length; i++) {
		if (estrutura[i].tipo == Sintaxe.TIPO_VETOR || estrutura[i].tipo == Sintaxe.TIPO_LISTA)
			Sintaxe.interpretar(estrutura[i])
		else if (estrutura[i].tipo == Sintaxe.TIPO_EQUACAO)
			Sintaxe.interpretarEquacao(estrutura[i])
		else if (estrutura[i].match(/^\d*(\.\d*)?(E[+-]?\d+)?$/))
			estrutura[i] = {valor: estrutura[i], tipo: Sintaxe.TIPO_NUMERO}
		else if (estrutura[i].match(/^[$%&?A-Za-z~Σ▶πα→←↓↑γδεηθλρστωΔΠΩµß][$%&0-9?A-Za-z~Σ▶πα→←↓↑γδεηθλρστωΔΠΩµß]*$/))
			estrutura[i] = {valor: estrutura[i], tipo: Sintaxe.TIPO_VARIAVEL}
		else
			throw _("erroSintaxe_itemInvalido", estrutura[i])
	}
}

// Interpreta uma estrutura de equação já inflada
Sintaxe.interpretarEquacao = function (estrutura) {
	var i, el, len, j, args, elAntes, elDepois, valor
	
	// Faz uma expansão básica
	for (i=0; i<estrutura.length; i++) {
		el = estrutura[i]
		if (typeof el == "string") {
			args = [i, 1].concat(Sintaxe.separar(el))
			;[].splice.apply(estrutura, args)
			i += args.length-3
		} else
			for (j=0; j<el.length; j++) {
				Sintaxe.interpretarEquacao(el[j])
				if (el[j].length)
					el[j] = el[j][0]
				else if (el.length != 1)
					// Só pode haver itens vazios quando ele é o único
					throw _("erroSintaxe_equacao")
			}
	}
	
	// Transforma variável seguido de parênteses em função
	// Também valida derivadas
	for (i=0; i<estrutura.length; i++) {
		el = estrutura[i]
		elDepois = estrutura[i+1]
		if (el.tipo == Sintaxe.TIPO_DERIVADA)
			if (elDepois && elDepois.tipo == Sintaxe.TIPO_PARENTESES && elDepois.length == 1) {
				valor = [el.valor].concat(elDepois)
				valor.tipo = Sintaxe.TIPO_FUNCAO
				estrutura.splice(i, 2, valor)
			} else
				throw _("erroSintaxe_derivada")
		else if (el.tipo == Sintaxe.TIPO_VARIAVEL && elDepois && elDepois.tipo == Sintaxe.TIPO_PARENTESES) {
			valor = [el.valor].concat(elDepois)
			valor.tipo = Sintaxe.TIPO_FUNCAO
			estrutura.splice(i, 2, valor)
		}
	}
	
	var aplicarUnarios = function (ops, sentido) {
		var temp
		for (i=0; i<estrutura.length; i++) {
			j = sentido==1 ? i : estrutura.length-i-1
			el = estrutura[j]
			elAntes = j==0 ? null : estrutura[j-1]
			elDepois = j==estrutura.length-1 ? null : estrutura[j+1]
			if (sentido == -1) {
				temp = elDepois
				elDepois = elAntes
				elAntes = temp
			}
			if (el.tipo == Sintaxe.TIPO_OPERADOR && ops.indexOf(el.valor) != -1) {
				if (elAntes && elAntes.tipo != Sintaxe.TIPO_OPERADOR && (elDepois == null || elDepois.tipo == Sintaxe.TIPO_OPERADOR)) {
					valor = [el.valor, elAntes]
					valor.tipo = Sintaxe.TIPO_FUNCAO
					estrutura.splice(sentido==1 ? j-1 : j, 2, valor)
					i--
				}
			}
		}
	}
	
	var aplicarBinarios = function (ops, sentido) {
		for (i=0; i<estrutura.length; i++) {
			j = sentido==1 ? i : estrutura.length-i-1
			el = estrutura[j]
			elAntes = j==0 ? null : estrutura[j-1]
			elDepois = j==estrutura.length-1 ? null : estrutura[j+1]
			if (el.tipo == Sintaxe.TIPO_OPERADOR && ops.indexOf(el.valor) != -1) {
				if (elAntes && elAntes.tipo != Sintaxe.TIPO_OPERADOR && elDepois && elDepois.tipo != Sintaxe.TIPO_OPERADOR) {
					valor = [el.valor, elAntes, elDepois]
					valor.tipo = Sintaxe.TIPO_FUNCAO
					estrutura.splice(j-1, 3, valor)
					i--
				} else
					throw _("erroSintaxe_operador", el.valor)
			}
		}
	}
	
	// Aplica os operadores ordem de precedência
	aplicarUnarios(["!"], 1)
	aplicarUnarios(["+", "-", "\u221A"], -1)
	aplicarBinarios(["^"], -1)
	aplicarBinarios(["*", "/"], 1)
	aplicarBinarios(["+", "-"], 1)
	aplicarBinarios(["<", "\u2264", ">", "\u2265"], 1)
	aplicarBinarios(["==", "\u2260"], 1)
	aplicarBinarios(["="], -1)
	
	if (estrutura.length > 1 || (estrutura.length == 1 && estrutura[0].tipo == Sintaxe.TIPO_OPERADOR))
		throw _("erroSintaxe_equacao")
}

// Valida regras específicas da estrutura, como não permitir 'A=B=C', 'i(x)' e matrizes não retangulares
// Lança uma exceção em caso de erro
Sintaxe.validarEstrutura = function (estrutura) {
	var validarEquacao = function (el, raiz) {
		var i
		switch (el.tipo) {
		case Sintaxe.TIPO_EQUACAO:
			if (el.length)
				validarEquacao(el[0], true)
			break
		case Sintaxe.TIPO_FUNCAO:
			if (el[0] == "=") {
				// Valida expressões com =
				if (!raiz)
					throw _("erroSintaxe_operadorIgual")
			} else if (el[0] == "\u222B") {
				// Valida integrais
				if (el.length != 5 || el[4].tipo != Sintaxe.TIPO_VARIAVEL)
					throw _("erroSintaxe_integral")
			} else if (el[0] == "\u03A3") {
				// Valida somatórios
				if (el.length != 4
					|| el[1].tipo != Sintaxe.TIPO_FUNCAO
					|| el[1][0] != "="
					|| el[1].length != 3
					|| el[1][1].tipo != Sintaxe.TIPO_VARIAVEL)
					throw _("erroSintaxe_somatorio")
				
				// Evita de entrar encontrar problema com o "=" no primeiro argumento
				validarEquacao(el[1][2], false)
				validarEquacao(el[2], false)
				validarEquacao(el[3], false)
				return
			} else if (el[0] == "i" || el[0] == "e")
				throw _("erroSintaxe_nomeFuncao", el[0])
			for (i=1; i<el.length; i++)
				validarEquacao(el[i], false)
			break
		case Sintaxe.TIPO_PARENTESES:
			if (el.length != 1 && el.length != 2)
				throw _("erroSintaxe_parenteses")
			for (i=0; i<el.length; i++)
				validarEquacao(el[i], false)
			break
		}
	}
	
	var validarVetor = function (vetor, raiz) {
		var i, el, matriz, colunas
		
		// Não pode vetor vazio
		if (vetor.length == 0)
			throw _("erroSintaxe_vetorVazio")
		
		// Verifica se é um vetor simples ou uma matriz
		matriz = vetor[0].tipo == Sintaxe.TIPO_VETOR
		colunas = matriz ? vetor[0].length : 0
		if (matriz && !raiz)
			// Não pode uma matriz dentro da outra
			throw _("erroSintaxe_subMatriz")
		
		for (i=0; i<vetor.length; i++) {
			el = vetor[i]
			if (matriz) {
				if (el.tipo != Sintaxe.TIPO_VETOR || el.length != colunas)
					// Todos os elementos de uma matriz devem ser vetores do mesmo tamanho
					throw _("erroSintaxe_tamanhoMatriz")
				validarVetor(el, false)
			} else if (el.tipo == Sintaxe.TIPO_EQUACAO)
				// Todos os elementos de um vetor não matriz devem ser equação ou número
				validarEquacao(el)
			else if (el.tipo != Sintaxe.TIPO_NUMERO)
				throw _("erroSintaxe_elementoInvalido")
		}
	}
	
	var validarLista = function (lista) {
		var i
		// Simplesmente valida todas as entradas
		for (i=0; i<lista.length; i++)
			Sintaxe.validarEstrutura(lista[i])
	}
	
	switch (estrutura.tipo) {
	case Sintaxe.TIPO_EQUACAO:
		validarEquacao(estrutura)
		break
	case Sintaxe.TIPO_VETOR:
		validarVetor(estrutura, true)
		break
	case Sintaxe.TIPO_LISTA:
		validarLista(estrutura)
		break
	default:
		// OK
	}
}
