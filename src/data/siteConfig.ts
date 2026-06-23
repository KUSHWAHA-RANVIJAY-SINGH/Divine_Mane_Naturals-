export const siteConfig = {
  name: 'Divine Mane Naturals',
  tagline: 'Natural Hair Care, Rooted in Moringa',
  description: 'Shop Divine Mane Naturals — sulphate-free shampoo, deep conditioners, butter creams, and growth oils enriched with moringa. Handcrafted in Chisamba Town, Zambia.',
  phone: '+260974572834',
  email: 'divinemanenaturals@gmail.com',
  address: '89 New Location, Chisamba Town, Zambia',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  socials: {
    instagram: 'https://instagram.com/divinemanenaturals',
    facebook: 'https://facebook.com/divinemanenaturals',
  },
  emailJs: {
    serviceId: 'service_divinemane', // Placeholder
    templateId: 'template_divinemane', // Placeholder
    publicKey: 'user_divinemane_key', // Placeholder
  },
  theme: {
    colors: {
      primary: '#1b4d3e', // Forest Green
      secondary: '#c5a059', // Antique Gold
      accent: '#e3b85a', // Warm Yellow-Gold
      lightBg: '#faf9f6', // Warm Off-White / Alabaster
      darkText: '#1c2826', // Deep charcoal green
    }
  }
};
