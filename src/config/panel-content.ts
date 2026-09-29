/**
 * Texto do painel (área escondida). Separado de `content.ts` para que
 * nenhuma string do painel entre no pacote da landing page — que é
 * pública e não deve nem insinuar que o painel existe.
 */
export const panelContent = {
  meta: {
    titleTemplate: "%s · Painel",
    title: "Painel",
  },

  /** Uma mensagem por código de erro. Spec: .claude/specs/004-error-handling.md */
  errors: {
    validation: "Confira os campos destacados.",
    unauthenticated: "Sua sessão expirou. Entre de novo para continuar.",
    forbidden: "Você não tem permissão para fazer isso.",
    conflict: "Já existe um registro com esses dados.",
    conflictReference: "Este registro está ligado a outros dados e não pode ser alterado assim.",
    invalidData: "O banco de dados recusou um dos valores por formato inválido.",
    unavailable: "Não conseguimos falar com o banco de dados agora. Tente de novo em alguns segundos.",
    timeout: "A operação demorou demais e foi cancelada. Tente de novo.",
    config: "O servidor está com a configuração incompleta ou inválida. Avise quem cuida do sistema.",
    schema: "O banco de dados está desatualizado em relação ao sistema. Avise quem cuida do sistema.",
    internal: "Algo deu errado do nosso lado. Tente de novo em instantes.",
    upstream: "O serviço que guarda as fotos não respondeu como esperado. Tente de novo em instantes.",
    network: "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
    stale: "O painel foi atualizado. Recarregue a página para continuar.",
    errorId: "Código do erro",
    detail: "Detalhe técnico (só em desenvolvimento)",
    reload: "Recarregar página",
    boundary: {
      title: "Esta tela não carregou",
      text: "Aconteceu um erro inesperado ao montar a página. Tentar de novo costuma resolver.",
      retry: "Tentar de novo",
      home: "Ir para o início",
    },
  },

  common: {
    save: "Salvar",
    saving: "Salvando…",
    cancel: "Cancelar",
    back: "Voltar",
    loading: "Carregando…",
    retry: "Tentar de novo",
    optional: "opcional",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    never: "nunca",
  },

  login: {
    metaTitle: "Entrar",
    eyebrow: "Bigette · Painel",
    title: "Entrar",
    lead: "Área restrita.",
    identifier: "E-mail ou usuário",
    password: "Senha",
    submit: "Entrar",
    submitting: "Entrando…",
    invalidCredentials: "Usuário ou senha incorretos.",
    validation: {
      identifierRequired: "Informe seu e-mail ou usuário.",
      passwordRequired: "Informe a senha.",
    },
  },

  nav: {
    label: "Navegação do painel",
    pictures: "Fotos",
    sections: "Seções",
    users: "Usuários",
    profile: "Perfil",
    signOut: "Sair",
  },

  roles: {
    admin: "Admin",
    member: "Membro",
  },

  pictures: {
    metaTitle: "Fotos",
    title: "Fotos",
    lead: "O banco de imagens do site. Envie aqui; escolha onde cada uma aparece em Seções.",
    emptyTitle: "Nenhuma foto no banco",
    emptyText: "Envie as primeiras fotos acima. Enquanto as seções estiverem vazias, a página mostra as provisórias.",

    upload: {
      title: "Enviar fotos",
      lead: "JPEG, PNG ou WebP, até 4 MB cada, com pelo menos 1200 px no lado maior. Até 20 por vez.",
      drop: "Arraste as fotos para cá",
      or: "ou",
      choose: "Escolher fotos",
      addMore: "Adicionar mais",
      alt: "Descrição da foto",
      altHint:
        "O que aparece na imagem, em uma frase. É lida por leitores de tela e pelo Google Imagens.",
      remove: "Tirar da fila",
      submit: (n: number) => (n === 1 ? "Enviar 1 foto" : `Enviar ${n} fotos`),
      progress: (current: number, total: number) => `Enviando ${current} de ${total}…`,
      done: (n: number) =>
        n === 1 ? "1 foto enviada. Já está no site." : `${n} fotos enviadas. Já estão no site.`,
      partial: (ok: number, failed: number) =>
        `${ok} enviada${ok === 1 ? "" : "s"}. ${failed} ficou na fila com erro — corrija e envie de novo.`,
      waiting: "Na fila",
      sending: "Enviando…",
      failed: "Não foi",
      tooMany: (max: number) => `Máximo de ${max} fotos por vez. As demais não entraram na fila.`,
      duplicate: "Esta foto já está na fila.",
      fixBefore: "Corrija as fotos marcadas antes de enviar.",
      landscape: "Deitada",
      portrait: "Em pé",
    },

    bank: {
      title: "Banco de fotos",
      lead: "Todas as fotos enviadas, mais novas primeiro. Para aparecerem no site, atrele cada uma a uma seção em Seções.",
      usedIn: "Em:",
      unused: "Fora do site",
      delete: "Excluir",
      confirmDelete: "Confirmar",
      deleting: "Excluindo…",
      /** Aviso antes de confirmar: excluir tira a foto das seções também. */
      deleteWarning: (sections: string) => `Sai também de: ${sections}.`,
      goToSections: "Atrelar às seções",
    },

    validation: {
      fileRequired: "Escolha uma foto.",
      fileTooLarge: "A foto passa de 4 MB. Exporte de novo com um pouco menos de qualidade.",
      fileType: "Use JPEG, PNG ou WebP.",
      fileUnreadable: "Não foi possível ler esta imagem. Ela pode estar corrompida ou num formato não aceito.",
      fileTooSmall: "A foto precisa de pelo menos 1200 px no lado maior — menor que isso chega borrada no celular.",
      altTooShort: "Descreva a foto com pelo menos 8 caracteres.",
      altTooLong: "Máximo de 160 caracteres.",
      notFound: "Esta foto não existe mais. Recarregue a lista.",
    },

    upstream: {
      rateLimited: "Muitos envios seguidos. Espere um minuto e tente de novo.",
      suspended:
        "O armazenamento de fotos atingiu o limite do plano grátis e está pausado. As fotos já publicadas continuam no site; novos envios voltam quando o limite renovar.",
    },
  },
  sections: {
    metaTitle: "Seções",
    title: "Seções",
    lead: "Escolha quais fotos do banco aparecem em cada parte da página, e em que ordem.",
    emptyBankTitle: "O banco de fotos está vazio",
    emptyBankText: "Envie as fotos em Fotos e volte aqui para atrelá-las às seções.",
    goToPictures: "Ir para Fotos",

    /**
     * As cinco seções, na ordem da página. `where` diz onde aparece;
     * `advice` é a recomendação de quantidade com o porquê; `ratio` é a
     * proporção em que a foto é recortada na tela (specs 006 e 007).
     */
    items: {
      hero: {
        name: "Banner geral",
        where: "A foto de fundo do topo da página, em tela cheia.",
        advice:
          "1 foto. É a imagem que mais pesa na velocidade de abertura — e a primeira coisa que a pessoa vê.",
        ratio:
          "Deitada, 16:9 ou 3:2, com pelo menos 1920 px de largura. Assunto no centro: no celular a tela é em pé e as laterais são cortadas.",
      },
      portfolio: {
        name: "Cordel de fotos",
        where: "Os prints pendurados no varal 3D (e a grade, nos aparelhos sem 3D).",
        advice:
          "7 fotos — uma por print. Misture em pé e deitadas; um número par de fotos em pé fecha a grade do celular.",
        ratio: "Em pé 4:5 (ou 3:4) · deitada 3:2. Cada uma vira um print no formato dela.",
      },
      video: {
        name: "Vídeo",
        where: "A seção “Foto congela. Vídeo devolve o movimento.” — o link do YouTube e a capa que aparece antes do play.",
        advice:
          "1 link do YouTube e, se quiser, 1 foto de capa. Sem capa, usa a miniatura do próprio YouTube. Sem vídeo, a capa aparece sozinha.",
        ratio: "Capa no formato do vídeo: 16:9 para vídeo comum, 9:16 para Shorts/Reels.",
      },
      about: {
        name: "Sobre",
        where: "A foto da seção “Oi, eu sou a Bigette.”",
        advice:
          "1 foto — da Bigette. Sem foto, fica o espaço reservado: um rosto qualquer no lugar do dela seria pior que o espaço vazio.",
        ratio: "Quadrada, 1:1. Rosto no centro: foto em pé perde topo e base; deitada, as laterais.",
      },
      closing: {
        name: "Última seção",
        where: "O anel de polaroides atrás do convite final.",
        advice: "12 fotos para nenhuma repetir.",
        ratio: "Quase quadrada (~1:1). Só o centro aparece: qualquer orientação serve.",
      },
    },
    ratioLabel: "Proporção",

    /** O estado de cada seção. Mesma aritmética de `sectionStatus` (domain/section.ts). */
    status: {
      empty: "Vazia — a página mostra as fotos provisórias.",
      emptyReserved: "Vazia — a página mostra o espaço reservado.",
      /** Foto na orientação que o enquadramento corta mais. */
      wrongOrientation: (n: number, preferred: "landscape" | "portrait") =>
        `${n === 1 ? "1 foto está" : `${n} fotos estão`} ${preferred === "landscape" ? "em pé" : "deitada"}${n === 1 ? "" : "s"}: ${n === 1 ? "vai" : "vão"} ser bem cortada${n === 1 ? "" : "s"} neste espaço.`,
      tooNarrow: (n: number, min: number) =>
        `${n === 1 ? "1 foto tem" : `${n} fotos têm`} menos de ${min} px de largura: pode ficar borrada em telas grandes.`,
      heroComplete: "Completa.",
      heroOverflow: (extra: number) =>
        `Só a primeira aparece. ${extra === 1 ? "A outra fica" : `As outras ${extra} ficam`} de reserva.`,
      filledWithDefaults: (count: number, defaults: number, toOwn: number) =>
        `Com ${count}, a seção é completada com ${defaults} foto${defaults === 1 ? "" : "s"} provisória${defaults === 1 ? "" : "s"}. ` +
        `Com mais ${toOwn}, passa a usar só as suas.`,
      repeating: (count: number, slots: number, toIdeal: number) =>
        `Com ${count}, as fotos se repetem para preencher os ${slots} lugares. Mais ${toIdeal} e nenhuma repete.`,
      complete: "Completa — nenhuma foto repete.",
      portfolioOverflow: (extra: number, slots: number) =>
        `${extra} a mais: o varal mostra as ${slots} primeiras; a grade sem 3D mostra todas.`,
      closingOverflow: (extra: number, slots: number) =>
        `${extra} a mais: só as ${slots} primeiras aparecem.`,
      oddPortraits:
        "Número ímpar de fotos em pé: a grade do celular fica com um buraco no fim. Uma a mais ou a menos resolve.",
      counts: (count: number, ideal: number) => `${count} de ${ideal}`,
    },

    list: {
      emptyTitle: "Nenhuma foto nesta seção",
      position: "Posição",
      dragHandle: "Arrastar para reordenar",
      moveUp: "Mover para antes",
      moveDown: "Mover para depois",
      remove: "Tirar da seção",
      saving: "Salvando…",
    },

    picker: {
      open: "Adicionar fotos",
      close: "Fechar",
      title: (section: string) => `Adicionar a ${section}`,
      lead: "Toque nas fotos para marcar. Entram no fim da seção, na ordem em que foram marcadas.",
      alreadyIn: "Já está",
      submit: (n: number) => (n === 1 ? "Adicionar 1 foto" : `Adicionar ${n} fotos`),
      submitting: "Adicionando…",
      allUsed: "Todas as fotos do banco já estão nesta seção.",
    },

    video: {
      title: "Link do vídeo",
      url: "Link do YouTube",
      urlHint: "Cole o link como vem do YouTube: youtube.com/watch?v=…, youtu.be/… ou youtube.com/shorts/…",
      format: "Formato",
      formats: { landscape: "Horizontal (16:9)", vertical: "Vertical (9:16 — Shorts/Reels)" },
      save: "Salvar vídeo",
      saving: "Conferindo no YouTube…",
      saved: "Vídeo salvo. Já está no site.",
      remove: "Tirar vídeo",
      removing: "Tirando…",
      current: "No site agora:",
      none: "Nenhum vídeo ainda. Sem vídeo, a seção mostra só a capa (ou o espaço reservado).",
      open: "Abrir no YouTube",
      validation: {
        urlRequired: "Cole o link do vídeo.",
        urlInvalid: "Não parece um link de vídeo do YouTube.",
        notFound: "O YouTube não encontrou este vídeo público. Confira se ele não é privado e se permite incorporação.",
        format: "Escolha o formato.",
      },
    },

    validation: {
      pictureGone: "Uma das fotos não existe mais no banco. Recarregue a página.",
      orderOutdated: "A seção mudou em outra aba ou dispositivo. Recarregue antes de reordenar.",
    },
  },


  profile: {
    metaTitle: "Perfil",
    title: "Perfil",
    lead: "Seus dados de acesso.",
    dataTitle: "Dados",
    dataLead: "Você pode entrar com o e-mail ou com o usuário.",
    saved: "Perfil atualizado.",
    passwordTitle: "Senha",
    passwordLead: "Ao trocar, todas as outras sessões abertas são encerradas.",
    passwordSaved: "Senha alterada. As outras sessões foram encerradas.",
    passwordSubmit: "Alterar senha",
  },

  fields: {
    name: "Nome",
    email: "E-mail",
    username: "Usuário",
    usernameHint: "3 a 30 caracteres: letras minúsculas, números, ponto, _ ou -. Começa com letra.",
    role: "Papel",
    password: "Senha",
    newPasswordOptional: "Nova senha",
    newPasswordOptionalHint: "Deixe em branco para manter a atual. Trocar encerra as sessões do usuário.",
    currentPassword: "Senha atual",
    newPassword: "Nova senha",
    confirmPassword: "Repita a nova senha",
    passwordHint: "Mínimo de 8 caracteres.",
  },

  users: {
    metaTitle: "Usuários",
    title: "Usuários",
    lead: "Admins têm acesso completo. Membros não gerenciam usuários.",
    new: "Novo usuário",
    newTitle: "Novo usuário",
    editTitle: "Editar usuário",
    created: "Usuário criado.",
    saved: "Alterações salvas.",
    you: "você",
    lastLogin: "Último acesso",
    createdAt: "Criado em",
    edit: "Editar",
    emptyTitle: "Nenhum usuário",
    danger: {
      title: "Excluir usuário",
      text: "A pessoa perde o acesso na hora. Não dá para desfazer.",
      button: "Excluir usuário",
      confirm: "Confirmar exclusão",
      deleting: "Excluindo…",
    },
    validation: {
      email: "Informe um e-mail válido.",
      emailTaken: "Este e-mail já está em uso.",
      username: "Use 3 a 30 caracteres: letras minúsculas, números, ponto, _ ou -, começando com letra.",
      usernameTaken: "Este usuário já está em uso.",
      nameTooLong: "Máximo de 80 caracteres.",
      role: "Escolha um papel.",
      passwordRequired: "Informe a senha.",
      passwordTooShort: "Mínimo de 8 caracteres.",
      passwordTooLong: "Senha longa demais (máximo de 72 bytes).",
      passwordMismatch: "As senhas não conferem.",
      currentPasswordWrong: "Senha atual incorreta.",
      notFound: "Usuário não encontrado.",
      lastAdmin: "Precisa existir pelo menos um admin.",
      cannotDeleteSelf: "Você não pode excluir a própria conta.",
    },
  },
} as const;
