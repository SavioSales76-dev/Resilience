// Conteúdo pendente: trocar os placeholders quando o cliente enviar.
const WHATSAPP_NUMBER = '55DDDNUMERO' // TODO: número real
const WHATSAPP_TEXT = 'Olá! Vim pelo site e quero saber mais sobre a gestão de redes.'

export const site = {
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
  instagramUrl: 'https://instagram.com/resilience', // TODO: @ real
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
