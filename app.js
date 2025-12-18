// ==================== STORAGE ====================
const STORAGE_KEY = 'paga_nois_usuario';

function salvarUsuario(dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregarUsuario() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : null;
}

function usuarioCadastrado() {
    const usuario = carregarUsuario();
    return usuario && usuario.nome && usuario.chave;
}

// ==================== DADOS DO USUARIO ====================
let usuario = carregarUsuario() || {
    nome: '',
    apelido: '',
    chave: '',
    cidade: '',
    foto: null
};

let fotoTemporaria = null;

// ==================== FRASES ====================
const FRASES_VALOR = [
    "Bora la, quanto esse caloteiro te deve?",
    "Chegou a hora da verdade...",
    "Sem vergonha de cobrar, ne? Ta certissimo!",
    "Amizade amizade, negocios a parte!",
    "Confianca zero, PIX na hora!",
    "Dessa vez nao escapa...",
    "Memoria de elefante pra divida alheia!",
    "Quem deve, paga. Quem paga, deve nada!",
    "A paciencia acabou, o PIX nao!"
];

const FRASES_COBRANCA = [
    "Manda esse QR Code e fica de olho!",
    "Se nao pagar, vai pro SPC do churrasco!",
    "Cobranca feita com carinho (e um pouco de raiva)",
    "Agora e so mandar e esperar o PIX cair!",
    "Sem desculpinha, o PIX ta ai!",
    "Nao aceito 'depois eu pago'!",
    "Amigo que e amigo, paga na hora!",
    "Confia no PIX, nao confia no caloteiro!"
];

const MENSAGENS_COBRANCA = [
    "E ai, parceiro! Lembra daquela graninha? Entao...",
    "Opa! Passando pra lembrar daquela divida marota...",
    "Fala, sumido! Sumiu igual meu dinheiro ne?",
    "Oi! Vim cobrar com todo carinho do mundo (mentira, to puto)",
    "Lembrei de voce! Na verdade, lembrei do meu dinheiro...",
    "Opa! To precisando daquele deposito!"
];

// ==================== ELEMENTOS DO DOM ====================
const telas = {
    onboarding: document.getElementById('tela-onboarding'),
    cadastro: document.getElementById('tela-cadastro'),
    inicial: document.getElementById('tela-inicial'),
    valor: document.getElementById('tela-valor'),
    resultado: document.getElementById('tela-resultado'),
    config: document.getElementById('tela-config')
};

// Onboarding
const btnComecar = document.getElementById('btn-comecar');

// Cadastro
const fotoPreview = document.getElementById('foto-preview');
const inputFoto = document.getElementById('input-foto');
const btnEscolherFoto = document.getElementById('btn-escolher-foto');
const inputNome = document.getElementById('input-nome');
const inputApelido = document.getElementById('input-apelido');
const inputChave = document.getElementById('input-chave');
const inputCidade = document.getElementById('input-cidade');
const btnSalvarCadastro = document.getElementById('btn-salvar-cadastro');

// Inicial
const fotoUsuario = document.getElementById('foto-usuario');
const fotoUsuarioSmall = document.getElementById('foto-usuario-small');
const fotoUsuarioResultado = document.getElementById('foto-usuario-resultado');
const displayNome = document.getElementById('display-nome');
const displayApelido = document.getElementById('display-apelido');
const displayChave = document.getElementById('display-chave');
const btnNovaCobranca = document.getElementById('btn-nova-cobranca');
const btnConfiguracoes = document.getElementById('btn-configuracoes');

// Valor
const fraseValor = document.getElementById('frase-valor');
const valorInput = document.getElementById('valor');
const btnGerar = document.getElementById('btn-gerar');
const btnVoltarInicial = document.getElementById('btn-voltar-inicial');

// Resultado
const fraseCobranca = document.getElementById('frase-cobranca');
const valorDisplay = document.getElementById('valor-display');
const qrcodeCanvas = document.getElementById('qrcode-canvas');
const codigoPix = document.getElementById('codigo-pix');
const btnCopiar = document.getElementById('btn-copiar');
const btnEnviarImagem = document.getElementById('btn-enviar-imagem');
const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
const btnEnviarMensagem = document.getElementById('btn-enviar-mensagem');
const btnNovaCobrancaResultado = document.getElementById('btn-nova-cobranca-resultado');
const btnVoltarInicio = document.getElementById('btn-voltar-inicio');

// Config
const fotoPreviewConfig = document.getElementById('foto-preview-config');
const inputFotoConfig = document.getElementById('input-foto-config');
const btnEscolherFotoConfig = document.getElementById('btn-escolher-foto-config');
const configNome = document.getElementById('config-nome');
const configApelido = document.getElementById('config-apelido');
const configChave = document.getElementById('config-chave');
const configCidade = document.getElementById('config-cidade');
const btnSalvarConfig = document.getElementById('btn-salvar-config');
const btnCancelarConfig = document.getElementById('btn-cancelar-config');

const toast = document.getElementById('toast');

// ==================== INICIALIZACAO ====================
document.addEventListener('DOMContentLoaded', () => {
    if (usuarioCadastrado()) {
        usuario = carregarUsuario();
        atualizarTelaInicial();
        mostrarTela('inicial');
    } else {
        mostrarTela('onboarding');
    }

    registrarServiceWorker();
});

function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW registrado'))
            .catch(err => console.log('Erro SW:', err));
    }
}

// ==================== NAVEGACAO ====================
function mostrarTela(nome) {
    Object.values(telas).forEach(t => t.classList.remove('active'));
    telas[nome].classList.add('active');
    window.scrollTo(0, 0);
}

// ==================== UTILIDADES ====================
function fraseAleatoria(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ==================== UPLOAD DE FOTO ====================
function processarFoto(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Redimensionar para no maximo 300x300
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function atualizarPreviewFoto(container, fotoData) {
    if (fotoData) {
        container.innerHTML = `<img src="${fotoData}" alt="Foto">`;
    } else {
        container.innerHTML = '<span class="foto-placeholder">+</span>';
    }
}

// ==================== ONBOARDING ====================
btnComecar.addEventListener('click', () => {
    mostrarTela('cadastro');
});

// ==================== CADASTRO ====================
btnEscolherFoto.addEventListener('click', () => inputFoto.click());

inputFoto.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        processarFoto(e.target.files[0], (fotoData) => {
            fotoTemporaria = fotoData;
            atualizarPreviewFoto(fotoPreview, fotoData);
        });
    }
});

btnSalvarCadastro.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    const apelido = inputApelido.value.trim();
    const chave = inputChave.value.trim();
    const cidade = inputCidade.value.trim();

    if (!nome) {
        mostrarToast('Coloca teu nome ai!');
        return;
    }
    if (!chave) {
        mostrarToast('Precisa da chave PIX!');
        return;
    }

    usuario = {
        nome,
        apelido: apelido || nome.split(' ')[0],
        chave,
        cidade: cidade || 'BRASIL',
        foto: fotoTemporaria
    };

    salvarUsuario(usuario);
    atualizarTelaInicial();
    mostrarTela('inicial');
    mostrarToast('Pronto! Bora cobrar!');
});

// ==================== TELA INICIAL ====================
function atualizarTelaInicial() {
    displayNome.textContent = usuario.nome;
    displayApelido.textContent = usuario.apelido ? `(vulgo ${usuario.apelido})` : '';
    displayChave.textContent = usuario.chave;

    const fotoSrc = usuario.foto || 'icon-default.png';
    fotoUsuario.src = fotoSrc;
    fotoUsuarioSmall.src = fotoSrc;
    fotoUsuarioResultado.src = fotoSrc;
}

btnNovaCobranca.addEventListener('click', () => {
    valorInput.value = '';
    fraseValor.textContent = fraseAleatoria(FRASES_VALOR);
    mostrarTela('valor');
    setTimeout(() => valorInput.focus(), 100);
});

btnConfiguracoes.addEventListener('click', () => {
    // Preencher campos com dados atuais
    configNome.value = usuario.nome;
    configApelido.value = usuario.apelido;
    configChave.value = usuario.chave;
    configCidade.value = usuario.cidade;
    fotoTemporaria = usuario.foto;
    atualizarPreviewFoto(fotoPreviewConfig, usuario.foto);
    mostrarTela('config');
});

// ==================== CONFIGURACOES ====================
btnEscolherFotoConfig.addEventListener('click', () => inputFotoConfig.click());

inputFotoConfig.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        processarFoto(e.target.files[0], (fotoData) => {
            fotoTemporaria = fotoData;
            atualizarPreviewFoto(fotoPreviewConfig, fotoData);
        });
    }
});

btnSalvarConfig.addEventListener('click', () => {
    const nome = configNome.value.trim();
    const apelido = configApelido.value.trim();
    const chave = configChave.value.trim();
    const cidade = configCidade.value.trim();

    if (!nome) {
        mostrarToast('Coloca teu nome ai!');
        return;
    }
    if (!chave) {
        mostrarToast('Precisa da chave PIX!');
        return;
    }

    usuario = {
        nome,
        apelido: apelido || nome.split(' ')[0],
        chave,
        cidade: cidade || 'BRASIL',
        foto: fotoTemporaria
    };

    salvarUsuario(usuario);
    atualizarTelaInicial();
    mostrarTela('inicial');
    mostrarToast('Dados atualizados!');
});

btnCancelarConfig.addEventListener('click', () => {
    mostrarTela('inicial');
});

// ==================== TELA VALOR ====================
valorInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
        e.target.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    e.target.value = value.replace('.', ',');
});

valorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') gerarPix();
});

valorInput.addEventListener('focus', () => {
    setTimeout(() => {
        valorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
});

btnGerar.addEventListener('click', gerarPix);
btnVoltarInicial.addEventListener('click', () => mostrarTela('inicial'));

// ==================== GERACAO DO PIX ====================
function gerarPix() {
    valorInput.blur();

    const valorStr = valorInput.value.replace(',', '.');
    const valor = parseFloat(valorStr);

    if (isNaN(valor) || valor <= 0) {
        mostrarToast('Coloca um valor ai!');
        return;
    }

    const codigoPIX = gerarCodigoPix(valor);

    QRCode.toCanvas(qrcodeCanvas, codigoPIX, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
            dark: '#6a1b9a',
            light: '#ffffff'
        }
    }, (error) => {
        if (error) {
            mostrarToast('Erro ao gerar QR Code');
            return;
        }

        // Adicionar foto no centro se existir
        if (usuario.foto) {
            const img = new Image();
            img.onload = () => {
                const ctx = qrcodeCanvas.getContext('2d');
                const canvasSize = qrcodeCanvas.width;
                const logoSize = canvasSize * 0.24;
                const logoX = (canvasSize - logoSize) / 2;
                const logoY = (canvasSize - logoSize) / 2;

                // Circulo branco
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2 + 8, 0, Math.PI * 2);
                ctx.fill();

                // Foto circular
                ctx.save();
                ctx.beginPath();
                ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                ctx.restore();

                // Borda
                ctx.strokeStyle = '#6a1b9a';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2 + 2, 0, Math.PI * 2);
                ctx.stroke();
            };
            img.src = usuario.foto;
        }

        fraseCobranca.textContent = fraseAleatoria(FRASES_COBRANCA);
        valorDisplay.textContent = formatarMoeda(valor);
        document.getElementById('codigo-pix').value = codigoPIX;
        mostrarTela('resultado');
    });
}

function gerarCodigoPix(valor) {
    const valorFormatado = valor.toFixed(2);
    let payload = '';

    payload += montarCampo('00', '01');
    payload += montarCampo('01', '12');

    let merchantAccount = '';
    merchantAccount += montarCampo('00', 'br.gov.bcb.pix');
    merchantAccount += montarCampo('01', usuario.chave);
    payload += montarCampo('26', merchantAccount);

    payload += montarCampo('52', '0000');
    payload += montarCampo('53', '986');
    payload += montarCampo('54', valorFormatado);
    payload += montarCampo('58', 'BR');

    const nome = removerAcentos(usuario.nome).substring(0, 25);
    payload += montarCampo('59', nome);

    const cidade = removerAcentos(usuario.cidade || 'BRASIL').substring(0, 15);
    payload += montarCampo('60', cidade);

    payload += montarCampo('62', montarCampo('05', '***'));
    payload += '6304';
    payload += calcularCRC16(payload);

    return payload;
}

function montarCampo(id, valor) {
    return id + valor.length.toString().padStart(2, '0') + valor;
}

function calcularCRC16(payload) {
    const polinomio = 0x1021;
    let resultado = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        resultado ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            resultado = (resultado & 0x8000)
                ? ((resultado << 1) ^ polinomio) & 0xFFFF
                : (resultado << 1) & 0xFFFF;
        }
    }
    return resultado.toString(16).toUpperCase().padStart(4, '0');
}

function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
}

// ==================== TELA RESULTADO ====================
btnNovaCobrancaResultado.addEventListener('click', () => {
    valorInput.value = '';
    fraseValor.textContent = fraseAleatoria(FRASES_VALOR);
    mostrarTela('valor');
    setTimeout(() => valorInput.focus(), 100);
});

btnVoltarInicio.addEventListener('click', () => mostrarTela('inicial'));

btnCopiar.addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-pix').value;
    try {
        await navigator.clipboard.writeText(codigo);
        mostrarToast('Copiado! Manda pro caloteiro!');
    } catch {
        document.getElementById('codigo-pix').select();
        document.execCommand('copy');
        mostrarToast('Copiado!');
    }
});

// ==================== COMPARTILHAMENTO ====================
btnEnviarImagem.addEventListener('click', async () => {
    if (navigator.share && navigator.canShare) {
        try {
            const blob = await new Promise(r => qrcodeCanvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'pix-paga-nois.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
                return;
            }
        } catch (err) {
            console.log('Erro:', err);
        }
    }
    mostrarToast('Compartilhamento nao disponivel');
});

btnEnviarCodigo.addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-pix').value;
    if (navigator.share) {
        try {
            await navigator.share({ text: codigo });
            return;
        } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(codigo)}`, '_blank');
});

btnEnviarMensagem.addEventListener('click', async () => {
    const valor = valorDisplay.textContent;
    const abertura = fraseAleatoria(MENSAGENS_COBRANCA);

    const mensagem = `${abertura}\n\n` +
        `*Valor:* ${valor}\n\n` +
        `Pode pagar via PIX:\n` +
        `- Escaneia o QR Code que te mandei\n` +
        `- Ou usa a chave: *${usuario.chave}*\n\n` +
        `Valeu!`;

    if (navigator.share) {
        try {
            await navigator.share({ text: mensagem });
            return;
        } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
});
