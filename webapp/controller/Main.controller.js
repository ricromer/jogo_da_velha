sap.ui.define([
    "sap/ui/core/mvc/Controller" ,
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("jogovelha.controller.Main", {
            onInit: function () {

                this.vez = 'X' ;

                // Matriz de possibilidade de vitorias
                this.vitorias_possiveis = [
                    [1,2,3], [4,5,6], [7,8,9],
                    [1,4,7], [2,5,8], [3,6,9],
                    [1,5,9], [3,5,7] 
                ] ;

            },

            onClickCasa: function (oEvent) {
                // obter o objeto clicado, todo comando é finalizado por ponto-e-vingula(;)
                let casa = oEvent.getSource();
                // obter imagem atual
                let imagem = casa.getSrc();

                // verifica se imagem é Branco
                if (imagem == "../img/branco.png") {

                    // comando para adicionar imagem
                    casa.setSrc("../img/" + this.vez + ".png");

                    // logica para verificar o ganhador
                    // desvio condicional
                    if (this.temVencedor() == true) {
                        // alert("o jogador " + this.vez + " ganhou !!!");
                        MessageBox.success("o jogador " + this.vez + " ganhou !!!");
                    }

                    if (this.vez == 'X') {
                        this.vez = "0" ;

                        //chamar função de jogada do computador
                        this.jogadaComputador() ;

                    } else {
                        this.vez = "X" ;
                    }

                }

            } ,

                // simbolo que representa OU no IF --> ||
                temVencedor: function () {
                    if (this.casasIguais(1, 2, 3) || this.casasIguais(4, 5, 6) || this.casasIguais(7, 8, 9) ||
                        this.casasIguais(1, 4, 7) || this.casasIguais(2, 5, 8) || this.casasIguais(3, 6, 9) ||
                        this.casasIguais(1, 5, 9) || this.casasIguais(3, 5, 6)) {
                        return true;
                    }
                } ,

                casasIguais: function (a, b, c) {
                    // obtenho objetos da tela
                    let casaA = this.byId("casa" + a);
                    let casaB = this.byId("casa" + b);
                    let casaC = this.byId("casa" + c);

                    // obtenho imagens da tela
                    let imgA = casaA.getSrc();
                    let imgB = casaB.getSrc();
                    let imgC = casaC.getSrc();

                    // verificação se imagens são iguais 
                    // desvio condicional através de IF
                    // simbolo que representa E no IF --> &&
                    if ((imgA == imgB) && (imgB == imgC) && (imgA !== "../img/branco.png")) {
                        return true;
                    }

                } ,

                jogadaComputador: function () {

                    // definir parametros iniciais (Pontuação)
                    // lista de Pontos para jogadores X e 0
                    let listaPontosX = [ ] ;
                    let listaPontos0 = [ ] ;

                    // lista de jogadas possiveis
                    let jogadaInicial = [ ] ;     // inicio de jogo
                    let jogadaVitoria = [ ] ;     // vitoria certa
                    let jogadaRisco = [ ] ;       // risco de perder
                    let tentativa_vitoria = [ ];  // aumenta chance de vitoria

                    // Calculo da possibilidade de vitoria
                    // LOOP em cada possibilidade de vitoria
                    this.vitorias_possiveis.forEach( (combinacao) => {
                        // zera pontos iniciais
                        let pontosX = 0 ;
                        let pontos0 = 0 ;
                        //debugger 

                        // dentro das vitorias possiveis, fazer LOOP para verificar cada combinação da casa
                        combinacao.forEach ( (posicao) = > {
                            let casa = this.byId("casa" + posicao) ;
                            let img = casa.getSrc() ;
                            // dar pontuação de acordo com quem joga
                            if ( img == '../img/X.png') pontosX++ ;
                            if ( img == '../img/0.png') pontos0++ ;
                        } ) ;

                        // atribui pontos para as possiveis vitorias
                        listaPontosX.push (pontosX) ;
                        listaPontos0.push (pontos0) ;

                    }
                    ) ;

                    // jogar com base na maior pontuação (ou maior prioridade de vencer)
                    // para cada possibilidade de vitoria do jogador 0 , ver quantos pontos o jogador X tem na mesma combinaçao
                    // LOOP na lista de pontos do jogador 0

                    listaPontos0.forEach( (posicao, index) => {
                        // ver quantos pontos o jogador 0 tem
                        switch (posicao) {
                            case 0: // menor pontuacao
                            // ver se jogador X tem 2 pontos 
                                if(listaPontosX[index] == 2) {
                                    jogadaRisco.push(this.vitorias_possiveis[index]);
                                } else if(listaPontosX[index] == 1) {
                                jogadaInicial.push(this.vitorias_possiveis[index]);
                                } break ;

                            case 1: // jogada neutra
                                if(listaPontosX[index] == 1) {
                                    jogadaInicial.push(this.vitorias_possiveis[index]);
                                } else if(listaPontosX[index] == 0) {
                                    tentativa_vitoria.push(this.vitorias_possiveis[index]) ;
                                } break ;  

                            case 2: // vitoria mais certa
                                if(listaPontosX[index] == 0) {
                                    jogadaVitoria.push(this.vitorias_possiveis[index]);
                                }
                        }        
                    } ) ;

                    // debugger

                    // Jogar mna combinacao de maior probabilidade de vitoria
                    if (jogadaVitoria.lenght > 0) {
                        // jogar nas combinacoes de vitoria
                        this.jogadaIA(jogadaVitoria);    

                    } else if (jogadaRisco.lenght > 0) {
                        // jogar onde posso perder
                        this.jogadaIA(jogadaRisco);    

                    } else if (tentativa_vitoria.lenght > 0) {
                        // jogar onde posso ganhar
                        this.jogadaIA(tentativa_vitoria);    
                        
                    } else if (jogadaInicial.lenght > 0) {
                        // jogada neutra
                        this.jogadaIA(jogadaInicial);    
                    } 

                } 

                jogadaIA: function (dados) {
                    // separar numero de casas que posso jogar
                    let numeros = [] ;

                    // verificar se posicao permite ser jogada e se esta vazia 
                    // LOOP nas combinacoes para ver se está vazia
                    dados.forEach( (combinacao) => {
                        // verificar cada posicao individualmente 
                        // outro LOOP
                        combinacao.forEach( (num) => {
                            // verificar se posicao está vazia
                            let casa = this.byId("casa" + num);
                            let img = casa.getSrc() ;
                            if (img == '../img/branco.png') {
                                numeros.push(num)
                            }
                        }

                        )
                    }

                    )

                    // jogada aleatoria nos valores possiveis
                    this.jogadaAleatoriaIA(numeros);

                } ,

                jogadaAleatoriaIA: function(numeros) {
                    // Math.random gera numero aleatorio entre 0 e 1
                    // Math.floor pega apenas a parte inteira do numero
                    let numeroAleatorio = Math.random() * numeros.lenght ;
                    let numeroInteiro = Math.floor(numeroAleatorio) ;

                    let jogada = numeros[numeroInteiro] ;
                    let casa = this.byId("casa" + jogada) ;
                    casa.setSrc("../img/0.png");
                    if (this.temVencedor() == true) {
                        //alert("o jogador " + this.vez + " ganhou !!!");
                        MessageBox.success("o jogador " + this.vez + " ganhou !!!");
                    }   else {
                        this.vez = "X" ; 
                    }
                }

            });
    });
