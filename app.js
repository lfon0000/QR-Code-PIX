// Configuracoes do PIX
const CONFIG = {
    chavePix: '00546654002',
    beneficiario: 'Luiz Fernando Osorio Neto',
    apelido: 'Lui',
    cidade: 'ESTANCIA VELHA'
};

// Frases humoristicas
const FRASES_VALOR = [
    "Bora la, quanto esse caloteiro te deve?",
    "Chegou a hora da verdade...",
    "Sem vergonha de cobrar, ne? Ta certissimo!",
    "Amizade amizade, negocios a parte!",
    "O banco do Lui nao perdoa!",
    "Confianca zero, PIX na hora!",
    "Dessa vez nao escapa...",
    "Memoria de elefante pra divida alheia!"
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
    "Opa! O banco do Lui ta precisando de deposito!"
];

// Elementos do DOM
const telaInicial = document.getElementById('tela-inicial');
const telaValor = document.getElementById('tela-valor');
const telaResultado = document.getElementById('tela-resultado');

const btnNovaCobranca = document.getElementById('btn-nova-cobranca');
const btnVoltarInicial = document.getElementById('btn-voltar-inicial');
const btnNovaCobrancaResultado = document.getElementById('btn-nova-cobranca-resultado');
const btnVoltarInicio = document.getElementById('btn-voltar-inicio');

const valorInput = document.getElementById('valor');
const btnGerar = document.getElementById('btn-gerar');
const qrcodeCanvas = document.getElementById('qrcode-canvas');
const valorDisplay = document.getElementById('valor-display');
const codigoPix = document.getElementById('codigo-pix');
const btnCopiar = document.getElementById('btn-copiar');
const btnEnviarImagem = document.getElementById('btn-enviar-imagem');
const btnEnviarCodigo = document.getElementById('btn-enviar-codigo');
const btnEnviarMensagem = document.getElementById('btn-enviar-mensagem');
const toast = document.getElementById('toast');
const fraseValor = document.getElementById('frase-valor');
const fraseCobranca = document.getElementById('frase-cobranca');

let valorAtual = 0;

// Carregar foto para o QR Code
const logoImg = new Image();
logoImg.src = 'foto-lui.png';
let logoCarregado = false;
logoImg.onload = () => {
    logoCarregado = true;
};

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Erro ao registrar SW:', err));
    });
}

// ==================== FUNCOES AUXILIARES ====================

function fraseAleatoria(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function mostrarTela(tela) {
    telaInicial.classList.remove('active');
    telaValor.classList.remove('active');
    telaResultado.classList.remove('active');
    tela.classList.add('active');
    window.scrollTo(0, 0);
}

function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ==================== NAVEGACAO ====================

btnNovaCobranca.addEventListener('click', () => {
    valorInput.value = '';
    fraseValor.textContent = fraseAleatoria(FRASES_VALOR);
    mostrarTela(telaValor);
    setTimeout(() => valorInput.focus(), 100);
});

btnVoltarInicial.addEventListener('click', () => {
    mostrarTela(telaInicial);
});

btnNovaCobrancaResultado.addEventListener('click', () => {
    valorInput.value = '';
    fraseValor.textContent = fraseAleatoria(FRASES_VALOR);
    mostrarTela(telaValor);
    setTimeout(() => valorInput.focus(), 100);
});

btnVoltarInicio.addEventListener('click', () => {
    mostrarTela(telaInicial);
});

// ==================== INPUT DE VALOR ====================

valorInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length === 0) {
        e.target.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    e.target.value = value.replace('.', ',');
});

valorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        gerarPix();
    }
});

valorInput.addEventListener('focus', () => {
    setTimeout(() => {
        valorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
});

// ==================== GERACAO DO PIX ====================

btnGerar.addEventListener('click', gerarPix);

function gerarPix() {
    valorInput.blur();

    const valorStr = valorInput.value.replace(',', '.');
    const valor = parseFloat(valorStr);

    if (isNaN(valor) || valor <= 0) {
        mostrarToast('Coloca um valor ai, po!');
        return;
    }

    valorAtual = valor;
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
            console.error(error);
            mostrarToast('Deu ruim no QR Code!');
            return;
        }

        // Adicionar foto no centro
        if (logoCarregado) {
            const ctx = qrcodeCanvas.getContext('2d');
            const canvasSize = qrcodeCanvas.width;
            const logoSize = canvasSize * 0.24;
            const logoX = (canvasSize - logoSize) / 2;
            const logoY = (canvasSize - logoSize) / 2;

            // Circulo branco de fundo
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2 + 8, 0, Math.PI * 2);
            ctx.fill();

            // Clip circular para a foto
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            // Borda roxa
            ctx.strokeStyle = '#6a1b9a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        fraseCobranca.textContent = fraseAleatoria(FRASES_COBRANCA);
        valorDisplay.textContent = formatarMoeda(valor);
        document.getElementById('codigo-pix').value = codigoPIX;
        mostrarTela(telaResultado);
    });
}

function gerarCodigoPix(valor) {
    const valorFormatado = valor.toFixed(2);
    let payload = '';

    payload += montarCampo('00', '01');
    payload += montarCampo('01', '12');

    let merchantAccount = '';
    merchantAccount += montarCampo('00', 'br.gov.bcb.pix');
    merchantAccount += montarCampo('01', CONFIG.chavePix);
    payload += montarCampo('26', merchantAccount);

    payload += montarCampo('52', '0000');
    payload += montarCampo('53', '986');
    payload += montarCampo('54', valorFormatado);
    payload += montarCampo('58', 'BR');

    const nome = removerAcentos(CONFIG.beneficiario).substring(0, 25);
    payload += montarCampo('59', nome);

    const cidade = removerAcentos(CONFIG.cidade).substring(0, 15);
    payload += montarCampo('60', cidade);

    let additionalData = '';
    additionalData += montarCampo('05', '***');
    payload += montarCampo('62', additionalData);

    payload += '6304';
    const crc = calcularCRC16(payload);
    payload += crc;

    return payload;
}

function montarCampo(id, valor) {
    const tamanho = valor.length.toString().padStart(2, '0');
    return id + tamanho + valor;
}

function calcularCRC16(payload) {
    const polinomio = 0x1021;
    let resultado = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        resultado ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((resultado & 0x8000) !== 0) {
                resultado = ((resultado << 1) ^ polinomio) & 0xFFFF;
            } else {
                resultado = (resultado << 1) & 0xFFFF;
            }
        }
    }

    return resultado.toString(16).toUpperCase().padStart(4, '0');
}

function removerAcentos(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toUpperCase();
}

// ==================== COPIAR CODIGO ====================

btnCopiar.addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-pix').value;

    try {
        await navigator.clipboard.writeText(codigo);
        mostrarToast('Copiado! Agora manda pro caloteiro!');
    } catch (err) {
        document.getElementById('codigo-pix').select();
        document.execCommand('copy');
        mostrarToast('Copiado!');
    }
});

// ==================== COMPARTILHAMENTO ====================

// Enviar imagem
btnEnviarImagem.addEventListener('click', async () => {
    if (navigator.share && navigator.canShare) {
        try {
            const blob = await new Promise(resolve => {
                qrcodeCanvas.toBlob(resolve, 'image/png');
            });

            const file = new File([blob], 'pix-lui.png', { type: 'image/png' });
            const shareData = { files: [file] };

            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
            }
        } catch (err) {
            console.log('Erro:', err);
        }
    }
    mostrarToast('Compartilhamento nao disponivel');
});

// Enviar codigo
btnEnviarCodigo.addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-pix').value;

    if (navigator.share) {
        try {
            await navigator.share({ text: codigo });
            return;
        } catch (err) {
            console.log('Erro:', err);
        }
    }

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(codigo)}`;
    window.open(urlWhatsApp, '_blank');
});

// Enviar mensagem completa
btnEnviarMensagem.addEventListener('click', async () => {
    const valor = valorDisplay.textContent;
    const abertura = fraseAleatoria(MENSAGENS_COBRANCA);

    const mensagem = `${abertura}\n\n` +
        `*Valor:* ${valor}\n\n` +
        `Pode pagar via PIX:\n` +
        `- Escaneia o QR Code que te mandei\n` +
        `- Ou usa a chave: *${CONFIG.chavePix}*\n\n` +
        `Valeu! Confia no pai!`;

    if (navigator.share) {
        try {
            await navigator.share({ text: mensagem });
            return;
        } catch (err) {
            console.log('Erro:', err);
        }
    }

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
});
