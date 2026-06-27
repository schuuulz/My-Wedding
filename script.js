/* ── COUNTDOWN ─────────────────────────────────────────── */
const weddingDate = new Date('2027-04-10T18:30:00');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '000';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent = '00';
    document.getElementById('cd-secs').textContent = '00';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent = String(days).padStart(3, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ── FADE-IN ON SCROLL ─────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ── ALERT CUSTOMIZADO ─────────────────────────────────── */
function showCustomAlert(message) {
  const alertOverlay = document.getElementById('customAlert');
  document.getElementById('customAlertMessage').textContent = message;
  alertOverlay.style.display = 'flex';
  alertOverlay.offsetHeight; // força o reflow para transição CSS funcionar
  alertOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCustomAlert() {
  const alertOverlay = document.getElementById('customAlert');
  alertOverlay.classList.remove('open');
  setTimeout(() => {
    alertOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

/* ── MODAL DE CONFIRMAÇÃO ────────────────────────────── */
function openConfirmModal() {
  const confirmModal = document.getElementById('confirmModal');
  confirmModal.style.display = 'flex';
  confirmModal.offsetHeight; // força o reflow
  confirmModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
  const confirmModal = document.getElementById('confirmModal');
  confirmModal.classList.remove('open');
  setTimeout(() => {
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function closeRsvpModal() {
  const rsvpModal = document.getElementById('rsvp');
  if (rsvpModal) {
    rsvpModal.classList.remove('open');
    setTimeout(() => {
      rsvpModal.style.display = 'none';
      document.body.style.overflow = '';

      const contribSection = document.getElementById('contribuicoes');
      if (contribSection) {
        smoothScrollTo(contribSection, 900, 0);
      }
    }, 300);
  }
}

/* ── RSVP FORM ─────────────────────────────────────────── */

// URL da Planilha no Google Sheets (Google Apps Script Web App URL)
// Substitua pelo link fornecido após implantar o script no Google Sheets.
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxvzmFIhykYSSDHtgNEtqYyrne0xCEXD4JhY0JAYTuN0bHWRrWbBOTBsZ5Z764JuZ_4/exec';

const rsvpForm = document.getElementById('rsvpForm');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Abre o modal de confirmação antes de enviar
    openConfirmModal();
  });
}

const btnConfirmYes = document.getElementById('btnConfirmYes');
if (btnConfirmYes) {
  btnConfirmYes.addEventListener('click', async () => {
    closeConfirmModal();

    const btn = rsvpForm.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    const payload = {
      nome: rsvpForm.nome.value.trim(),
      email: rsvpForm.email.value.trim(),
      acompanhantes: rsvpForm.acompanhantes.value,
      restricao: rsvpForm.restricao.value.trim(),
      mensagem: rsvpForm.mensagem.value.trim(),
    };

    const sendingOverlay = document.getElementById('sendingOverlay');

    // Exibe a animação do envelope
    sendingOverlay.style.display = 'flex';
    sendingOverlay.offsetHeight;
    sendingOverlay.classList.add('open');

    // Passo 1: Papel descendo (100ms)
    setTimeout(() => {
      sendingOverlay.classList.add('anim-step1');
    }, 100);

    // Passo 2: Tampa fechando (600ms)
    setTimeout(() => {
      sendingOverlay.classList.add('anim-step2');
    }, 600);

    // Função de rede para envio real/teste
    async function performFetch() {
      if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'COLE_AQUI_A_URL_DO_SEU_GOOGLE_APPS_SCRIPT') {
        const res = await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } else {
        console.warn('URL do Google Sheets não configurada. Simulando envio...');
        await new Promise(resolve => setTimeout(resolve, 800));
        if (payload.email.toLowerCase() === 'jaexiste@email.com') {
          return { status: 'exists' };
        } else {
          return { status: 'success' };
        }
      }
    }

    let result = null;
    let errorOccurred = false;

    try {
      // Executa a requisição em paralelo com o tempo mínimo da animação de selamento (1.1s)
      const [fetchRes] = await Promise.all([
        performFetch(),
        new Promise(resolve => setTimeout(resolve, 1100))
      ]);
      result = fetchRes;
    } catch (error) {
      console.error('Erro na requisição:', error);
      errorOccurred = true;
    }

    if (errorOccurred || !result) {
      // Esconde a animação de envio
      sendingOverlay.classList.remove('open', 'anim-step1', 'anim-step2');
      setTimeout(() => { sendingOverlay.style.display = 'none'; }, 400);

      showCustomAlert('Ops! Ocorreu um problema ao enviar sua confirmação. Por favor, tente novamente ou entre em contato com os noivos.');
      btn.textContent = 'Confirmar com Carinho 🤍';
      btn.disabled = false;
    } else if (result.status === 'exists') {
      // Esconde a animação de envio
      sendingOverlay.classList.remove('open', 'anim-step1', 'anim-step2');
      setTimeout(() => { sendingOverlay.style.display = 'none'; }, 400);

      showCustomAlert('Este e-mail já está confirmado para o casamento! Caso precise alterar seus dados, fale com os noivos.');
      btn.textContent = 'Confirmar com Carinho 🤍';
      btn.disabled = false;
    } else {
      // Sucesso: Voo do envelope (Passo 3)
      sendingOverlay.classList.add('anim-step3');

      // Espera a animação de decolagem concluir (800ms)
      setTimeout(() => {
        // Limpa classes
        sendingOverlay.classList.remove('open', 'anim-step1', 'anim-step2', 'anim-step3');
        sendingOverlay.style.display = 'none';

        // Reseta e reativa o formulário
        rsvpForm.reset();
        const btnSubmit = rsvpForm.querySelector('button[type="submit"]');
        if (btnSubmit) {
          btnSubmit.textContent = 'Confirmar com Carinho 🤍';
          btnSubmit.disabled = false;
        }

        // Abre o modal de sucesso (pop-up)
        const rsvpModal = document.getElementById('rsvp');
        if (rsvpModal) {
          rsvpModal.style.display = 'flex';
          rsvpModal.offsetHeight; // força o reflow para transição CSS
          rsvpModal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      }, 800);
    }
  });
}

/* ── COPIAR CHAVE (PIX) ────────────────────────────────── */
function copyPixKey(btn) {
  const container = btn.closest('[data-pix-key]');
  const key = container.dataset.pixKey;
  const feedbackId = btn.dataset.feedback || 'pixCopyFeedback';
  const feedback = document.getElementById(feedbackId);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key).then(() => {
      feedback.textContent = '✓ Chave PIX copiada!';
      setTimeout(() => feedback.textContent = '', 3000);
    });
  } else {
    const el = document.createElement('textarea');
    el.value = key; document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
    feedback.textContent = '✓ Chave PIX copiada!';
    setTimeout(() => feedback.textContent = '', 3000);
  }
}

/* ── LIGHTBOX ──────────────────────────────────────────── */
function openLightbox(el) {
  const img = el.querySelector('img');
  if (!img) return; /* only open when real images are present */
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ── SCROLL SUAVE CUSTOMIZADO DE ALTA COMPATIBILIDADE ────── */
function smoothScrollTo(targetElement, duration = 800, offset = 80) {
  if (!targetElement) return;

  const startPosition = window.scrollY || window.pageYOffset;
  const targetPosition = targetElement.getBoundingClientRect().top + startPosition - offset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Evita conflitos desabilitando temporariamente a suavização nativa do CSS
  const htmlEl = document.documentElement;
  const originalScrollBehavior = htmlEl.style.scrollBehavior;
  htmlEl.style.scrollBehavior = 'auto';

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
      // Restaura o scroll-behavior original do CSS
      htmlEl.style.scrollBehavior = originalScrollBehavior;
    }
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  requestAnimationFrame(animation);
}

// Configura os ouvintes de clique para todos os links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      smoothScrollTo(targetElement, 900, 50);
    }
  });
});
const preLink = "contribuicao-card-photos/";
/* ── CARROUSEL DE COTAS ───────────────────────────────── */
const cotas = [
  {
    valor: "R$ 85,00",
    titulo: "Ajuda de custo do buffet",
    descricao: "Pronto, a sua parte da comida já tá paga! Pode comer sem culpa. 😅",
    link: "https://mpago.la/11EkEiq",
    foto: `${preLink}R$85.jpeg`
  },
  {
    valor: "R$ 100,00",
    titulo: "Contribuindo com o teto do evento",
    descricao: "Com esse valor você garante que a gente dance embaixo de um teto bonito e não na chuva! 💃",
    link: "https://mpago.li/2bbuXgb",
    foto: `${preLink}R$100.jpeg`
  },
  {
    valor: "R$ 120,00",
    titulo: "O mistério do buquê",
    descricao: "Será que isso aqui paga as flores? Do jeito que as coisas estão caras, pelo menos as fitas já foram! 💐",
    link: "https://mpago.la/2WWozdc",
    foto: `${preLink}R$120.jpeg`
  },
  {
    valor: "R$ 200,00",
    titulo: "Cota: Rodízio dos noivos",
    descricao: "Caramba, aí sim! Com isso aqui você já banca o primeiro pós-casamento oficial dos noivos no japonês. 🍣",
    link: "https://mpago.la/1YRuB7c",
    foto: `${preLink}R$200.jpeg`
  },
  {
    valor: "R$ 250,00",
    titulo: "O \"Presentaço\"",
    descricao: "Olha aí, subimos de nível! Esse aqui já é o equivalente a uma batedeira planetária que a gente nunca ia usar. 🎁",
    link: "https://mpago.la/22vtLwD",
    foto: `${preLink}R$250.jpeg`
  },
  {
    valor: "R$ 300,00",
    titulo: "Os 300 de Esparta",
    descricao: "Não são 300 reais, são 300 guerreiros defendendo a saúde financeira deste novo lar! ⚔️",
    link: "https://mpago.la/2herBdn",
    foto: `${preLink}R$300.jpeg`
  },
  {
    valor: "R$ 499,90",
    titulo: "A ilusão do varejo",
    descricao: "Se você achou 500 reais caro, criamos essa opção bem mais em conta para o seu bolso. 💸",
    link: "https://mpago.la/2g2HGzZ",
    foto: `${preLink}R$499,90.jpeg`
  },
  {
    valor: "R$ 553,77",
    titulo: "O valor que o corretor de texto gerou",
    descricao: "Sim, o valor é quebrado assim só porque eu sou muito engraçadinha e superei os limites do TOC. 🤭",
    link: "https://mpago.la/2x8Nn8C",
    foto: `${preLink}R$553,77.jpeg`
  },
  {
    valor: "R$ 666,67",
    titulo: "Sinal dos tempos...",
    descricao: "Se você pegou a referência desse número, por favor, compense os centavos para a gente não atrair azar! 👁️",
    link: "https://mpago.la/1BGaZ5a",
    foto: `${preLink}R$666,67.jpeg`
  },
  {
    valor: "R$ 777,21",
    titulo: "Sete, sete, são quatorze...",
    descricao: "...com mais sete, vinte e um! Tenho sete namorados... Não, pera, agora só tenho um e tô casando! 🎶",
    link: "https://mpago.la/1NSFYJm",
    foto: `${preLink}R$777,21.jpeg`
  },
  {
    valor: "R$ 800,00",
    titulo: "Pausa para respirar",
    descricao: "Chega de centavos quebrados. Vamos acalmar o coração do nosso financeiro com um número redondo. 🧘",
    link: "https://mpago.la/21J58js",
    foto: `${preLink}R$800.jpeg`
  },
  {
    valor: "R$ 950,00",
    titulo: "O empurrãozinho final",
    descricao: "Quem tem coragem de dar isso aqui, claramente tem coragem de arredondar para o próximo valor! 🚀",
    link: "https://mpago.la/2M2hsw5",
    foto: `${preLink}R$950.jpeg`
  },
  {
    valor: "R$ 999,99",
    titulo: "Homenagem aos Fornecedores",
    descricao: "Dedicado a todos os contratos do casamento que adoram colocar um valor quebrado para parecer mais barato. 🧾",
    link: "https://mpago.la/24p4JiQ",
    foto: `${preLink}R$999,99.jpeg`
  },
  {
    valor: "R$ 1.000,00",
    titulo: "Status: Prefeito da Festa",
    descricao: "Você não é mais um convidado, você acaba de ganhar a chave da cidade e o direito de discursar no microfone! 👑",
    link: "https://mpago.la/1g2o3tn",
    foto: `${preLink}R$1.000,00.mp4`,
    isVideo: true
  },
  {
    valor: "R$ 1.500,00",
    titulo: "Patrocinador da Lua de Mel",
    descricao: "Parabéns, você acabou de garantir uma diária nossa no hotel! Prometemos mandar foto do café da manhã. ✈️",
    link: "https://mpago.la/27SrKxW",
    foto: `${preLink}R$1500.jpeg`
  },
  {
    valor: "R$ 2.300,00",
    titulo: "Me passa seu LinkedIn?",
    descricao: "Rapaz... onde é que você trabalha mesmo? Tem vaga por lá? Perguntando para um amigo... 💼",
    link: "https://mpago.la/2Dc9N6i",
    foto: `${preLink}R$2.300.jpeg`
  },
  {
    valor: "R$ 3.200,00",
    titulo: "Anjo do Dia da Noiva",
    descricao: "Meu amor, você acabou de pagar o combo massagem + cabelo + maquiagem + paz de espírito da noiva! 👰",
    link: "https://mpago.la/2Mu7TQf",
    foto: `${preLink}R$3200.jpeg`
  },
  {
    valor: "R$ 4.550,00",
    titulo: "Processo de Adoção",
    descricao: "Quer adotar a gente? A gente lava a louça, arruma a cama e jura que não dá trabalho! 👶",
    link: "https://mpago.la/2jbydbf",
    foto: `${preLink}R$4.550.jpeg`
  },
  {
    valor: "R$ 5.000,00",
    titulo: "Zerou o jogo!",
    descricao: "Nossa, você chegou até aqui na barra de rolagem? O coração do noivo até errou as batidas agora. 🏆",
    link: "https://mpago.la/1p9arye",
    foto: `${preLink}R$5.000.jpeg`
  },
  {
    valor: "R$ 12.000,00",
    titulo: "Passagens Emitidas!",
    descricao: "Se a sua intenção era pagar a nossa lua de mel inteira... o Pix tá liberado e a mala já tá pronta! 🌴",
    link: "https://mpago.la/2ofBVai",
    foto: `${preLink}R$12.000.jpeg`
  },
  {
    valor: "R$ 50.000,00",
    titulo: "Licença Especial para Vestido Branco",
    descricao: "Aqui você compra o direito de ir de branco. Mas cuidado: o contrato não cobre os olhares fatais das madrinhas! 🤍",
    link: "https://mpago.la/1jT4UWn",
    foto: `${preLink}R$50.000.jpeg`
  },
  {
    valor: "R$ 100.000,00",
    titulo: "Alvará Anti-Vinho",
    descricao: "Nesse valor, você pode ir de branco e a gente ainda coloca uma redoma de vidro em você para nenhum vinho tinto te acertar. 🍷",
    link: "https://mpago.la/2S8515E",
    foto: `${preLink}R$100.000.jpeg`
  },
  {
    valor: "R$ 150.000,00",
    titulo: "O Dono da Festa",
    descricao: "Ué, quer comprar o salão de festas e o buffet? Se quiser, o CNPJ tá na mão, a gente vira seus convidados! 🏰",
    link: "#",
    foto: `${preLink}R$150.000.jpeg`
  }
];

let currentCarouselIndex = 0;
let carouselCardsList = [];

function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  carouselCardsList = [];
  track.innerHTML = '';

  cotas.forEach((cota, index) => {
    const card = document.createElement('div');
    card.className = 'carousel-card';

    let mediaHTML = '';
    if (cota.isVideo) {
      mediaHTML = `<video src="${cota.foto}" class="carousel-card-img" autoplay loop muted playsinline></video>`;
    } else {
      mediaHTML = `<img src="${cota.foto}" alt="${cota.titulo}" class="carousel-card-img" loading="lazy" />`;
    }

    card.innerHTML = `
      <div class="carousel-card-img-wrapper">
        ${mediaHTML}
      </div>
      <div class="carousel-card-content">
        <div class="carousel-card-value">${cota.valor}</div>
        <h3 class="carousel-card-title">${cota.titulo}</h3>
        <p class="carousel-card-desc">${cota.descricao}</p>
        <a href="${cota.link}" target="_blank" rel="noopener" class="carousel-card-btn">Presentear</a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-card-btn')) return;

      const prevIndex = (currentCarouselIndex - 1 + cotas.length) % cotas.length;
      const nextIndex = (currentCarouselIndex + 1) % cotas.length;

      if (index === prevIndex) {
        prevCarouselCard();
      } else if (index === nextIndex) {
        nextCarouselCard();
      }
    });

    track.appendChild(card);
    carouselCardsList.push(card);
  });

  updateCarousel();
  initCarouselControls();
}

function initCarouselControls() {
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  if (prevBtn) {
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    document.getElementById('carouselPrevBtn').addEventListener('click', prevCarouselCard);
  }
  if (nextBtn) {
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    document.getElementById('carouselNextBtn').addEventListener('click', nextCarouselCard);
  }
}

function updateCarousel() {
  const total = cotas.length;
  if (total === 0 || carouselCardsList.length === 0) return;

  const prevIndex = (currentCarouselIndex - 1 + total) % total;
  const nextIndex = (currentCarouselIndex + 1) % total;

  carouselCardsList.forEach((card, index) => {
    // Limpa classes anteriores
    card.classList.remove('active', 'prev-card', 'next-card');

    if (index === currentCarouselIndex) {
      card.classList.add('active');
    } else if (index === prevIndex) {
      card.classList.add('prev-card');
    } else if (index === nextIndex) {
      card.classList.add('next-card');
    }
  });
}

function prevCarouselCard() {
  currentCarouselIndex = (currentCarouselIndex - 1 + cotas.length) % cotas.length;
  updateCarousel();
}

function nextCarouselCard() {
  currentCarouselIndex = (currentCarouselIndex + 1) % cotas.length;
  updateCarousel();
}

/* ── SWIPE (TOQUE) NO CARROSSEL ──────────────────────────── */
function initCarouselSwipe() {
  const container = document.querySelector('.carousel-container');
  if (!container) return;

  let startX = 0;
  let isSwiping = false;

  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = false;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    if (dx > 10) isSwiping = true;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 50) {
      nextCarouselCard();
    } else if (diff < -50) {
      prevCarouselCard();
    }
  }, { passive: true });
}

// Inicia no carregamento da página
let domReady = false;
document.addEventListener('DOMContentLoaded', () => {
  if (domReady) return;
  domReady = true;
  initCarousel();
  initCarouselSwipe();
});
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  if (!domReady) {
    domReady = true;
    initCarousel();
    initCarouselSwipe();
  }
}

