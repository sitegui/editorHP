# Editor para HP50g

Esse é um editor de texto para a calculadora HP50g feito em HTML, CSS e JS que funciona em FF 15+, Chrome.
Ele gera um arquivo binário que pode ser salvo diretamente no cartão de memória SD ou passado por cabo por meio do programa oficial da HP.
Não é preciso ter nada instalado na calculadora, além de que o arquivo pode ser aberto e editado novamente.

Em breve colocarei o editor no meu site, para facilitar o acesso.

Cada arquivo de texto (chamado livro) é baseado em páginas, que contém textos (cabeçalhos e parágrafos), equações e imagens.
O acesso a essas páginas é feito por meio de um índice. Além disso é possível anexar objetos (como equações, matrizes, fórmulas, gráficos) ao livro.
O editor automaticamente divide seu texto em páginas e cria os índices para facilitar a navegação na calculadora.

O arquivo exportado (.hp) é composto pelo livro e pelo leitor. Quando aberto na calculadora, o programa lê e compila o livro para o formato final exibido na HP.

# Estrutura do código

* root: contém os arquivos básicos: HTML; PHP para reunir todo o CSS e JS; PHP pra up/download dos livros; leitor compilado do livro pra HP
* css: contém todos os arquivos .css do projeto
* doc: contém a documentação geral do projeto (especificação do formato do livro exportado)
* img: contém as imagens usadas no HTML e CSS
* js/dados: contém todos os arquivos que lidam com os dados do livro, tanto para guarda-los quanto processa-los. CompiladorParalelo-worker roda numa thread paralela (WebWorker)
* js/interface: contém todos os arquivos que lidam diretamente com a interface e interação do usuário
* lang: contém os arquivos com os textos da interface traduzidos em várias línguas. Cada idioma tem dois arquivo (PHP para conteúdo estático e JS para dinâmico)
* src-hp: contém todo o código do leitor responsável por exibir o livro na calculadora. COMPILADO.txt é todo esse código reunido

# Licença

Esse programa é licenciado sob GNU GENERAL PUBLIC LICENSE
Copyright 2013 Guilherme de Oliveira Souza
