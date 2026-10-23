# Family Directory Website (કુટુંબ ડિરેક્ટરી)

A clean, minimal, responsive web application to maintain and display family records, member profiles, and ancestral connections.

Built with **React.js + Vite**, **CSS**, **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage**, configured for deployment on **Vercel**.

---

## 🌟 Key Features

### 1. Public Directory & Navigation
- **Homepage**: Clean, minimal, without banners or unnecessary footers.
- **Directory Statistics**: Live counter showing Total Families (*કુલ કુટુંબ*) and Total Members (*કુલ સભ્યો*).
- **Family Cards**: Displays Family Head (*કુટુંબના વડાનું પૂરું નામ*), Original Village (*મૂળ ગામ*), Mataji Madh (*હકનું માતાજીનું મઢ સ્થળ*), and member count.
- **Family Details Page**:
  - Highlights Family Head information at the top.
  - Lists all associated family members (with the head placed first).
  - Shows relationship with head, age, occupation, and maternal roots.
- **Member Profile Page**:
  - Full name, profile photo, relationship with head, birth date, and auto-calculated age.
  - Education, occupation/business, workplace address.
  - Maternal roots: Maternal Surname (*મોસાળની અટક*) and Maternal Village (*મોસાળનું ગામ*).
  - Privacy controls: Mobile number and residential address can be made private from public view.

### 2. Fast Multi-Field Search
Search instantly across:
- Member full name
- Family head's name
- Original village (*મૂળ ગામ*)
- Maternal surname (*મોસાળની અટક*)
- Maternal village (*મોસાળનું ગામ*)
- Occupation or business (*વ્યવસાય / નોકરી*)
- Education

### 3. Administrator Portal (`/admin`)
- **Authentication**: Secure Firebase Authentication (Email/Password).
- **Admin Dashboard**: Directory statistics, quick actions, and recent records.
- **Add Kutumb (Family Creation Form)**:
  - Registers *Kutumb na Vda nu Purunam*, *Mul Gam*, and *Mataji nu Madh Sthal*.
  - **Single Source of Truth**: Automatically creates the corresponding member record for the family head so the head is never duplicated.
  - Optional initial personal details for the head.
- **Add & Manage Members**:
  - Add any number of relatives (sons, daughters, spouse, parents, grandchildren, etc.).
  - Free-text relationship entry for unique family relationships.
  - Profile photo uploads with file size (<5MB) and mime-type validation.
- **Cascading Deletion Policy**:
  - Deleting a family automatically removes all associated members to avoid orphaned database records.

### 4. Dual-Mode Architecture (Production & Demo)
- When Firebase environment variables are provided, the app connects directly to Cloud Firestore, Firebase Auth, and Storage.
- When run locally without Firebase credentials, the application seamlessly activates an **offline demo mode** backed by `localStorage` with pre-seeded Gujarati family records and demo administrator credentials (`admin@family.org` / `admin123`).

---

## 📁 Project Structure

```text
family-directory/
├── public/
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx    # Modal dialog for delete confirmations
│   │   ├── FamilyCard.jsx      # Clickable family summary card
│   │   ├── FormField.jsx       # Reusable form field with Gujarati labels
│   │   ├── Header.jsx          # Minimal site header & navigation
│   │   ├── MemberCard.jsx      # Member card with avatar & relationship
│   │   ├── ProtectedRoute.jsx  # Route guard for admin-only pages
│   │   └── SearchBar.jsx       # Real-time search bar
│   ├── context/
│   │   └── AuthContext.jsx     # Firebase auth context & state provider
│   ├── data/
│   │   └── initialData.js      # Seed data with realistic Gujarati families
│   ├── forms/
│   │   ├── FamilyForm.jsx      # Form to create or update Kutumb & Head
│   │   └── MemberForm.jsx      # Form to add or edit family members
│   ├── pages/
│   │   ├── AddFamilyPage.jsx   # /admin/families/new
│   │   ├── AddMemberPage.jsx   # /admin/families/:familyId/members/new
│   │   ├── AdminDashboard.jsx  # /admin
│   │   ├── AdminLogin.jsx      # /admin/login
│   │   ├── EditFamilyPage.jsx  # /admin/families/:familyId/edit
│   │   ├── EditMemberPage.jsx  # /admin/members/:memberId/edit
│   │   ├── FamilyDetails.jsx   # /family/:familyId
│   │   ├── Home.jsx            # /
│   │   ├── ManageFamilies.jsx  # /admin/families
│   │   ├── ManageMembers.jsx   # /admin/members
│   │   └── MemberDetails.jsx   # /member/:memberId
│   ├── services/
│   │   ├── authService.js      # Sign-in, sign-out, session handling
│   │   ├── familyService.js    # Families Firestore CRUD & atomic batching
│   │   ├── firebase.js         # Firebase App initialization
│   │   ├── localStore.js       # Offline storage provider
│   │   ├── memberService.js    # Members Firestore CRUD & search queries
│   │   └── storageService.js   # Photo uploads with size & type validation
│   ├── utils/
│   │   ├── calculateAge.js     # Dynamic age calculator from DOB
│   │   ├── formatDate.js       # User-friendly date formatter
│   │   └── searchFilter.js     # Multi-field search tokenizer
│   ├── App.jsx                 # Routing configuration
│   ├── index.css               # Clean, minimal CSS design system
│   └── main.jsx
├── firestore.rules             # Cloud Firestore security rules
├── firestore.indexes.json      # Cloud Firestore indexes
├── storage.rules               # Firebase Storage security rules
├── vercel.json                 # SPA rewrite rules for Vercel deployment
├── .env.example                # Environment variables template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 18+ or 20+)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone <your-repository-url>
cd "Family tree"

# Install dependencies
npm install
```

### 3. Running Locally (Demo Mode)
To run immediately using the built-in demo dataset and mock authentication:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Admin Login Demo Credentials**:
  - Email: `admin@family.org`
  - Password: `admin123`

---

## 🔒 Firebase Configuration

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password provider).
3. Enable **Cloud Firestore** and deploy `firestore.rules` and `firestore.indexes.json`.
4. Enable **Firebase Storage** and deploy `storage.rules`.
5. Create an administrator document in Firestore under `admins/{uid}` with `{ "role": "admin" }` where `{uid}` is your Firebase Auth user UID.
6. Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

---

## ☁️ Deployment on Vercel

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set Build and Output settings (Framework: **Vite**).
5. Add the environment variables (`VITE_FIREBASE_*`) in the Vercel Dashboard under **Project Settings > Environment Variables**.
6. Deploy! The included `vercel.json` ensures that client-side SPA routes (e.g., `/family/fam-01`, `/member/mem-01`, `/admin`) route correctly to `index.html` without 404 errors.
7. In Firebase Console, add your Vercel deployment domain to **Authentication > Settings > Authorized Domains**.

---

## 🛡️ Security & Privacy Design

- **Firestore Rules**: Enforce that unauthenticated and public visitors can only read documents where `isPublic == true`. Only users verified in the `admins` collection can create, update, or delete.
- **Field-Level Privacy**: Mobile numbers and residential addresses have dedicated privacy flags (`isPublicMobile`, `isPublicAddress`). If not marked public, they are masked from the public view and only accessible to administrators.
- **Storage Rules**: Only administrators can upload images. Validates that uploads do not exceed 5MB and must have `image/jpeg`, `image/png`, or `image/webp` MIME types.
- **No Client Secrets Exposed**: No Firebase Admin SDK private keys or server credentials are ever included in the client bundle.
