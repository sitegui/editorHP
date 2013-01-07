// Transcompila imagens e aplica filtros em paralelo

// Aplica um filtro na imagem
// dados deve conter os índices "pixels", "filtro", "ajuste", "id"
onmessage = function (evento) {
	removerAlpha(evento.data.pixels)
	
	if (evento.data.filtro == "areas")
		aplicarFiltroAreas(evento.data.pixels, evento.data.ajuste)
	else
		aplicarFiltroBasico(evento.data.pixels, evento.data.ajuste)
	
	self.postMessage({id: evento.data.id, pixels: evento.data.pixels})
}

// Remove o efeito da transparência
function removerAlpha(pixels) {
	var i, alpha, len = pixels.data.length/4
	for (i=0; i<len; i++) {
		alpha = pixels.data[4*i+3]
		pixels.data[4*i] = 255-alpha+alpha*pixels.data[4*i]/255
		pixels.data[4*i+1] = 255-alpha+alpha*pixels.data[4*i+1]/255
		pixels.data[4*i+2] = 255-alpha+alpha*pixels.data[4*i+2]/255
		pixels.data[4*i+3] = 255
	}
}

// Aplica o filtro básico
function aplicarFiltroBasico(pixels, ajuste) {
	var i, media = 0, len = pixels.data.length/4
	
	// Calcula a média de cores
	for (i=0; i<len; i++)
		media += pixels.data[4*i]+pixels.data[4*i+1]+pixels.data[4*i+2]
	media /= len
	
	// Ajusta a média
	if (ajuste < 0)
		media = media+media/100*ajuste
	else
		media = media+(3*255-media)/100*ajuste
	
	// Troca para preto ou branco
	for (i=0; i<len; i++) {
		if (pixels.data[4*i]+pixels.data[4*i+1]+pixels.data[4*i+2] > media)
			pixels.data[4*i+3] = 0
		else
			pixels.data[4*i+3] = 255
		pixels.data[4*i] = pixels.data[4*i+1] = pixels.data[4*i+2] = 0
	}
}

// Calcula a relação do erro em função do ajuste (para o filtro de áreas)
// erro(x) = a+b*e^(c*x), erro(-100) = 0, erro(0) = k, erro(100) = 255*sqrt(3)
var calcularErro = (function () {
	var a, b, c, k
	
	k = 50
	a = -k*k/(255*Math.sqrt(3)-2*k)
	b = k*(255*Math.sqrt(3)-k)/(255*Math.sqrt(3)-2*k)
	c = (Math.log(255*Math.sqrt(3)-k)-Math.log(k))/100
	
	return function (ajuste) {
		return a+b*Math.exp(c*ajuste)
	}
})()

// Aplica o filtro de áreas
function aplicarFiltroAreas(pixels, ajuste) {
	var len, areas, cores, i, id, ultimo, unicos, vizinhos, erro, encontrou, pontos, x, y
	
	// Guarda a soma das cores e a média da área sendo processada
	var r, g, b, mr, mg, mb
	
	// Guarda a soma das cores de pixels isolados
	var r1p, g1p, b1p
	
	// Retorna a distância a cor do pixel e a média da área
	var dist = function (i) {
		var dr, dg, db
		dr = pixels.data[4*i]-mr
		dg = pixels.data[4*i+1]-mg
		db = pixels.data[4*i+2]-mb
		return Math.sqrt(dr*dr+dg*dg+db*db)
	}
	
	// Pinta os pontos dados com a proporção correta de preto
	var pintar = function (pontos) {
		var i, cor, proporcao, pretos
		cor = (mr+mg+mb)/3
		proporcao = 1-cor/255
		pretos = 0
		for (i=0; i<pontos.length; i++) {
			if (pretos/i > proporcao)
				cor = 0
			else {
				cor = 255
				pretos++
			}
			pixels.data[4*pontos[i]] = pixels.data[4*pontos[i]+1] = pixels.data[4*pontos[i]+2] = 0
			pixels.data[4*pontos[i]+3] = cor
		}
	}
	
	// Inicializa o vetor de áreas
	len = pixels.data.length/4
	areas = new Array(len)
	cores = new Array(len)
	for (i=0; i<len; i++) {
		areas[i] = 0
		cores[i] = 256*256*pixels.data[4*i]+256*pixels.data[4*i+1]+pixels.data[4*i+2]
	}
	
	// Delimita áreas até não poder mais
	id = 1
	ultimo = -1
	unicos = []
	vizinhos = []
	r1p = g1p = b1p = 0
	erro = calcularErro(ajuste)
	while (true) {
		encontrou = false
		pontos = []
		r = g = b = 0
		
		// Encontra um pixel livre
		for (ultimo++; ultimo<len; ultimo++)
			if (areas[ultimo] == 0) {
				encontrou = true
				break
			}
		if (!encontrou)
			break
		
		// Inicializa a área com pixels da mesma cor
		for (i=ultimo; i<len; i++)
			if (areas[i] == 0 && cores[i] == cores[ultimo]) {
				vizinhos.push(i)
				areas[i] = id
			}
		
		// Vai trabalhando com os vizinhos
		while (vizinhos.length) {
			// Pega o ponto e marca
			i = vizinhos.pop()
			pontos.push(i)
			x = i%pixels.width
			y = Math.floor(i/pixels.width)
			areas[i] = id
			r += pixels.data[4*i]
			g += pixels.data[4*i+1]
			b += pixels.data[4*i+2]
			mr = r/pontos.length
			mg = g/pontos.length
			mb = b/pontos.length
			
			// Pega os vizinhos válidos
			if (y>0 && areas[i-pixels.width] == 0 && dist(i-pixels.width) < erro)
				vizinhos.push(i-pixels.width)
			if (x<pixels.width-1 && areas[i+1] == 0 && dist(i+1) < erro)
				vizinhos.push(i+1)
			if (y<pixels.height-1 && areas[i+pixels.width] == 0 && dist(i+pixels.width) < erro)
				vizinhos.push(i+pixels.width)
			if (x>0 && areas[i-1] == 0 && dist(i-1) < erro)
				vizinhos.push(i-1)
		}
		
		// Pinta os pixels da área
		// Ignora áreas com poucos pixels
		if (pontos.length < 5) {
			for (i=0; i<pontos.length; i++)
				unicos.push(pontos[i])
			r1p += r
			g1p += g
			b1p += b
		} else {
			pintar(pontos)
			id++
		}
	}
	
	// Reúne a área de pixels isolados
	mr = r1p/unicos.length
	mg = g1p/unicos.length
	mb = b1p/unicos.length
	pintar(unicos)
}
