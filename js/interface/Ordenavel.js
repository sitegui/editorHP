// Controla a reação da interface no movimento de reordenar um grupo de divs
// Recebe a div que contêm imediatamente as divs a serem ordenadas
// Executa a função ontrocar quando uma troca foi realizado pelo usuário
// Envia a posição inicial e final do elemento trocado
// oninicar(el) e onfinalizar(el) são chamadas quando a movimentação efetivamente começa ou termina (opcionais)
var Ordenavel = function (div, ontrocar, oniniciar, onfinalizar) {
	var movimentar = Ordenavel.movimentar(this)
	div = get(div)
	div.addEventListener("mousedown", Ordenavel.comecar(this))
	div.addEventListener("scroll", movimentar)
	addEventListener("mousemove", movimentar)
	addEventListener("mouseup", Ordenavel.terminar(this))
	this.raiz = div
	this.dados = null // Armazena os dados da movimentação sendo feita
	this.ontrocar = ontrocar
	this.oniniciar = oniniciar || null
	this.onfinalizar = onfinalizar || null
	this.indices = false // Indice se é o caso especial de índice
}

// Indica um possível começo da movimentação (ouvinte de mousedown)
Ordenavel.comecar = function (that) {
	return function (evento) {
		var alvo
		alvo = Ordenavel.getAcima(evento.target, that.raiz)
		if (alvo) {
			that.dados = {}
			that.dados.el = alvo
			that.dados.iniciado = false
			that.dados.mX = evento.clientX
			that.dados.mY = evento.clientY
		}
	}
}

// Atualiza o nível máximo de identação que um índice pode ter
Ordenavel.prototype.atualizarNivelMaximo = function () {
	if (this.dados.iniciado && this.indices)
		if (this.dados.posFim)
			this.dados.nivelMax = Number(this.raiz.childNodes.item(this.dados.posFim-1).dataset.nivel)+1
		else
			this.dados.nivelMax = 1
}

// Controla uma possível movimentação da div (ouvinte de mousemove)
Ordenavel.movimentar = function (that) {
	return function (evento) {
		var y, dx, dy, dist, min, max, px, dados = that.dados
		
		if (dados) {
			// Inica o movimento
			if (!dados.iniciado) {
				dx = evento.clientX-dados.mX
				dy = evento.clientY-dados.mY
				dist = Math.sqrt(dx*dx+dy*dy)
				if (dist < 15)
					// Sensibilidade mínima
					return
				if (that.oniniciar)
					that.oniniciar(dados.el)
				dados.posIni = [].indexOf.call(that.raiz.childNodes, dados.el)
				dados.posFim = dados.posIni
				dados.DY = Ordenavel.getHeight(dados.el)
				dados.elY = Ordenavel.getY(dados.el)+that.raiz.scrollTop
				dados.iniciado = true
				dados.minY = Ordenavel.getY(that.raiz, -1)
				dados.maxY = Ordenavel.getY(that.raiz, 1)
				dados.minX = Ordenavel.getX(that.raiz, -1)
				dados.maxX = Ordenavel.getX(that.raiz, 1)
				dados.nivelIni = dados.el.dataset.nivel
				that.atualizarNivelMaximo()
			}
			
			dados.mY = evento.clientY || dados.mY
			dados.mX = evento.clientX || dados.mX
			dy = dados.mY-(dados.elY-that.raiz.scrollTop)
			
			while (true) { // Relaxa, tem um break no else
				// Move o elemento se necessário
				if (dy > dados.DY && dados.el.nextSibling) {
					// Move para a linha de baixo
					that.raiz.insertBefore(dados.el, dados.el.nextSibling.nextSibling)
					dados.elY += dados.DY
					dy -= dados.DY
					dados.posFim++
					that.atualizarNivelMaximo()
				} else if (dy < -dados.DY && dados.el.previousSibling) {
					// Move para a linha de cima
					that.raiz.insertBefore(dados.el, dados.el.previousSibling)
					dados.elY -= dados.DY
					dy += dados.DY
					dados.posFim--
					that.atualizarNivelMaximo()
				} else
					break
			}
			
			// Desenha o elemento numa posição "imaginária"
			dados.el.style.zIndex = "2"
			dados.el.style.position = "relative"
			min = dados.posFim==0 ? -dados.DY/3 : -dados.DY
			max = dados.posFim==that.raiz.childNodes.length-1 ? dados.DY/3 : dados.DY
			dados.el.style.top = Math.min(max, Math.max(min, dy))+"px"
			
			if (that.indices) {
				// Define a posição x (0 = lado esquerdo do pai, 100 = lado direito do pai)
				px = 100*(dados.maxX-dados.mX)/(dados.maxX-dados.minX)
				dados.el.className = "indice1"
				dados.el.dataset.nivel = "1"
				if (px < 40 && dados.nivelMax > 4) {
					dados.el.className = "indice5"
					dados.el.dataset.nivel = "5"
				} else if (px < 55 && dados.nivelMax > 3) {
					dados.el.className = "indice4"
					dados.el.dataset.nivel = "4"
				} else if (px < 70 && dados.nivelMax > 2) {
					dados.el.className = "indice3"
					dados.el.dataset.nivel = "3"
				} else if (px < 85 && dados.nivelMax > 1) {
					dados.el.className = "indice2"
					dados.el.dataset.nivel = "2"
				}
			}
			
			// Rola o elemento pai se necessário
			if (dados.maxY-dados.mY < dados.DY/2+15)
				setTimeout(function () {
					that.raiz.scrollTop += 3
				}, 25)
			else if (dados.mY-dados.minY < dados.DY/2+15)
				setTimeout(function () {
					that.raiz.scrollTop -= 3
				}, 25)
		}
	}
}

// Controla um possível soltar no lugar certo (ouvinte de mouseup)
Ordenavel.terminar = function (that) {
	return function (evento) {
		if (that.dados && that.dados.iniciado) {
			if (that.onfinalizar)
				that.onfinalizar(that.dados.el)
			that.dados.el.style.zIndex = ""
			that.dados.el.style.position = ""
			that.dados.el.style.top = ""
			if (that.dados.posIni != that.dados.posFim
				|| (that.indices && that.dados.el.dataset.nivel != that.dados.nivelIni))
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

// Retorna altura total do elemento
Ordenavel.getHeight = function (el) {
	var mt = parseFloat(getComputedStyle(el).marginTop)
	var mb = parseFloat(getComputedStyle(el).marginBottom)
	return el.getBoundingClientRect().height+(mt+mb)/2
}
