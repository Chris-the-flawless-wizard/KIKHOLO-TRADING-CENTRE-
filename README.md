# ✨ CHRISXCHANGE

<p align="center">
  <img src="https://img.shields.io/badge/Brand-CHRISXCHANGE-111827?style=for-the-badge">
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge">
</p>

<p align="center">
  <strong>CONNECT • DISCOVER • TRADE</strong><br>
  Everything You Need. One Powerful Marketplace.
</p>

---

## 🌍 About CHRISXCHANGE

**CHRISXCHANGE** is a modern digital marketplace built to connect businesses, customers, products, services, and opportunities in one attractive platform.

The project has evolved from the original **CHRIS' KIKHOLO TRADING HUB** branding into **CHRISXCHANGE**, with a stronger focus on a polished marketplace experience, account authentication, business discovery, product catalogues, and social-style trade content.

---

## ✨ Current Platform Features

### 🏠 Home & Marketplace

- Modern CHRISXCHANGE branding and logo
- Responsive homepage
- **Connect • Discover • Trade** hero section
- Featured business discovery
- Business/category cards
- Product catalogue integration
- Online category imagery
- Search and marketplace navigation
- Dark/light interface support

### 🏪 Business & Product Discovery

The marketplace is organized around categories such as:

- Electronics
- Phones & Accessories
- Computers
- Furniture
- Hardware
- Fashion
- Transport
- Retail Shops
- Supermarkets
- Restaurants
- Pharmacies
- Agriculture
- Education
- Health Services

The catalogue is designed to keep products connected to their relevant businesses and categories rather than displaying unrelated or duplicated content.

### 🔐 Accounts & Authentication

CHRISXCHANGE uses **Supabase Auth** for account functionality.

The current authentication work includes:

- Email/password registration
- Email/password login
- Supabase Auth integration
- Password recovery
- Reset-password flow
- Account/session handling
- Authentication-aware CHRISXCHANGE features

> **Note:** Email confirmation and Supabase project settings must be correctly configured in the connected Supabase project for account verification emails and confirmed-account login to work.

### 💬 CHRISXCHANGE Chats

The platform includes a dedicated chat experience designed around logged-in CHRISXCHANGE users.

Current chat work includes:

- Chats entry point from the website
- User directory/friend discovery
- One-to-one conversation interface
- Chat controls and connection-state handling
- Chat preview/interface improvements
- Supabase-backed account context

The chat system is being developed toward a social, student-friendly experience where users can connect with friends and eventually create groups.

### 🎬 CHRISXCHANGE Reels

CHRISXCHANGE includes a full-screen short-video experience for trade and business content.

Current Reels work includes:

- Full-screen Reels feed
- Trade/business short-video content
- Direct **TikTok player** integration
- TikTok URL parsing and embed handling
- YouTube discovery/content support
- Reel creation/upload entry point
- Supabase-backed Reel storage work
- Likes and comments support
- External video sources
- Empty/loading/error states
- Mobile-friendly Reels presentation

The Reels system is intended to bring relevant short-form business and trading content into CHRISXCHANGE rather than simply sending users away from the marketplace.

---

## 🗄️ Supabase Integration

Supabase is used as the backend service for CHRISXCHANGE features that require persistent data and authentication.

Planned/active backend areas include:

- Authentication
- User profiles
- Product catalogue data
- Realtime chat data
- Reels data
- Reel media storage
- Likes and comments
- Persistent user-generated content

The connected Supabase project is used by the CHRISXCHANGE frontend through the Supabase client.

### ⚠️ Supabase configuration

For authentication and database-backed features to work correctly, the Supabase project must have the required:

- Authentication settings
- Email provider settings
- Redirect URLs
- Database tables
- Row Level Security policies
- Storage configuration
- Realtime configuration where required

Do not commit private Supabase service-role keys or other secrets to this repository.

---

## 🧱 Project Structure

The repository is a frontend-focused web project. Its structure includes the main site, feature pages, styles, scripts, assets, and supporting configuration.

Important current files/features include:

```
KIKHOLO-TRADING-CENTRE-/
│
├── index.html
├── reels.html
├── style.css
├── search.css
│
├── assets/
│   └── chrisxchange-logo.svg
│
├── index%20html/
│   └── reset-password.html
│
├── Reels / marketplace scripts
├── Supabase-connected frontend scripts
└── README.md
```

> The repository has evolved over time, so the exact file list can change as CHRISXCHANGE features are added or reorganized.

---

## 💻 Technologies

### Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Google Fonts
- Responsive web design
- Embedded external video players

### Backend / Services

- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Realtime
- GitHub
- GitHub Pages / compatible static hosting
- Vercel-compatible deployment

### Content Sources

- TikTok video players/embeds
- YouTube content/discovery
- Online business/category imagery

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Chris-the-flawless-wizard/KIKHOLO-TRADING-CENTRE-.git
```

### 2. Enter the project

```bash
cd KIKHOLO-TRADING-CENTRE-
```

### 3. Run the site

For the static frontend, open `index.html` in a browser or use **Live Server** in Visual Studio Code.

For deployed versions, use the repository's configured GitHub/Vercel deployment.

---

## 📱 Responsive Experience

CHRISXCHANGE is designed to work across:

- 📱 Mobile phones
- 📲 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

The Reels experience is especially designed around a mobile-friendly, full-screen video layout.

---

## 🛍️ Marketplace Vision

CHRISXCHANGE is being developed toward a complete marketplace where users can:

1. Discover businesses.
2. Browse products and services.
3. Search by category.
4. Open individual business/store information.
5. Create an account.
6. Connect with other users.
7. Chat with friends and marketplace users.
8. Discover business-related short videos.
9. Share their own content.
10. Eventually buy, sell, and manage marketplace activity from one platform.

---

## 🗺️ Development Roadmap

### Completed / Implemented Areas

- [x] CHRISXCHANGE branding
- [x] Modern homepage
- [x] Featured business/category presentation
- [x] Product catalogue integration work
- [x] Supabase client integration
- [x] Supabase Auth integration
- [x] Password recovery/reset flow
- [x] CHRISXCHANGE Chats interface
- [x] Chat connection-state handling
- [x] Reels page
- [x] TikTok player integration
- [x] TikTok URL/creator parsing improvements
- [x] YouTube content/discovery support
- [x] Supabase Reel storage work
- [x] Reel likes/comments work

### In Active Development

- [ ] Reliable end-to-end email confirmation
- [ ] Complete login/session experience
- [ ] Friend management
- [ ] Group chats
- [ ] Complete user-generated Reel publishing flow
- [ ] Business registration
- [ ] Product upload/management
- [ ] Advanced product search and filtering
- [ ] Shopping cart
- [ ] Checkout
- [ ] Mobile Money/payment integration
- [ ] Business reviews
- [ ] Notifications
- [ ] Order tracking
- [ ] Admin dashboard
- [ ] Progressive Web App (PWA)

---

## 🔒 Security

Never place private credentials, service-role keys, passwords, or other secrets in frontend code or public GitHub files.

Supabase Row Level Security should be used for protected tables and user-owned data.

---

## 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the feature.
5. Commit your changes.
6. Push the branch.
7. Open a Pull Request.

---

## 👨‍💻 Developer

**Chris Mukhwana**

Creator and developer of **CHRISXCHANGE**.

---

## 🌟 Vision

> **CHRISXCHANGE — Connect. Discover. Trade.**

The long-term goal is to create a modern digital marketplace where businesses, customers, creators, and communities can discover opportunities, communicate, showcase products, and trade through one connected platform.

---

## ⭐ Support the Project

If you like CHRISXCHANGE:

- ⭐ Star the repository
- 🍴 Fork the project
- 💡 Suggest improvements
- 🛠️ Contribute features
- 📢 Share the project

**CHRISXCHANGE is continuously evolving.**
