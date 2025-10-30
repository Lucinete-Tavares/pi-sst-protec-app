// Cria um objeto Date representando a data de hoje
const today = new Date();
// Obtém o último dia do mês atual no formato YYYY-MM-DD
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
// Obtém a data de hoje no formato YYYY-MM-DD
const currentDate = today.toISOString().split('T')[0];

// Seleciona os campos de entrada para data de entrega e data de vencimento
const startDateInput = document.getElementById('data-entrega');
const endDateInput = document.getElementById('data-vencimento');

// Define o valor máximo da data de entrega como o último dia do mês
startDateInput.setAttribute('max', lastDayOfMonth);

// Define o valor mínimo da data de vencimento como o primeiro dia do mês
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
endDateInput.setAttribute('min', firstDayOfMonth);

// Adiciona um ouvinte de evento para a data de entrega
startDateInput.addEventListener('change', () => {
    // Se a data de entrega for maior que o último dia do mês, exibe um alerta e limpa o campo
    if (startDateInput.value > lastDayOfMonth) {
        alert(`A data inicial deve ser até ${lastDayOfMonth}.`);
        startDateInput.value = '';
    }
});

// Adiciona um ouvinte de evento para a data de vencimento
endDateInput.addEventListener('change', () => {
    // Se a data de vencimento for anterior à data de hoje, exibe um alerta e limpa o campo
    if (endDateInput.value < currentDate) {
        alert(`A data final deve ser a partir de ${currentDate}.`);
        endDateInput.value = '';
    }
});

// Adiciona um ouvinte de evento para o envio do formulário
document.querySelector('.form-cadastro').addEventListener('submit', function(e) {
    // Impede o comportamento padrão de envio do formulário
    e.preventDefault();

    // Obtém os valores dos campos de entrada
    const nomeFuncionario = document.getElementById("nome-funcionario").value;
    const tipoEPI = document.getElementById("tipo-epi").value;
    const dataEntrega = document.getElementById("data-entrega").value;
    const dataVencimento = document.getElementById("data-vencimento").value;
    
    // Seleciona o modal que será exibido após o envio
    const modal = document.getElementById("myModal");
    // Seleciona o botão de fechar do modal
    const closeModal = document.getElementsByClassName("close")[0];
    
    // Cria um objeto com os dados do EPI para adicionar ao registro
    const dadosEPI = {
        nomeFuncionario,
        tipoEPI,
        dataEntrega,
        dataVencimento
    };

    // Recupera os registros de EPI armazenados no localStorage ou inicializa com um array vazio
    let registrosEPI = JSON.parse(localStorage.getItem('registrosEPI')) || [];
    // Adiciona o novo registro ao array
    registrosEPI.push(dadosEPI);

    // Atualiza o localStorage com os novos registros
    localStorage.setItem('registrosEPI', JSON.stringify(registrosEPI));

    // Exibe o modal informando que o cadastro foi realizado
    modal.style.display = "block";

    // Reseta o formulário após o envio
    document.querySelector('.form-cadastro').reset();

    // Fecha o modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
    }

    // Define um tempo para fechar o modal automaticamente após 1.5 segundos
    setTimeout(() => {
        modal.style.display = 'none';
    }, 1500);
});