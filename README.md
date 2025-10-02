# TimeSheet - System Rozliczeń B2B

System do zarządzania rozliczeniami pracy B2B z obsługą klientów, zamówień i dokumentów rozliczeniowych.

## 📋 Funkcjonalności

### 🏢 Zarządzanie Klientami
- Dodawanie, edytowanie i usuwanie klientów
- Automatyczne pobieranie danych firmy po NIP z API GUS
- Zarządzanie osobami kontaktowymi dla każdego klienta
- Przechowywanie danych: nazwa, NIP, email, telefon

### 📦 Zarządzanie Zamówieniami
- Tworzenie zamówień z wieloma typami prac:
  - Konsultacje telefoniczne
  - Prace podstawowe OPEX
  - Prace podstawowe CAPEX
- Definiowanie stawek i limitów godzin dla każdego typu pracy
- Statusy zamówień: aktywne, nieaktywne, archiwalne
- Załączniki do zamówień (PDF, max 1.5MB)
- Powiązanie z klientem i osobą kontaktową

### 💰 Rozliczenia
- Tworzenie miesięcznych rozliczeń
- Automatyczne obliczanie wartości na podstawie przepracowanych godzin i stawek
- Kontrola limitów godzin dla każdego typu pracy
- Kopiowanie pozycji z poprzednich rozliczeń (szablon)
- Automatyczne sprawdzanie dostępności godzin

### 📄 Dokumenty Rozliczeniowe
- Dodawanie par dokumentów (Faktura + POZ) dla każdego zamówienia
- Drag & drop do wgrywania plików PDF
- Automatyczne łączenie dokumentów w kolejności: Faktura → POZ
- Podgląd i pobieranie połączonych PDF dla każdej pary
- Przechowywanie dokumentów w bazie danych (PostgreSQL)

### 🎨 Interfejs
- Responsywny design (desktop i mobile)
- Tryb ciemny / jasny
- Intuicyjny interfejs użytkownika
- Tabele z danymi z możliwością edycji

## 🛠️ Technologie

### Frontend
- **React 18** z TypeScript
- **Vite** - szybkie budowanie
- **Tailwind CSS** - stylowanie
- **pdf-lib** - łączenie dokumentów PDF

### Backend
- **Node.js** z Express
- **TypeScript**
- **Prisma ORM** - zarządzanie bazą danych
- **PostgreSQL** - baza danych
- API GUS - pobieranie danych firm po NIP

### Deployment
- **Docker** i **Docker Compose**
- **Nginx** - serwer HTTP dla frontendu
- Kontenery: Frontend, Backend, PostgreSQL

## 📦 Instalacja

### Wymagania
- Docker
- Docker Compose
- Git

### Kroki instalacji

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/zeusjoan/TimeSheet.git
cd TimeSheet
```

2. **Skonfiguruj zmienne środowiskowe**

Utwórz plik `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@db:5432/b2bapp"
PORT=3001
NODE_ENV=production
```

3. **Uruchom aplikację**
```bash
docker-compose up --build -d
```

4. **Sprawdź status kontenerów**
```bash
docker-compose ps
```

Wszystkie kontenery powinny być w stanie "Up".

5. **Otwórz aplikację**

Przejdź do: **http://localhost:8080**

## 🗄️ Struktura Projektu

```
TimeSheet/
├── components/              # Komponenty React UI
│   ├── icons/              # Ikony SVG
│   ├── layout/             # Layout (Sidebar, Layout)
│   └── ui/                 # Podstawowe komponenty UI
├── pages/                  # Strony aplikacji
│   ├── Dashboard.tsx       # Dashboard
│   ├── Clients.tsx         # Zarządzanie klientami
│   ├── Orders.tsx          # Zarządzanie zamówieniami
│   └── Settlements.tsx     # Rozliczenia
├── hooks/                  # Custom React hooks
│   └── useAppData.ts       # Hook do zarządzania danymi
├── contexts/               # React contexts
│   └── ThemeContext.tsx    # Tryb ciemny/jasny
├── backend/
│   ├── src/
│   │   ├── routes/         # Endpointy API
│   │   │   ├── clients.ts
│   │   │   ├── orders.ts
│   │   │   ├── settlements.ts
│   │   │   ├── settlementDocuments.ts
│   │   │   ├── monthlyDocuments.ts
│   │   │   └── nip.ts      # API GUS
│   │   └── server.ts       # Serwer Express
│   ├── prisma/
│   │   ├── schema.prisma   # Schemat bazy danych
│   │   └── migrations/     # Migracje
│   └── Dockerfile
├── docker-compose.yml      # Konfiguracja Docker
├── Dockerfile.frontend     # Frontend Dockerfile
└── README.md
```

## 🔌 API Endpoints

### Klienci
- `GET /api/clients` - Lista klientów
- `POST /api/clients` - Dodaj klienta
- `PUT /api/clients/:id` - Aktualizuj klienta
- `DELETE /api/clients/:id` - Usuń klienta

### Zamówienia
- `GET /api/orders` - Lista zamówień
- `POST /api/orders` - Dodaj zamówienie
- `PUT /api/orders/:id` - Aktualizuj zamówienie
- `DELETE /api/orders/:id` - Usuń zamówienie

### Rozliczenia
- `GET /api/settlements` - Lista rozliczeń
- `POST /api/settlements` - Dodaj rozliczenie
- `PUT /api/settlements/:id` - Aktualizuj rozliczenie
- `DELETE /api/settlements/:id` - Usuń rozliczenie

### Dokumenty Rozliczeń
- `GET /api/settlement-documents/:settlementId` - Pobierz dokumenty rozliczenia
- `POST /api/settlement-documents` - Dodaj/zaktualizuj dokument
- `DELETE /api/settlement-documents/:id` - Usuń dokument

### Dane firm
- `GET /api/company-data/:nip` - Pobierz dane firmy po NIP (API GUS)

## 🗃️ Baza Danych

System wykorzystuje PostgreSQL z następującymi tabelami:
- `Client` - Klienci
- `Contact` - Osoby kontaktowe
- `Order` - Zamówienia
- `OrderItem` - Pozycje zamówień (typy prac)
- `Attachment` - Załączniki do zamówień
- `Settlement` - Rozliczenia miesięczne
- `SettlementItem` - Pozycje rozliczeń
- `SettlementDocument` - Dokumenty rozliczeń (Faktura + POZ)
- `MonthlyDocument` - Dokumenty miesięczne (legacy)

## 🐳 Docker

### Kontenery

1. **db** (PostgreSQL:13)
   - Port: 5432
   - Przechowuje wszystkie dane aplikacji
   - Volume: `db_data` (trwałe przechowywanie)

2. **backend** (Node.js + Express)
   - Port: 3001
   - API Server z Prisma ORM

3. **frontend** (React + Nginx)
   - Port: 8080
   - Serwuje aplikację React
   - Nginx przekierowuje `/api/*` do backendu

### Komendy Docker

```bash
# Uruchom aplikację
docker-compose up -d

# Zatrzymaj aplikację
docker-compose down

# Przebuduj kontenery
docker-compose up --build -d

# Zobacz logi
docker-compose logs -f

# Zobacz logi konkretnego kontenera
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Sprawdź status
docker-compose ps
```

## 🔧 Rozwój

### Praca lokalna (bez Docker)

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Frontend
```bash
npm install
npm run dev
```

### Dodawanie migracji bazy danych

```bash
cd backend
npx prisma migrate dev --name nazwa_migracji
```

## 📝 Licencja

Projekt prywatny - wszystkie prawa zastrzeżone.

## 👤 Autor

Joan Zeus

## 🤝 Wsparcie

W przypadku problemów lub pytań, utwórz issue w repozytorium GitHub.

---

**Wersja:** 1.0.0  
**Ostatnia aktualizacja:** Październik 2025
