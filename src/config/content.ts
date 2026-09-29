/**
 * Todo o texto da landing page.
 * Cada seção tem um `gatilho` — a frase de efeito + CTA que fecha o bloco.
 */

export const content = {
  hero: {
    eyebrow: "Ensaios · Eventos · Vídeo",
    title: "Você vai se ver de um jeito que ainda não viu.",
    lead:
      "Não é uma sessão de fotos. É o dia em que você para tudo, olha pra câmera e descobre que sempre esteve bonita — só faltava alguém enxergar.",
    cta: "Quero garantir minha data",
    selo: "Atendo poucas sessões por mês para não entregar nada correndo.",
    /**
     * Foto PROVISÓRIA do banner — usada só enquanto a seção "hero" do
     * painel (/sections) estiver vazia.
     */
    foto: "/hero.jpg",
    fotoAlt:
      "Noiva segurando o buquê, iluminada por trás pelo sol do fim da tarde",
  },

  faixa: [
    "Todo mundo tem mil fotos no celular.",
    "Quase ninguém tem uma que valha imprimir.",
  ],

  experiencia: {
    eyebrow: "O que acontece no dia",
    title: "Você não precisa saber posar. Esse é o meu trabalho.",
    lead:
      "A maior parte das pessoas chega dizendo a mesma frase: “eu sou péssima em foto”. Nenhuma delas sai dizendo isso.",
    cards: [
      {
        num: "01",
        title: "Os 10 minutos que ninguém mostra",
        text:
          "No começo, ninguém sabe o que fazer com as mãos. A gente conversa, ri, erra algumas. Quando você esquece que a câmera está ali, começa a foto de verdade.",
      },
      {
        num: "02",
        title: "Direção o tempo inteiro",
        text:
          "Onde olhar, o que fazer com a mão, quando respirar, quando rir. Você não vai ficar parada esperando eu dizer “pronto”. Eu conduzo do primeiro ao último clique.",
      },
      {
        num: "03",
        title: "Fotos que saem do celular",
        text:
          "Não é para encher a galeria. É a foto que vira moldura na sala, presente pra sua mãe, e aquela do perfil que te fazem elogio até hoje.",
      },
    ],
    gatilho: {
      frase: "Você não precisa estar pronta. Só precisa marcar.",
      cta: "Me chama no WhatsApp",
    },
  },

  /**
   * O VARAL — a seção fixada com câmera 3D.
   *
   * Substituiu a grade de sete quadros iguais. Ali havia sete
   * miniaturas idênticas competindo pela mesma atenção; aqui a pessoa
   * percorre quatro paradas, e em cada uma só existe uma frase, um
   * texto curto e uma foto. O CTA aparece só na última — quem chegou
   * até lá já viu tudo, e antes disso o convite seria interrupção.
   */
  sala: {
    eyebrow: "Trabalhos recentes",
    titulo: "Olha o que acontece quando alguém aponta a câmera pra você com atenção.",
    estacoes: [
      {
        rotulo: "01 · O varal",
        frase: "Toda foto começa molhada.",
        texto:
          "Antes de virar post, ela é um papel pendurado secando. Eu ainda trato cada uma sabendo de quem é o rosto.",
        foto: "/portfolio/01.jpg",
        alt: "Mãe e filho pequeno abraçados na beira do mar, no fim da tarde",
      },
      {
        rotulo: "02 · Retrato",
        frase: "Ninguém sabe o que fazer com as mãos.",
        texto:
          "Nos primeiros dez minutos, nenhuma pessoa sabe. Depois passa — e é aí que aparece a foto que você guarda.",
        foto: "/portfolio/02.jpg",
        alt: "Retrato feminino em luz natural, olhar direto para a câmera",
      },
      {
        rotulo: "03 · Família",
        frase: "Daqui a um ano essa criança é outra.",
        texto:
          "Ensaio de família tem prazo de validade real. Marcar cedo não é pressa, é a diferença entre ter e não ter.",
        foto: "/portfolio/04.jpg",
        alt: "Casal sentado com o bebê no colo, sorrindo, ao ar livre",
      },
      {
        rotulo: "04 · Evento",
        frase: "Imagina você aqui no meio dessas.",
        texto:
          "As datas livres do mês eu te mando em dois minutos, junto com as opções que cabem no que você quer.",
        foto: "/portfolio/07.jpg",
        alt: "Público de braços erguidos em show, luzes e confete",
      },
    ],
    /**
     * As fotos do portfólio.
     *
     * 🟡 As que estão em public/portfolio/ hoje são PROVISÓRIAS, do
     *    Unsplash — ver public/portfolio/CREDITOS.txt. Servem para
     *    avaliar recorte e composição, não para ir ao ar.
     *
     * `formato` alimenta três coisas ao mesmo tempo: a proporção na
     * grade, quais ocupam duas colunas, e o formato do papel no varal
     * 3D. Um varal só com retrato fica com cara de catálogo; misturar
     * em pé e deitada é o que faz parecer trabalho de verdade.
     *
     * Os ALT descrevem as fotos que estão ali AGORA. Ao trocar pelas
     * dela, reescreva — alt que não descreve a imagem é defeito de
     * acessibilidade e mentira para o Google Imagens.
     */
    fotos: [
      { src: "/portfolio/01.jpg", alt: "Mãe e filho pequeno abraçados na beira do mar, no fim da tarde", formato: "paisagem" },
      { src: "/portfolio/02.jpg", alt: "Retrato feminino em luz natural, olhar direto para a câmera", formato: "retrato" },
      { src: "/portfolio/03.jpg", alt: "Retrato em estúdio sobre fundo escuro, luz lateral", formato: "retrato" },
      { src: "/portfolio/04.jpg", alt: "Casal sentado com o bebê no colo, sorrindo, ao ar livre", formato: "retrato" },
      { src: "/portfolio/05.jpg", alt: "Três amigas de braços erguidos contra o pôr do sol", formato: "paisagem" },
      { src: "/portfolio/06.jpg", alt: "Retrato ao ar livre com chapéu de palha, entre folhagens", formato: "retrato" },
      { src: "/portfolio/07.jpg", alt: "Público de braços erguidos em show, luzes e confete", formato: "paisagem" },
    ],
    gatilho: {
      frase: "Imagina você aqui no meio dessas.",
      cta: "Quero um ensaio assim",
    },
  },

  depoimentos: {
    eyebrow: "O que elas disseram ao ver as fotos",
    title: "A reação é sempre a mesma. E nunca é sobre a foto.",
    /**
     * 🔴 PLACEHOLDER — NÃO PODE IR AO AR.
     *
     * Estas quatro frases são inventadas, e DUAS delas foram copiadas da
     * referência Deborah Menezes (ver docs/01-pesquisa-referencias.md):
     * "Eu não sabia que era tão linda" e "Quero fazer todo mês!" são dela.
     *
     * Publicar depoimento fabricado é o mesmo problema que derrubou o
     * "restam 3 vagas" na decisão D8 — CDC art. 37 — e ainda por cima é
     * copy de concorrente.
     *
     * O formato está certo (frase curta de reação, sem nome e sem foto —
     * decisão D6). O que falta é o insumo: prints de WhatsApp das 8
     * clientes reais. Ver docs/06-pendencias.md, bloco verde, item 3.
     */
    itens: [
      { frase: "Eu não sabia que era tão linda.", contexto: "Ensaio feminino" },
      { frase: "Chorei quando abri a galeria.", contexto: "Ensaio gestante" },
      { frase: "Meu marido não acreditou que era eu.", contexto: "Ensaio aniversário" },
      { frase: "Quero fazer todo ano agora.", contexto: "Ensaio em família" },
    ],
    gatilho: {
      frase: "A próxima frase dessa lista pode ser a sua.",
      cta: "Quero marcar o meu",
    },
  },

  video: {
    eyebrow: "Fotos e vídeos",
    title: "Foto congela. Vídeo devolve o movimento.",
    lead:
      "A risada de verdade, o jeito que você mexe o cabelo sem perceber, a voz. Daqui a dez anos, é o vídeo que você vai assistir chorando — e é ele que quase ninguém pensa em fazer na hora.",
    gatilho: {
      frase: "Foto você vai ter. Vídeo, só se você pedir.",
      cta: "Quero foto e vídeo",
    },
    /** Enquanto não houver vídeo nem capa no painel (/sections → Vídeo). */
    reservado: "Frame do vídeo ou reel em loop",
    /** Rótulo do botão de play (leitor de tela). O título do vídeo vem depois. */
    assistir: "Assistir ao vídeo",
  },

  comoFunciona: {
    eyebrow: "Simples assim",
    title: "Do primeiro “oi” até as fotos na sua mão.",
    passos: [
      {
        n: "1",
        title: "Você me chama no WhatsApp",
        text:
          "Me conta o que você quer registrar. Em poucos minutos eu te mostro as opções e as datas livres.",
      },
      {
        n: "2",
        title: "A gente combina tudo antes",
        text:
          "Local, horário, roupas, referências. Você chega no dia sabendo exatamente o que vai acontecer.",
      },
      {
        n: "3",
        title: "O dia do ensaio",
        text:
          "Sem pressa e sem constrangimento. Eu dirijo cena por cena — você só precisa aparecer.",
      },
      {
        n: "4",
        title: "Você recebe",
        text:
          "Galeria online, fotos tratadas uma a uma, prontas para imprimir e para postar.",
      },
    ],
    gatilho: {
      frase: "O passo 1 leva trinta segundos.",
      cta: "Dar o primeiro passo",
    },
  },

  sobre: {
    eyebrow: "Quem está atrás da câmera",
    title: "Oi, eu sou a Bigette.",
    paragrafos: [
      "Eu fotografo porque gosto do instante em que a pessoa esquece que está sendo fotografada. É ali que aparece a foto que ninguém consegue tirar no celular.",
      "Trabalho com poucas sessões por mês, de propósito: eu quero lembrar do seu nome, da sua história e do motivo daquele ensaio quando estiver editando cada foto.",
    ],
    gatilho: {
      frase: "Me conta o que você quer registrar. Eu adoro essa parte.",
      cta: "Contar pra Bigette",
    },
    /** Enquanto não houver foto no painel (/sections → Sobre). Nunca um rosto qualquer. */
    reservado: "Foto da Bigette",
  },

  faq: {
    eyebrow: "Antes que você pergunte",
    title: "As dúvidas que sempre chegam.",
    itens: [
      {
        q: "Quanto custa?",
        a: "Depende do que você quer: quanto tempo de ensaio, quantas fotos, se tem vídeo, se é em estúdio ou externo. Por isso eu não coloco uma tabela aqui — eu preferia te mandar a opção certa em vez da mais cara. Me chama no WhatsApp que em dois minutos eu te mostro as opções e as datas livres.",
        aberto: true,
      },
      {
        q: "Nunca fiz ensaio. Vou ficar sem graça?",
        a: "Todo mundo fica, nos primeiros dez minutos. Depois passa — e é justamente por isso que eu dirijo o ensaio inteiro. Você nunca vai ficar parada sem saber o que fazer.",
      },
      {
        q: "Quando eu recebo as fotos?",
        a: "Em até {PRAZO} dias úteis, em galeria online, com as fotos tratadas uma a uma. Se você precisar de alguma antes, é só falar que eu adianto.",
      },
      {
        q: "Você atende fora de {CIDADE}?",
        a: "Atendo. Acima de {RAIO} km tem uma taxa de deslocamento, que eu já te informo junto com as opções.",
      },
      {
        q: "Posso levar mais de uma roupa?",
        a: "Pode, e recomendo. A gente combina antes quantas trocas cabem no tempo do seu ensaio.",
      },
      {
        q: "E se chover no dia?",
        a: "A gente remarca sem custo nenhum. Nunca perdi uma sessão por causa de chuva — só mudei a data ou o lugar.",
      },
    ],
    gatilho: {
      frase: "Ficou alguma dúvida que não está aqui?",
      cta: "Perguntar direto",
    },
  },

  final: {
    eyebrow: "Última coisa",
    title: "Daqui a um ano você vai querer ter essas fotos.",
    lead: "A única diferença vai ser se você mandou a mensagem hoje ou não.",
    cta: "Chamar a Bigette no WhatsApp",
  },
} as const;
