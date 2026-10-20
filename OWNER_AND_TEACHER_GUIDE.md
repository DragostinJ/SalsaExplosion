# Salsa Explosion UK — Owner & Teacher Operations Handbook

**Prepared for:** Maestro Enrique Perez Valdes & Teaching Faculty (Moe Flex, Justyna, Arturas, Jim)  
**Locations Covered:** BOH Studios Bournemouth (`BH2 5LR`) • Woodlands Ballroom Poole (`BH14 9AG`) • Neptune Hall Boscombe (`BH5 1BN`)

---

## 1. How the Platform Works (60-Second Overview)

The Salsa Explosion web app replaces messy cash boxes, paper lists, and expensive 3rd-party ticketing sites (like Eventbrite) with a single system that works on any smartphone:

1. **Dancers Book Online (or Pay at the Door):**
   - Dancers can buy **Class Credits** (Single Drop-in, 5-Class Pack, 10-Class Pack) or **Festival Passes** (e.g., *MADE IN CUBA Weekend*, *Halloween Party*, *DANZA! 2026/2027*) using Apple Pay, Google Pay, or debit/credit card via Stripe.
   - Every dancer chooses **Lead** or **Follow** when booking so classes stay balanced.
   - Older or less tech-savvy dancers **do not need to use the app**—they can still turn up and give their name or pay at reception as normal.
2. **Every Dancer Gets a Digital Wallet Pass:**
   - As soon as a dancer books, their pass and personal QR code (`RF-PASS-...`) appear instantly on their phone at **`/dashboard/wallet`**—even if they haven't checked their email yet.
3. **1-Second Door Check-In:**
   - Staff and teachers check dancers in using their own smartphones in **1 second** using any of the 3 methods below.

---

## 2. Three Ways to Check Dancers In at the Door

You only need your normal smartphone (iPhone or Android) at the studio desk.

### Method A: The "Self-Serve Door QR" (Best for Busy Weekly Classes)
1. Log into your Teacher account on your phone and open **Instructor Roster (`/instructor/roster`)**.
2. Select tonight's class (e.g., *Thursday Cuban Salsa at BOH Studios*) and tap the orange **"Door QR"** button.
3. Leave your phone/iPad on the desk (or print the QR code once and tape it to the reception table).
4. **How dancers use it:** Dancers point their own phone camera at the QR code as they walk in and tap **"Confirm Check-In"**. Their name automatically turns green (**Attended**) on your roster.

### Method B: Live Camera Scanner on Staff Phone (Best for Festivals & Parties)
1. Open **Admin Events (`/admin/events`)** or **Instructor Roster (`/instructor/roster`)** on your phone.
2. Tap **"Open Camera Scanner"**.
3. Point your phone camera at the dancer's QR pass on their screen.
4. The app reads the `RF-PASS-...` code automatically, verifies their ticket tier (e.g., *Full Weekend Pass* vs *Party Only*), and marks them **Checked In**.

### Method C: 1-Tap Name Search (For Seniors or Walk-Ins Without Phones)
1. On **Instructor Roster (`/instructor/roster`)** or **Desk Operations (`/admin/operations`)**, look at the alphabetical list of dancers.
2. Simply tap the **Check In** button next to their name.
3. **If a walk-in pays cash or card at the door:**
   - Open **Desk Operations (`/admin/operations`)**, search their name (or add them), grant 1 class credit, and tap **Check In**.

---

## 3. What If Venue Wi-Fi or 4G Signal Drops? (Emergency Offline Backup)

Some venues (or stormy nights on the coast) can have patchy mobile reception. You are protected in two ways:

1. **Print the A4 Register Before Leaving Home:**
   - On `/instructor/roster`, tap **"Print A4 Sheet"**.
   - This generates a clean, printable paper checklist showing every booked Lead and Follow, their level, and emergency check-in boxes.
2. **Dancer Offline Screenshot Mode:**
   - Dancers' passes in `/dashboard/wallet` display their full name, pass type, date, and reference code in large, high-contrast letters so you can visually verify their ticket in 1 second even with zero internet connection.

---

## 4. After Class: Posting the 60-Second Recap Video

Students stay loyal for months when they can practice the routine at home during the week:

1. At the end of class, film a quick 45-second demonstration of the routine with your phone (Enrique, Moe, Justyna, Arturas, or Jim).
2. Open **Instructor Roster (`/instructor/roster`)** and tap **"Attach Recap Video"** on tonight's class.
3. Paste the video link (YouTube Unlisted, Instagram Reel, or Vimeo) and list the figures covered (e.g., *Guapea, Dile Que No, Enchufla Doble, Setenta*).
4. Tap **Publish**. Only students who attended or hold an active studio pass can view it in their **Video Vault (`/dashboard/recaps`)**.

---

## 5. Promoting a Student to the Next Level

When a student is ready to move from *Beginner 1* to *Improvers* or *Intermediate*:

1. Open **Students Directory (`/instructor/students`)**.
2. Find the dancer's name, select their new level from the dropdown, and tap **Save**.
3. This unlocks higher-level classes for them on the booking schedule and logs their promotion on their personal **Cuban Syllabus Roadmap (`/dashboard/progression`)**.

---

## 6. Owner Controls for Maestro Enrique (`/admin/*`)

| Admin Page | What You Can Do There |
| :--- | :--- |
| **Desk Operations (`/admin/operations`)** | Add/deduct class credits for any student, process door walk-ins, and view the live security audit log. |
| **Manage Classes (`/admin/classes`)** | Add new weekly classes, assign teachers (Moe, Justyna, Arturas, Jim, Enrique), change Lead/Follow capacity caps, or cancel a class (which automatically refunds booked credits to students!). |
| **Events & Festivals (`/admin/events`)** | Create new **DANZA!** party dates or weekend congresses, set Full Pass / Party Pass prices, and scan festival tickets at the door. |
| **Studio Analytics (`/admin/analytics`)** | View total revenue, active memberships, Lead-to-Follow ratio balance, and attendance trends across Bournemouth, Boscombe, and Poole. |

---

## 7. Zero-Cost Infrastructure Rules (How to Keep Bills at £0/Month)

1. **Keep-Alive:** A scheduled background ping runs every 48 hours to prevent the free database from pausing.
2. **Automatic Storage Cleaning:** Webhook logs older than 60 days are cleaned up automatically so the database stays under 50 MB (far below the 500 MB limit).
3. **Weekly Backups:** An encrypted backup is exported every Sunday night and stored for 90 days.
4. **Zero Email Waste:** Passes always appear directly in the student's digital wallet, avoiding third-party email quota limitations.
