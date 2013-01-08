// Controla a reação da interface no movimento de reordenar um grupo de divs
// Recebe a div que contêm imediatamente as divs a serem ordenadas
// Executa a função ontrocar quando uma troca foi realizado pelo usuário
// Envia a posição inicial e final do elemento trocado
var Ordenavel = function (div, ontrocar) {
	div = get(div)
	div.addEventListener("mousedown", Ordenavel.comecar(this))
	addEventListener("mousemove", Ordenavel.movimentar(this))
	addEventListener("mouseup", Ordenavel.terminar(this))
	this.raiz = div
	this.dados = null // Armazena os dados da movimentação sendo feita
	this.ontrocar = ontrocar
}

// Indica um possível começo da movimentação (ouvinte de mousedown)
Ordenavel.comecar = function (that) {
	return function (evento) {
		var alvo
		alvo = Ordenavel.getAcima(evento.target, that.raiz)
		if (alvo) {
			that.dados = {}
			that.dados.el = alvo
			that.dados.DY = Ordenavel.getHeight(alvo)
			that.dados.elY = Ordenavel.getY(alvo)
			that.dados.posIni = [].indexOf.call(that.raiz.childNodes, alvo)
			that.dados.posFim = that.dados.posIni
			evento.preventDefault()
		}
	}
}

// Controla uma possível movimentação da div (ouvinte de mousemove)
Ordenavel.movimentar = function (that) {
	return function (evento) {
		var y, dy, min, max, dados = that.dados
		if (dados) {
			dy = evento.clientY-dados.elY
			
			// Move o elemento se necessário
			if (dy > dados.DY) {
				// Move para a linha de baixo
				if (dados.el.nextSibling) {
					that.raiz.insertBefore(dados.el, dados.el.nextSibling.nextSibling)
					dados.elY += dados.DY
					dy -= dados.DY
					dados.posFim++
				}
			} else if (dy < -dados.DY) {
				// Move para a linha de cima
				if (dados.el.previousSibling) {
					that.raiz.insertBefore(dados.el, dados.el.previousSibling)
					dados.elY -= dados.DY
					dy += dados.DY
					dados.posFim--
				}
			}
			
			// Desenha o elemento numa posição "imaginária"
			dados.el.style.zIndex = "2"
			dados.el.style.position = "relative"
			min = dados.posFim==0 ? -dados.DY/3 : -dados.DY
			max = dados.posFim==that.raiz.childNodes.length-1 ? dados.DY/3 : dados.DY
			dados.el.style.top = Math.min(max, Math.max(min, dy))+"px"
		}
	}
}

// Controla um possível soltar no lugar certo (ouvinte de mouseup)
Ordenavel.terminar = function (that) {
	return function (evento) {
		if (that.dados) {
			that.dados.el.style.zIndex = ""
			that.dados.el.style.position = ""
			that.dados.el.style.top = ""
			if (that.dados.posIni != that.dados.posFim)
				that.ontrocar(that.dados.posIni, that.dados.posFim)
		}
		that.dados = null
	}
}

// Retorna o elemento imediatamente abaixo da raiz e acima da referência
// Ou null caso não exista
Ordenavel.getAcima = function (referencia, raiz) {
	if (referencia == raiz)
		// Short-cut comum
		return
	
	// Vai subindo a partir da referência até achar
	while (referencia.parentNode) {
		if (referencia.parentNode == raiz)
			return referencia
		referencia = referencia.parentNode
	}
	
	// Nada encontrado
	return null
}

// Retorna a posição X do elemento
// lado: -1 = esquerda, 0 (padrão) = centro, 1 = direita
Ordenavel.getX = function (el, lado) {
	if (lado == -1)
		return el.getBoundingClientRect().left
	else if (lado == 1)
		return el.getBoundingClientRect().right
	return (el.getBoundingClientRect().left+el.getBoundingClientRect().right)/2
}

// Retorna a posição Y do elemento
// lado: -1 = topo, 0 (padrão) = centro, 1 = base
Ordenavel.getY = function (el, lado) {
	if (lado == -1)
		return el.getBoundingClientRect().top
	else if (lado == 1)
		return el.getBoundingClientRect().bottom
	return (el.getBoundingClientRect().top+el.getBoundingClientRect().bottom)/2
}

// Retorna largura total do elemento
Ordenavel.getWidth = function (el) {
	return el.getBoundingClientRect().width
}

// Retorna altura total do elemento
Ordenavel.getHeight = function (el) {
	return el.getBoundingClientRect().height
}
