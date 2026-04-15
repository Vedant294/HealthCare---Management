# Mint Health Hub

Healthcare Coordination & Crisis Management Dashboard with WhatsApp Appointment Booking.

🌐 **Live Demo**: [https://health-care-management-pink.vercel.app](https://health-care-management-pink.vercel.app)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@minthealthhub.com | Admin@1234 |
| Doctor | doctor1@minthealthhub.com | Doctor@1234 |
| Doctor | doctor2@minthealthhub.com | Doctor@1234 |
| Nurse | nurse1@minthealthhub.com | Nurse@1234 |

## Features

- Patient, Doctor, Appointment management
- Emergency Queue & Crisis Panel
- Resource tracking (Beds, Oxygen, Blood, Ventilators)
- WhatsApp appointment booking (English, Hindi, Marathi)
- Automated appointment reminders via WhatsApp
- Reports & Analytics with PDF export
- Audit logs for all actions
- Dark mode support

## Tech Stack

- **Dashboard**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **WhatsApp Bot**: Python + Flask + Twilio
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Project Structure

```
mint-health-hub/
├── src/
│   ├── components/         # UI components (layout, shared, shadcn)
│   ├── context/            # Auth & App state (React Context)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Supabase client, PDF export, utils
│   └── pages/              # All dashboard pages
├── Samparkproject/         # WhatsApp bot
│   ├── hospital_bot_v2.py  # Main Flask bot
│   ├── supabase_db.py      # Database operations
│   ├── languages.py        # English, Hindi, Marathi messages
│   ├── reminder_scheduler.py # Automated reminders
│   └── requirements.txt
└── public/
```

## Database Tables (13 total)

| Table | Purpose |
|-------|---------|
| hospitals | 8 hospital records |
| users | Staff profiles |
| admins | Admin permissions |
| patients | Patient records |
| doctors | Doctor profiles |
| appointments | WhatsApp + manual bookings |
| resources | Beds, oxygen, blood, ventilators |
| emergency_cases | Emergency queue |
| service_requests | Resource requests between hospitals |
| notifications | Hospital alerts |
| audit_logs | System activity logs |
| user_states | WhatsApp bot conversation state |
| user_languages | WhatsApp user language preference |

## Local Setup

### Dashboard
```bash
npm install
npm run dev
```

### WhatsApp Bot
```bash
cd Samparkproject
pip install -r requirements.txt
python hospital_bot_v2.py
```

### Expose Bot via ngrok
```bash
cd Samparkproject
./ngrok.exe http 5000
```
Set ngrok URL as Twilio webhook: `https://your-url.ngrok-free.app/whatsapp`

## Environment Variables

`.env` in root:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`Samparkproject/.env`:
```env
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```
