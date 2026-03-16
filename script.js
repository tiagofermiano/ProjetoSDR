// Função para alternar entre as "telas" da aplicação
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    // Se a página for o histórico, atualiza a lista
    if (pageId === 'historico') carregarHistorico();
}

// Salvar denúncia no LocalStorage
function salvarDenuncia() {
    const desc = document.getElementById('descDenuncia').value;

    // Regra de Negócio: Não aceitar descrição vazia
    if (!desc.trim()) {
        alert("Por favor, descreva a irregularidade.");
        return;
    }

    const novaDenuncia = {
        id: Date.now(),
        descricao: desc,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Pega o que já tem no "banco" ou cria um array vazio
    let denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
    denuncias.push(novaDenuncia);

    // Salva de volta no LocalStorage convertido em String
    localStorage.setItem('denuncias', JSON.stringify(denuncias));

    alert("Denúncia enviada com sucesso!");
    document.getElementById('descDenuncia').value = ""; // Limpa o campo
    showPage('historico'); // Redireciona para o histórico
}

// Carregar e exibir o histórico de denúncias
function carregarHistorico() {
    const lista = document.getElementById('listaHistorico');
    const dados = JSON.parse(localStorage.getItem('denuncias') || '[]');

    if (dados.length === 0) {
        lista.innerHTML = "<p>Nenhuma denúncia registrada ainda.</p>";
        return;
    }

    // Mapeia os dados para o formato HTML
    lista.innerHTML = "<ul>" + dados.reverse().map(item => `
        <li>
            <strong>Protocolo:</strong> ${item.id}<br>
            <strong>Data:</strong> ${item.data}<br>
            <strong>Relato:</strong> ${item.descricao}
        </li>
    `).join('') + "</ul>";
}

// Limpar o "banco de dados" local
function limparHistorico() {
    if (confirm("Deseja apagar todo o seu histórico?")) {
        localStorage.removeItem('denuncias');
        carregarHistorico();
    }
}