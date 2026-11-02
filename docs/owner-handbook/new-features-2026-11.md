# Salsa Explosion & RitmoFlow: Studio Owner Handbook
**November 2026 Edition — New ICAIC Features & Operations Guide**  
**Author:** Engineering Team  
**Audience:** Maestro Enrique Perez & Salsa Explosion Faculty  

---

## Welcome to Your New Digital Academy

Over the past weeks, Salsa Explosion and RitmoFlow have undergone a complete visual and operational transformation. The entire platform now celebrates the authentic 1960s–70s Cuban ICAIC silkscreen poster aesthetic—built with paper tones, deep charcoal ink, bold poster red, warm mustard, and Caribbean teal. 

More importantly, the platform has been streamlined around how you actually run your academy in Bournemouth. Everything is simpler, faster, and built around your dancers' experience both on the dance floor and practicing at home.

This handbook explains each new feature in plain English, with no technical jargon, so you and your team can get the most out of your tools starting tonight.

---

## 1. The Three Doors of Salsa Explosion

When dancers visit the website or open the app on their phones, they no longer face confusing menus. Everything sits behind **three primary doors**, plus their personal **Carnet**:

```
[ Clases ]  ·  [ Canciones ]  ·  [ Fiestas ]  ·  [ Mi carnet ]
```

### Door 1: Clases (Classes)
- **What it is:** The complete guide to your regular weekly teaching schedule.
- **What dancers find:** The weekly cartelera timetable for Thursday and Sunday nights at BOH Studios, detailed venue arrival directions, teacher profiles, and clear door pricing.
- **Where it leads:** `/dashboard/schedule` and `/venues`.

### Door 2: Canciones (Songs & Practice)
- **What it is:** The dancer's training ground. 
- **What dancers find:** Inside this door are three interconnected tabs:
  1. **Música (`/music`):** The interactive Cuban music player with real-time section breakdowns (Intro, Verso, Coro-Pregón, Mambo, Despelote), visual clave guides, and tempo tools.
  2. **Rueda (`/dashboard/rueda`):** The complete dictionary of Cuban rueda calls, hand signals, and caller terminology.
  3. **Pasos (`/moves`):** The official academy move library showing how to dance each figure step-by-step.
- **Where it leads:** `/music`, `/dashboard/rueda`, and `/moves`.

### Door 3: Fiestas (Festivals & Parties)
- **What it is:** Your special events showcase.
- **What dancers find:** The annual Bournemouth Cuban Salsa Congress, holiday weekenders, and special party nights. Each event features ticket tiers, festival schedules, and artist rosters.
- **Where it leads:** `/events`.

### The Member Passport: Mi Carnet (My Pass)
- Located on the right of the navigation bar, this is the dancer's digital membership card showing their attended classes, active tickets, and personal achievements.

---

## 2. Clear & Honest Payment Rules

We have locked down payment rules across the entire platform so there is zero confusion between weekly classes and big weekenders.

### Weekly Classes: Pay at the Door Only
- **The Rule:** Thursday and Sunday weekly classes are **strictly cash or card at the door**. Dancers pay £12 for one class or £14 for two classes.
- **No Checkout Buttons:** You will never see a "Buy Now" or credit card form for weekly classes. 
- **Free Class Reservations:** Dancers can tap to reserve a spot in advance. Reserving is **100% free**. It lets you see who is coming ahead of time and keep an eye on leader/follower balance, but money only changes hands when dancers arrive at BOH Studios.

### Festivals & Special Events: Secure Online Stripe Checkout
- **The Rule:** Congress full passes, weekend party passes, and masterclass tickets are purchased online in advance.
- **Payment Processing:** Handled securely via Stripe with credit card, debit card, Apple Pay, or Google Pay.
- **Instant Delivery:** Once purchased, the dancer's pass immediately appears inside their **Mi carnet** tab as a digital ticket stub with a personal QR code.

---

## 3. Mi Carnet & The Real QR Door Pass

### What Dancers See on "Mi carnet" (`/dashboard/carnet`)
When a student signs in and taps **Mi carnet**, they see a poster-style Cuban membership card personalized with their name and dance level. It includes:
1. **Attendance Milestones:** A counter of total classes danced with collectible milestone stamps at **10, 25, 50, and 100 classes** ("¡Eres de la casa!").
2. **Tus pases (Your Festival Passes):** Every festival or special event ticket they have purchased online, styled like an authentic perforated ticket stub with their unique QR code.
3. **Próximas clases (Upcoming Classes):** Class sessions they have reserved in advance, clearly marked with the pay-at-the-door price.
4. **Tus funciones (Your Dance Season):** A grid of torn ticket stubs—one for every single class session they have attended.

### The Real Camera-Readable QR Code
In the past, QR codes in the system were purely decorative illustrations that phone cameras could not scan. We have replaced them with **genuine, high-resolution QR codes** built to the international ISO/IEC 18004 standard.
- The black-and-white code has high contrast and generous margins.
- It scans instantly off any phone screen, even with low brightness or smudged screens.

### How to Scan Passes at the Door
When dancers arrive at the venue:
1. **For Festivals & Special Events:**
   - Ask the dancer to open **Mi carnet** on their phone.
   - Point your phone camera, tablet, or handheld barcode scanner at their QR code.
   - The scanner immediately verifies the ticket hash against the database and confirms their entry tier and dance role (Leader/Follower).
2. **For Weekly Thursday & Sunday Classes:**
   - Dancers walk up to your reception desk and pay £12 or £14.
   - Open your **Faculty Roster** at `/instructor/roster` on your phone or tablet.
   - Tap the dancer's name to instantly mark them as checked in.
   - The moment you tap check-in, their **Mi carnet** updates automatically, adding a fresh torn ticket stub to their season collection.

---

## 4. The Poster Desk & Studio Wall Poster

You no longer have to spend hours designing social media graphics in external apps every week. The platform now generates production-ready posters directly from your live timetable.

### The Instagram Poster Desk (`/cartel`)
Located at `/cartel` (and linked directly from the teacher navigation menu):
- **Always Up to Date:** The desk reads your live database schedule. If you change a class time, instructor, or room, the poster updates automatically.
- **Dual Formats for Every Night:**
  - **Instagram Story (1080 × 1920):** Sized for vertical full-screen mobile stories.
  - **Feed Post (1080 × 1350):** Sized for high-impact Instagram grid posts.
- **Authentic Cuban Typography:** Rendered with bold Anton and Archivo Black headline typography, authentic Spanish date formatting, BOH Studios venue details, instructor credits, and the door price.
- **One-Tap Download:** Open `/cartel` on your iPhone or Android, tap **Story** or **Feed post**, and save the PNG directly to your photo gallery, ready to post.

### The A3 Studio Wall Poster (`/cartel/pared`)
Located at `/cartel/pared`:
- **"Practica en casa" (Practice at Home):** A printable poster designed specifically for the walls of BOH Studios.
- **Built-in Smart QR Code:** The poster features a large, crisp QR code pointing dancers straight to the academy's music player (`/music`).
- **Dynamic Address Awareness:** The QR code automatically detects whether you are viewing it on your staging environment or live production domain (`salsaexplosion.co.uk`), ensuring the printed QR code always sends dancers to the right site.
- **Edge-to-Edge Printing:** Sized in true A3 proportions. Tap the **Print** button at the top to print directly to an A3 or A4 printer (choose "Fit to Page" for A4). Hang it in the dance studio and reception area so students can point their phone camera at the wall and immediately practice the songs at home.

---

## 5. Rueda Flashcards: Tarjetas de Rueda

Located at `/dashboard/rueda/tarjetas` (inside the "Canciones" door under the **Tarjetas** tab):

Rueda calls happen fast. To help students prepare for social dancing, we built an interactive flashcard drilling system.

### How the Flashcards Work
1. **Four Color-Coded Levels:**
   - **Beginner (Principiante):** Caribbean Teal
   - **Improver (Intermedio Bajo):** Poster Mustard
   - **Intermediate (Intermedio):** Poster Red
   - **Advanced (Avanzado):** Poster Blue
2. **Two Study Modes:**
   - **By Name ("¿Qué llamada es?"):** The card shows the spoken Cuban call (e.g. *Dame dos con Cuba*). The dancer recalls the movement and hand signal, then taps to flip the card.
   - **By Hand Signal ("¿Qué seña es?"):** The card shows the visual hand signal used in loud clubs. The dancer recalls the call name.
3. **Smart Learning (Spaced Repetition):**
   - **"Otra vez" (Again):** If a student hesitates or gets it wrong, tapping "Again" slots that card back into the deck **3 cards later** so they practice it again while it is fresh.
   - **"Ya me la sé" (I know this):** When mastered, the card is marked as known. Progress is saved directly to their phone, tracking how many calls they have conquered.
   - **"Empezar de nuevo" (Reset):** Allows dancers to reset their deck whenever preparing for a new season.

---

## 6. The Move Library: Review Desk & Public Catalog

The Move Library connects what happens in class to how students practice at home. It operates on a strict **teacher-approval protocol**: unverified or draft figures never reach the public.

### Step 1: The Faculty Review Desk (`/instructor/moves`)
When you sign in as an instructor or studio admin, you have access to the **Move Library Review Desk**:
- **Comprehensive Move List:** Review figures across all six core families (Desplazamientos, Giros y Vueltas, Figuras Clásicas, Rueda de Casino, Juegos de Pareja, and Pasitos).
- **Inspect Step Breakdowns:** Check footwork and body movement for both the **Leader (Guía)** and **Follower (Seguidor)** across clean 8-count strips, ensuring pauses on counts 4 and 8 are respected.
- **Attach Verified YouTube Video Breakdowns:** Link clean, high-quality demonstration videos with no third-party overlay ads.
- **Link to Real Timba Songs:** Connect each move to specific sections in our music catalog (e.g. teaching students to dance *Dile que no* during the Verso or save complex turn patterns for the Coro).
- **Approval Controls:** Mark figures as **Draft**, **Needs Work**, or **Approved**.

### Step 2: The Public Dancer Catalog (`/moves`)
Once you approve a move, it instantly publishes to the public catalog at `/moves`:
- **Poster Cards:** Each move appears as a collectible silkscreen card displaying the Spanish figure name, family badge, syllabus difficulty level, and count strip.
- **Deep-Dive Move Pages (`/moves/[moveId]`):** Dancers can open any approved move to view:
  - The official embedded video demonstration.
  - Separate Leader and Follower step instructions.
  - Direct links to songs where the move feels best.
  - Common mistakes to avoid.
  - Essential prerequisites.
- **"Próximamente" Guard:** If a move family has no approved moves yet, it displays an elegant "Próximamente" card explaining that Maestro Enrique is currently verifying the figures on the music.

---

## 7. Email Communications: Retinted to Paper & Ink

All automated transactional emails sent by Salsa Explosion (class reminders and your weekly Monday morning owner digest) have been restyled to match the authentic poster aesthetic:
- **Canvas:** Warm paper background (`#F1E6D0`).
- **Typography:** High-contrast charcoal ink text (`#161311`) with legible line heights.
- **Muted Details:** Subtle aged ink (`#59534c`) for secondary notes and timestamps.
- **Call-to-Action Buttons:** Vibrant Poster Red (`#E8462F`) buttons with crisp Ink (`#161311`) lettering, fully compliant with WCAG accessibility contrast standards.
- **Table Outlines:** Crisp paper border rules (`#d4c8b2`).

Every email reinforces the core studio policy: **classes are paid at the door, reminders include direct links to practice the class songs, and booking cancellations remain simple and free.**

---

## Quick Reference Summary for Teachers & Staff

| Task / Destination | URL Route | Who Uses It |
| :--- | :--- | :--- |
| **Weekly Timetable & Pricing** | `/dashboard/schedule` | Dancers & Visitors |
| **Cuban Music Player & Clave** | `/music` | Dancers practicing at home |
| **Rueda Call Dictionary** | `/dashboard/rueda` | Dancers & Students |
| **Rueda Flashcards** | `/dashboard/rueda/tarjetas` | Dancers drilling signals |
| **Approved Move Catalog** | `/moves` | Dancers studying figures |
| **Member Pass & Stubs** | `/dashboard/carnet` | Signed-in Dancers |
| **Event Passes & Congress** | `/events` | Ticket buyers |
| **Download Instagram Posters** | `/cartel` | Enrique & Social Media Staff |
| **Print A3 Studio Wall Poster** | `/cartel/pared` | Staff printing for studio |
| **Review & Approve Moves** | `/instructor/moves` | Enrique & Senior Faculty |
| **Class Door Check-in Roster** | `/instructor/roster` | Teachers at reception |
