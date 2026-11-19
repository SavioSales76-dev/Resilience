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
}
