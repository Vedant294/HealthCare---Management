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
Here's how you say it in an interview, naturally:

"How is your frontend connected to the backend?"
"So our frontend and backend are not directly connected through any REST API. Instead, both of them talk to the same Supabase database. The React app uses the Supabase JavaScript client to read and write data, and the Python bot uses the Supabase Python client to do the same. So Supabase acts as the middle layer between both systems."

"How does WhatsApp fit into this?"
"We used Twilio as the WhatsApp gateway. When a patient sends a message on WhatsApp, Twilio receives it and forwards it as an HTTP POST request to our Flask server. In development we used ngrok to expose our local server to the internet so Twilio can reach it. The Flask bot processes the message, figures out what the user wants based on their conversation state, and sends a reply back through Twilio to WhatsApp."

"So when a patient books via WhatsApp, how does it show on the dashboard?"
"When the bot completes a booking, it inserts a new row into the appointments table in Supabase with the source marked as whatsapp. The React dashboard fetches from that same appointments table. So the appointment just appears on the dashboard automatically — no extra API call needed between the two systems."

"How do reminders work?"
"We have a separate Python script called reminder_scheduler that runs independently. It uses the schedule library to check every hour for appointments that are happening tomorrow, have reminders enabled, and haven't been sent yet. When it finds one, it calls the Twilio API directly to send a WhatsApp message to the patient. After sending, it marks reminder_sent as true in Supabase so it doesn't send again."

"Why did you choose this architecture — no direct API between frontend and backend?"
"Honestly it keeps things simple. Since both systems are just reading and writing to the same database, we didn't need to build and maintain a separate API layer. Supabase gives us authentication, database, and real-time capabilities out of the box. The only external service we needed to integrate was Twilio for WhatsApp messaging."

If they ask a follow-up: "What would you improve?"
"Right now the dashboard refreshes data only on page load or when an action is taken. I would add Supabase real-time subscriptions so when the bot creates a new appointment, the dashboard updates instantly without any manual refresh. That would make it truly real-time."

Credits used: 0.18
Elapsed time: 21s


Checkpoint
Restore
interview q & A  1. tell me about thsi project , intro 2. architecture 3. databse and modules 4. amd best intro of this project 

Kiro
Here's your complete interview Q&A, ready to speak:

1. Tell me about this project
"I built a Healthcare Coordination and Crisis Management platform called Mint Health Hub. It has two parts — a React dashboard for hospital staff and a WhatsApp bot for patients.

The idea is simple. Hospital staff can manage appointments, track patients, monitor resources like beds, oxygen, blood units and ventilators, handle emergency cases, and even send resource requests to other hospitals during a crisis. On the patient side, they don't need to download any app — they just WhatsApp the hospital number, book an appointment in their language, and get a reminder the day before.

The whole system is connected through Supabase as the shared database, so whatever a patient books on WhatsApp instantly shows up on the hospital dashboard."

2. Architecture
"The architecture has three layers.

First is the React frontend — built with React, TypeScript, Vite, and Tailwind. It talks directly to Supabase using the Supabase JS client. There's no custom REST API on the frontend side.

Second is the Python backend — a Flask server that acts as the WhatsApp bot. When a patient messages on WhatsApp, Twilio receives it and sends an HTTP POST to our Flask webhook. The bot processes the message, manages the conversation state, and replies back through Twilio.

Third is Supabase — this is the bridge between both systems. The React app reads and writes to it, the Python bot reads and writes to it. They never talk to each other directly. Supabase handles the database, authentication, and session management.

There's also a fourth piece — a reminder scheduler, which is a separate Python process that runs every hour, checks for tomorrow's appointments, and sends WhatsApp reminders via Twilio."

3. Database and Modules
"We used Supabase which is built on PostgreSQL. The main tables are:

appointments — shared between the bot and dashboard, has a source field to know if it came from WhatsApp or the dashboard
patients, doctors, resources — core hospital data, all filtered by hospital_id
emergency_cases — for the emergency queue module
service_requests — when one hospital requests resources from another
notifications and audit_logs — for alerts and tracking every action
user_states and user_languages — used by the bot to remember where each patient is in the conversation and what language they prefer
On the frontend, data is managed through two React Contexts. AuthContext handles login, signup, session, and user profile using Supabase Auth. AppContext fetches all the hospital data once the user logs in and exposes it to every page. Every page is a protected route — if you're not logged in, you get redirected to the login page.

The modules in the dashboard are — Appointments, Patients, Doctors, Resources, Emergency Queue, Crisis Panel, Service Requests, Reports, Notifications, and Audit Logs."

4. Best Intro (for opening statement or HR round)
"I built Mint Health Hub — a full-stack healthcare management platform that solves a real problem. Most hospital management systems require patients to use an app or a website, which creates friction. We removed that by letting patients book appointments directly on WhatsApp in their own language — English, Hindi, or Marathi.

On the hospital side, staff get a real-time dashboard to manage everything — from patient records and doctor availability to ICU bed counts and blood bank levels. When resources go critical, the system alerts the staff and they can raise a service request to another hospital directly from the dashboard.

Technically, I used React with TypeScript for the frontend, Python Flask for the WhatsApp bot, Twilio for messaging, and Supabase as the shared database that connects everything together. The interesting design decision was using Supabase as the integration layer — so the bot and the dashboard stay completely decoupled but always in sync."

That last intro is your strongest opener — use it when they say "tell me about yourself" or "walk me through your project
