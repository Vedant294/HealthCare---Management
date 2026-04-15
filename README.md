# Mint Health Hub

Healthcare Coordination & Crisis Management Dashboard with WhatsApp Appointment Booking.

## Tech Stack

- **Dashboard**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **WhatsApp Bot**: Python + Flask + Twilio
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel (dashboard) + any Python host (bot)

## Project Structure

```
mint-health-hub/
├── src/                    # React dashboard
│   ├── components/         # UI components
│   ├── context/            # Auth & App state
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Supabase client, utils
│   └── pages/              # All pages
├── Samparkproject/         # WhatsApp bot
│   ├── hospital_bot_v2.py  # Main bot
│   ├── supabase_db.py      # Database layer
│   ├── languages.py        # Multilingual messages
│   ├── reminder_scheduler.py
│   └── requirements.txt
└── public/
```

## Setup

### 1. Environment Variables

Create `.env` in root:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create `Samparkproject/.env`:
```env
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Install & Run Dashboard

```bash
npm install
npm run dev
```

### 3. Run WhatsApp Bot

```bash
cd Samparkproject
pip install -r requirements.txt
python hospital_bot_v2.py
```

### 4. Expose Bot via ngrok

```bash
cd Samparkproject
./ngrok.exe http 5000
```

Set the ngrok URL as Twilio webhook: `https://your-url.ngrok.io/whatsapp`

## Features

- Patient, Doctor, Appointment management
- Emergency Queue & Crisis Panel
- Resource tracking (Beds, Oxygen, Blood, Ventilators)
- WhatsApp appointment booking (English, Hindi, Marathi)
- Automated appointment reminders
- Reports & Analytics
- PDF Export
- Dark mode
