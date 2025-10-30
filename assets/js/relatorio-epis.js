// Carrega os registros de EPIs do localStorage ou inicializa como um array vazio
const registrosEPI = JSON.parse(localStorage.getItem('registrosEPI')) || [];
// Obtém o corpo da tabela onde os registros serão inseridos
const tabelaRelatorio = document.getElementById('tabela-relatorio').getElementsByTagName('tbody')[0];
// Variável para controlar se a edição está ativa ou não
let edicaoAtiva = false;

// Função para visualizar a tabela de registros
function visualizar() {
    // Exibe a tabela de relatórios
    const tabela = document.getElementById('tabela-relatorio');
    tabela.style.display = 'table';
    
    // Se a edição estiver ativa, desabilita a edição antes de preencher a tabela
    if (edicaoAtiva) {
        desabilitarEdicao();
    }
    
    // Preenche a tabela com os dados dos registros
    preencherTabela();
}

// Função para ativar/desativar o modo de edição
function editar() {
    // Alterna o estado de edição
    edicaoAtiva = !edicaoAtiva;
    
    // Obtém o botão de salvar
    const salvarButton = document.getElementById('salvar-edicao');
    
    if (edicaoAtiva) {
        // Exibe o botão de salvar
        salvarButton.style.display = 'inline-block';
        
        // Itera sobre as linhas da tabela para tornar os campos editáveis
        tabelaRelatorio.querySelectorAll('tr').forEach((linha, index) => {
            if (index < registrosEPI.length) {
                const celulas = linha.cells;
                for (let i = 0; i < 4; i++) {
                    // Obtém o conteúdo original da célula e transforma em um campo de entrada
                    const textoOriginal = celulas[i].textContent;
                    celulas[i].innerHTML = `<input type="text" value="${textoOriginal}">`;
                }
            }
        });
    } else {
        // Oculta o botão de salvar e desativa a edição
        salvarButton.style.display = 'none';
        desabilitarEdicao();
    }
}

// Função para salvar as edições feitas na tabela
function salvarEdicao() {
    // Itera sobre as linhas da tabela e salva os valores atualizados
    tabelaRelatorio.querySelectorAll('tr').forEach((linha, index) => {
        if (index < registrosEPI.length) {
            const celulas = linha.cells;
            const dadosAtualizados = {
                nomeFuncionario: celulas[0].querySelector('input').value,
                tipoEPI: celulas[1].querySelector('input').value,
                dataEntrega: celulas[2].querySelector('input').value,
                dataVencimento: celulas[3].querySelector('input').value
            };

            // Atualiza o registro no array de registrosEPI
            registrosEPI[index] = dadosAtualizados;
        }
    });
    // Salva os registros atualizados no localStorage
    localStorage.setItem('registrosEPI', JSON.stringify(registrosEPI));
    // Desativa o modo de edição e preenche novamente a tabela
    edicaoAtiva = false;
    preencherTabela();
    document.getElementById('salvar-edicao').style.display = 'none';
}

// Função para desabilitar o modo de edição e retornar os dados para o formato original
function desabilitarEdicao() {
    tabelaRelatorio.querySelectorAll('tr').forEach((linha, index) => {
        if (index < registrosEPI.length) {
            const celulas = linha.cells;
            for (let i = 0; i < 4; i++) {
                // Se existir um campo de entrada, substitui pelo valor atual
                const input = celulas[i].querySelector('input');
                if (input) {
                    celulas[i].textContent = input.value;
                }
            }
        }
    });
}

// Função para filtrar os registros de acordo com a data selecionada
function filterDates(filteredDates) {
    // Obtém o valor do rádio selecionado para filtrar por frequência
    const selectedRadio = document.querySelector('input[name="frequencia"]:checked');
    const radiobutton = selectedRadio;
    console.log(radiobutton);

    const selectedFilter = radiobutton;
    const today = new Date();

    // Aplica os filtros conforme o tipo de frequência selecionado
    switch (selectedFilter) {
        case 'diario': {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            filteredDates = dates.filter(registro => {
                const d = new Date(registro.dataEntrega);
                return d.toDateString() === yesterday.toDateString();
            });
            break;
        }
        case 'semanal': {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            filteredDates = dates.filter(registro => {
                const d = new Date(registro.dataEntrega);
                return d >= oneWeekAgo && d <= today;
            });
            break;
        }
        case 'mensal': {
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            filteredDates = dates.filter(registro => {
                const d = new Date(registro.dataEntrega);
                return d >= oneMonthAgo && d <= today;
            });
            break;
        }
        case 'anual': {
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            filteredDates = dates.filter(registro => {
                const d = new Date(registro.dataEntrega);
                return d >= oneYearAgo && d <= today;
            });
            break;
        }
        case 'todos': {
            filteredDates = filteredDates;
            break;
        }
    }

    return filteredDates;
}

// Função para gerar o PDF com os dados dos registros
function baixarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurações do título do PDF
    doc.setTextColor(4, 76, 140);
    doc.setFontSize(18);
    const title = 'Relatório de Entrega de EPIs';
    const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;

    const xPosition = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, xPosition, 20);

    // Define as colunas da tabela no PDF
    const colunas = ['Funcionário', 'Tipo de EPI', 'Entrega', 'Vencimento'];

    // Filtra os registros de acordo com a data
    let registros = filterDates(registrosEPI);

    // Prepara os dados para a tabela no PDF
    const dados = registrosEPI.map(dado => [
        dado.nomeFuncionario,
        dado.tipoEPI,
        dado.dataEntrega,
        dado.dataVencimento
    ]);

    // Cria a tabela no PDF com os dados dos registros
    doc.autoTable({
        head: [colunas],
        body: dados,
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [244, 140, 28],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [4, 76, 140],
            fontSize: 10,
        },
    });

    // Adiciona a data de impressão no rodapé do PDF
    const date = new Date();
    const dateStr = `Data de Impressão: ${date.toLocaleDateString('pt-BR')}`;

    doc.setFontSize(10);
    const dateWidth = doc.getStringUnitWidth(dateStr) * doc.internal.scaleFactor;

    let xPos = doc.internal.pageSize.width - dateWidth - 25;
    if (xPos < 10) {
        xPos = 10;
    }

    doc.text(dateStr, xPos, doc.internal.pageSize.height - 20);

    // Adiciona o técnico responsável no rodapé
    const tecnico = "Técnico Responsável";
    const sublinha = "_____________________________________";

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const lineWidth = 90;
    const posX = (pageWidth - lineWidth) / 2;
    const posY = pageHeight - 60;

    doc.line(posX, posY, posX + lineWidth, posY);

    const tecnicoWidth = doc.getTextWidth(tecnico);
    const textPosX = (pageWidth - tecnicoWidth) / 2;

    doc.text(tecnico, textPosX, posY + 10);

    // Salva o arquivo PDF gerado
    console.log('Gerando PDF...');
    doc.save('relatorio-epis.pdf');
}

// Função para preencher a tabela com os dados de registrosEPI
function preencherTabela() {
    tabelaRelatorio.innerHTML = '';
    if (registrosEPI.length > 0) {
        registrosEPI.forEach(dado => {
            const linha = tabelaRelatorio.insertRow();
            const celulaNome = linha.insertCell();
            celulaNome.textContent = dado.nomeFuncionario;

            const celulaEPI = linha.insertCell();
            celulaEPI.textContent = dado.tipoEPI;

            const celulaEntrega = linha.insertCell();
            celulaEntrega.textContent = dado.dataEntrega;

            const celulaVencimento = linha.insertCell();
            celulaVencimento.textContent = dado.dataVencimento;

            const celulaAcoes = linha.insertCell();
            celulaAcoes.innerHTML = "<button onclick='excluirLinha(this)'>Excluir</button>";
        });
    }
}

// Função para excluir uma linha da tabela
function excluirLinha(button) {
    const row = button.closest('tr');
    const index = row.rowIndex - 1;
    // Remove o registro do array e atualiza o localStorage
    registrosEPI.splice(index, 1);
    localStorage.setItem('registrosEPI', JSON.stringify(registrosEPI));
    row.remove();
}

// Função para inicializar a visualização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    visualizar()
});