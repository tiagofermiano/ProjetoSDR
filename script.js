// Verificar se já tem alguém logado ao iniciar
window.onload = function() {
    const usuario = localStorage.getItem('sdr_usuario');
    if (usuario) {
        document.getElementById('menuNavegacao').classList.remove('hidden');
        document.getElementById('msgBemVindo').innerText = "Bem-vindo(a), " + usuario + "!";
        showPage('home');
    } else {
        document.getElementById('menuNavegacao').classList.add('hidden');
        showPage('login');
    }
};

// Função para Cadastrar um novo usuário
function cadastrarUsuario() {
    const nome = document.getElementById('nomeCadastro').value.trim();
    const email = document.getElementById('emailCadastro').value.trim();
    const telefone = document.getElementById('telefoneCadastro').value.trim();

    if (!nome || !email) {
        alert("Por favor, preencha pelo menos o seu nome e e-mail.");
        return;
    }

    let usuariosRegistrados = JSON.parse(localStorage.getItem('sdr_usuarios_registrados') || '[]');
    
    // Verifica se já existe pelo nome ou email (suporta formato antigo e novo)
    const jaExiste = usuariosRegistrados.find(u => {
        if (typeof u === 'string') return u === nome || u === email;
        return u.nome === nome || u.email === email;
    });

    if (jaExiste) {
        alert("Usuário já cadastrado! Por favor, clique no botão Entrar.");
        return;
    }

    usuariosRegistrados.push({ nome, email, telefone });
    localStorage.setItem('sdr_usuarios_registrados', JSON.stringify(usuariosRegistrados));
    alert("Cadastro realizado com sucesso! Agora você pode fazer o login.");

    // Limpa os campos e volta para a tela de login
    document.getElementById('nomeCadastro').value = "";
    document.getElementById('emailCadastro').value = "";
    document.getElementById('telefoneCadastro').value = "";
    showPage('login');
}

// Função de Login
function fazerLogin() {
    const loginDigitado = document.getElementById('nomeLogin').value.trim();
    if (!loginDigitado) {
        alert("Por favor, digite seu nome ou e-mail.");
        return;
    }

    let usuariosRegistrados = JSON.parse(localStorage.getItem('sdr_usuarios_registrados') || '[]');
    
    const usuarioEncontrado = usuariosRegistrados.find(u => {
        if (typeof u === 'string') return u === loginDigitado;
        return u.nome === loginDigitado || u.email === loginDigitado;
    });

    if (!usuarioEncontrado) {
        alert("Usuário não encontrado. Por favor, cadastre-se primeiro clicando em 'Cadastrar'.");
        return;
    }

    // Pega o nome correto de exibição caso seja um objeto (novo) ou string (antigo)
    const nomeUsuario = typeof usuarioEncontrado === 'string' ? usuarioEncontrado : usuarioEncontrado.nome;

    localStorage.setItem('sdr_usuario', nomeUsuario);
    document.getElementById('menuNavegacao').classList.remove('hidden');
    document.getElementById('msgBemVindo').innerText = "Bem-vindo(a), " + nomeUsuario + "!";
    showPage('home');
    // RF09: Mensagem simulando push/email de boas-vindas
    alert("Bem-vindo! Seu acesso foi confirmado."); 
}

function logout() {
    localStorage.removeItem('sdr_usuario');
    document.getElementById('menuNavegacao').classList.add('hidden');
    showPage('login');
}

// Função para alternar entre as "telas" da aplicação
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    // Se a página for o histórico, atualiza a lista
    if (pageId === 'historico') carregarHistorico();
}

// Filtrar Pontos no Mapa (RF02)
function filtrarPontos() {
    const valorFiltro = document.getElementById('filtroMaterial').value;
    const pontos = document.querySelectorAll('.ponto-coleta');
    
    pontos.forEach(ponto => {
        if (valorFiltro === 'todos') {
            ponto.style.display = 'block';
        } else if (ponto.getAttribute('data-tipo') === valorFiltro) {
            ponto.style.display = 'block';
        } else {
            ponto.style.display = 'none';
        }
    });
}

// Salvar denúncia no LocalStorage
function salvarDenuncia() {
    const desc = document.getElementById('descDenuncia').value;
    const rua = document.getElementById('ruaDenuncia').value.trim();
    const numero = document.getElementById('numeroDenuncia').value.trim();
    const bairro = document.getElementById('bairroDenuncia').value.trim();
    const cidade = document.getElementById('cidadeDenuncia').value.trim();

    // Regra de Negócio: Não aceitar descrição vazia
    if (!desc.trim()) {
        alert("Por favor, descreva a irregularidade. A descrição é obrigatória.");
        return;
    }

    // Junta os campos preenchidos separados por vírgula
    let localFormatado = [rua, numero, bairro, cidade].filter(Boolean).join(', ');
    if (!localFormatado) {
        localFormatado = "Não informado";
    }

    const novaSolicitacao = {
        id: "DEN-" + Date.now(),
        tipo: "Denúncia",
        descricao: desc,
        local: localFormatado,
        data: new Date().toLocaleDateString('pt-BR')
    };

    let solicitacoes = JSON.parse(localStorage.getItem('sdr_solicitacoes') || '[]');
    solicitacoes.push(novaSolicitacao);
    localStorage.setItem('sdr_solicitacoes', JSON.stringify(solicitacoes));

    // RF09: Mensagem simulando push/email
    alert("Denúncia registrada com sucesso! Um e-mail de confirmação junto com um Push Notification foi enviado ao seu dispositivo.");
    
    document.getElementById('descDenuncia').value = ""; 
    document.getElementById('ruaDenuncia').value = ""; 
    document.getElementById('numeroDenuncia').value = ""; 
    document.getElementById('bairroDenuncia').value = ""; 
    document.getElementById('cidadeDenuncia').value = ""; 
    showPage('historico'); 
}

// Agendar coleta de objetos grandes (RF03, RN02)
function agendarColeta() {
    const desc = document.getElementById('descColeta').value;
    const dataAgendada = document.getElementById('dataColeta').value;
    
    if (!desc.trim() || !dataAgendada) {
        alert("Por favor, preencha a descrição e a data pretendida.");
        return;
    }
    
    // Regra de Negócio: Apenas datas futuras (RN02)
    const dataSelecionada = new Date(dataAgendada + "T00:00:00");
    const dataAtual = new Date();
    dataAtual.setHours(0,0,0,0); // Zera as horas para comparar só a data
    
    if (dataSelecionada <= dataAtual) {
        alert("Erro: O agendamento só permite datas futuras (amanhã em diante).");
        return;
    }

    const novaSolicitacao = {
        id: "COL-" + Date.now(),
        tipo: "Coleta Agendada",
        descricao: desc,
        dataAgendamento: dataSelecionada.toLocaleDateString('pt-BR'),
        data: new Date().toLocaleDateString('pt-BR')
    };

    let solicitacoes = JSON.parse(localStorage.getItem('sdr_solicitacoes') || '[]');
    solicitacoes.push(novaSolicitacao);
    localStorage.setItem('sdr_solicitacoes', JSON.stringify(solicitacoes));

    // RF09: Mensagem simulando push/email
    alert("Coleta agendada com sucesso! Você receberá um e-mail com as orientações do procedimento.");
    
    document.getElementById('descColeta').value = ""; 
    document.getElementById('dataColeta').value = ""; 
    showPage('historico'); 
}

// Carregar e exibir o histórico
function carregarHistorico() {
    const lista = document.getElementById('listaHistorico');
    const dados = JSON.parse(localStorage.getItem('sdr_solicitacoes') || '[]');

    if (dados.length === 0) {
        lista.innerHTML = "<p>Nenhuma solicitação registrada ainda.</p>";
        return;
    }

    lista.innerHTML = "<ul>" + dados.reverse().map(item => {
        let extra = "";
        if (item.tipo === "Denúncia") {
            extra = `<strong>Local:</strong> ${item.local}<br>`;
        } else if (item.tipo === "Coleta Agendada") {
            extra = `<strong>Para o dia:</strong> ${item.dataAgendamento}<br>`;
        }

        return `
        <li>
            <strong>Tipo:</strong> ${item.tipo} <br>
            <strong>Protocolo:</strong> ${item.id}<br>
            <strong>Solicitado em:</strong> ${item.data}<br>
            ${extra}
            <strong>Detalhes:</strong> ${item.descricao}
        </li>
    `;
    }).join('') + "</ul>";
}

// Limpar o "banco de dados" local
function limparHistorico() {
    if (confirm("Deseja apagar todo o seu histórico?")) {
        localStorage.removeItem('sdr_solicitacoes');
        carregarHistorico();
    }
}