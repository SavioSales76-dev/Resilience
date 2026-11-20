// Conteúdo pendente: trocar os placeholders quando o cliente enviar.
// Número do WhatsApp: código do país (55) + DDD + número. Pode ter espaço ou traço:
// o link usa só os dígitos.
const WHATSAPP_NUMBER = '55 88 99291-6126'
const WHATSAPP_TEXT = 'Olá! Vim pelo site e quero saber mais sobre a gestão de redes.'

export const site = {
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
  // Sem os parâmetros de rastreio do QR code (?hvrq=…&utm_source=qr).
  instagramUrl: 'https://www.instagram.com/somosresilience/',
  instagramHandle: '@somosresilience',
  phoneLabel: '(88) 99291-6126',
  atuacao: ['Atendimento regional', 'Seg. a sex., horário comercial'], // TODO: provisório
  nav: [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Cases', href: '#cases' },
    { label: 'Contato', href: '#contato' },
  ],
  // TODO: os 3 cases reais. Imagem 16:9, mín. 2880 × 1620, assunto centralizado
  // com área segura de ~4:3; `image: null` mostra o placeholder do Figma.
  cases: [
    { name: 'Cliente 01', segment: 'Segmento', image: null, href: '#' },
    { name: 'Cliente 02', segment: 'Segmento', image: null, href: '#' },
    { name: 'Cliente 03', segment: 'Segmento', image: null, href: '#' },
  ],
}
