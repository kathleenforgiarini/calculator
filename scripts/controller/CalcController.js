class CalcController {
    constructor() {
        this._audio = new Audio('click.mp3'); //com '_', é private
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-br';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
    }

    copyToClipboard() { //Funçao para ctrl+c e ctrl+v
        let input = document.createElement('input'); //Cria campo input dinamicamente
        input.value = this.displayCalc; //Atribui o valor do display para o value do input
        document.body.appendChild(input); //Apresentar input na tela para poder ser selecionado
        input.select(); //Seleciona input
        document.execCommand("Copy"); //Copia valor do input selecionado
        input.remove(); //Remove input da tela
    }

    pasteFromClipboard() {
        document.addEventListener('paste', e => { //Evento do javascript para colar
            let text = e.clipboardData.getData('Text'); //Propriedades do javascript para retornar valor armazenado no ctrl+v. O parametro deve ser 'Text'

            this.displayCalc = parseFloat(text);
            console.log(text);
        });
    }

    initialize() {
        this.setDisplayDateTime();
        setInterval(() => { //Alterar horário dinamicamente a cada segundo
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();


        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => { //Quando clicar duas vezes no botao ac
                this.toggleAudio();
            });
        });

    }

    toggleAudio() {
        //this._audioOnOff = (this._audioOnOff) ? false : true;        //Se _audioOnOff for true, passa a ser false, senão, true
        this._audioOnOff = !this._audioOnOff; //É o contrário dele mesmo
    }


    playAudio() {
        if (this._audioOnOff) { //Verifica se é true
            this._audio.currentTime = 0; //Retorna reproducao do inicio cada vez que o botao é clicado
            this._audio.play() //Executa o audio
        }
    }


    initKeyBoard() {

        document.addEventListener('keyup', e => {
            this.playAudio();

            switch (e.key) { //Retorna a propriedade da tecla que mostra o valor digitado
                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case '.':
                case ',':
                    this.addDot('.');
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    addEventListenerAll(element, events, fn) { //Criado para pegar todos os eventos que passarmos como parametro
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        this._operation = []; //Retorna array vazio
        this._lastNumber = ''; //Retorna valor vazio
        this._lastOperator = ''; //Retorna valor vazio
        this.setLastNumberToDisplay(); //Atualiza display
    }

    clearEntry() {
        this._operation.pop(); //Remove ultimo valor inserido no array
        this.setLastNumberToDisplay(); //Atualiza display
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1]; //Retorna ultimo valor pressionado
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value; //Substitui ultimo valor pressionado
    }

    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1); //Retorna true ou false se tem algum dos operadores em value
    }

    pushOperation(value) {
        this._operation.push(value); //Adiciona valor no final do array

        if (this._operation.length > 3) { //Se o array for maior do que 3 posiçoes
            this.calc(); //Realiza cálculo

        }

    }

    getResult() {
        try {
            return eval(this._operation.join("")); //Junta as posiçoes do array, substituindo as virgulas por nada, e realiza o cálculo
        } catch (e) { //Se o usuário digitar (X+=)
            setTimeout(() => {
                this.setError();
            }, 1)
        }
    }

    calc() {
        let last = '';

        this._lastOperator = this.getLastItem(); //Retorna ultimo operador

        if (this._operation.length < 3) {
            let firstItem = this._operation[0]; //Retorna valor da primeira posicao do array
            this._operation = [firstItem, this._lastOperator, this._lastNumber]; //Retorna array com primeiro os dois numeros e operador
        }

        if (this._operation.length > 3) {
            last = this._operation.pop(); //Armazena na variavel o ultimo valor pressionado (que é um operador)
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false); //Passa parametro falso para buscar o numero, ao inves do operador
        }

        let result = this.getResult();

        if (last == '%') { //Se o operador for porcento
            result /= 100; //Pega o resultado e divide por 100
            this._operation = [result]; //Novo array com o resultado

        } else {
            this._operation = [result];
            if (last) this._operation.push(last); //Adiciona valor no array se existir algo em last

        }

        this.setLastNumberToDisplay(); //Atualiza display

    }

    getLastItem(isOperator = true) {
        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) { //Retorna valores do array de forma decrescente

            if (this.isOperator(this._operation[i]) == isOperator) { //Se a posição i for um operador e for igual ao parametro passado true
                lastItem = this._operation[i]; //Atribui este valor na variável
                break;
            }
        }

        if (!lastItem) { //Se não houver nada no lastItem, ou perder o valor
            lastItem = (isOperator) ? this._lastOperator : this.lastNumber; //Se for um operador, recebe ultimo operador armazenado, senão, recebe ultimo número
        }

        return lastItem;
    }


    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false); //Passa parametro falso para buscar o numero, ao inves do operador

        if (!lastNumber) lastNumber = 0; //Se não tiver nada em lastNumber, retorna 0

        this.displayCalc = lastNumber; //Atribui número para o display
    }


    addOperation(value) {

        if (isNaN(this.getLastOperation())) { //Se o ultimo valor pressionado não é um número
            //String
            if (this.isOperator(value)) { //Se o ultimo valor pressionado é um operador
                //Trocar o Operador
                this.setLastOperation(value);

            } else { //Senão, é um número
                this.pushOperation(value); //Adiciona valor no final de um array
                this.setLastNumberToDisplay(); //Atualiza display
            }

        } else { //Se o ultimo valor pressionado é um número
            //Number

            if (this.isOperator(value)) { //Se o valor pressionado é um operador
                this.pushOperation(value); //Adiciona valor no final do array

            } else { //Se o valor pressionado não é um operador, ou seja, ainda é um número
                let newValue = this.getLastOperation().toString() + value.toString(); //Concatena ultimo valor pressionado com o value
                this.setLastOperation((newValue)); //Atribui novo valor

                //Atualizar display
                this.setLastNumberToDisplay();
            }
        }
    }

    setError() {
        this.displayCalc = "Error";
    }

    addDot() {
        let lastOperation = this.getLastOperation(); //Retorna ultima operacao

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return; //Procura se já exsiste o ponto na operacao, se sim, para a execucao    

        if (this.isOperator(lastOperation) || !lastOperation) { //se for um operador, ou for indefinido
            this.pushOperation('0.'); //Adiciona valor no final do array
        } else { //Se for um número
            this.setLastOperation(lastOperation.toString() + '.') //Concatena o numero com o ponto
        }

        this.setLastNumberToDisplay();
    }

    execBtn(value) {
        this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot('.');
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }

    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g"); //Retorna todas as classes g dos elementos de ID 'buttons' e 'parts'

        buttons.forEach((btn, index) => { //Percorre todos os valores retornados 

            this.addEventListenerAll(btn, "click drag", e => { //Função executada se houver um click ou drag em buttons
                let textBtn = btn.className.baseVal.replace("btn-", ""); //Retorna a classe do botao sem o 'btn-'
                this.execBtn(textBtn); //Passa valor do botao para o switch
            });
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => { //Função executada quando houver eventos do mouse no elemento btn
                btn.style.cursor = "pointer"; //Altera cursor do mouse para estilo 'pointer'
            });
        });
    }

    setDisplayDateTime() { //Atribui valores nos campos de data e hora
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime() { //Recuperar valor
        return this._timeEl.innerHTML;
    }

    set displayTime(value) { //Atribuir valor
        return this._timeEl.innerHTML = value;
    }

    get displayDate() { //Recuperar valor
        return this._dateEl.innerHTML;
    }

    set displayDate(value) { //Atribuir valor
        return this._dateEl.innerHTML = value;
    }

    get displayCalc() { //Recuperar valor 
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) { //Atribuir valor
        if (value.toString().length > 10) { //É necessário passar para string, porque se o valor vier de um cálculo, ele é um número, e a função length verifica apenas strings
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() { //Recuperar valor 
        return new Date();
    }

    set currentDate(value) { //Atribuir valor
        this._currentDate = value;
    }
}