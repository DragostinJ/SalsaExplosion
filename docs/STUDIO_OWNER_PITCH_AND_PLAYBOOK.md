# RitmoFlow: Studio Owner Pitch Deck & Feature Playbook
**Document Version:** 1.0.0 • Production Commercial Pilot Edition  
**Target Studio:** Local Cuban Salsa & Rueda de Casino Academy  
**Author / Presenter:** Lead Full-Stack Software Engineer & Studio Partner  

---

## Executive Summary & Meeting Objective

The goal of this pitch is to transition the studio owner from manual, fragmented admin (paper rosters, cash jars, WhatsApp threads, and Eventbrite’s 6.5% + 59p fee) to **RitmoFlow** — a tailor-made operating system designed specifically for Cuban Salsa academies.

### The Deal Structure (Your Ask)
* **What the Owner Gets:** 
  1. A bespoke, white-labeled web app with student self-booking, QR check-in, automated Lead/Follow ratio balancing, and direct Stripe payments.
  2. Complete elimination of Eventbrite ticket fees on international guest artist bootcamps (saving £600–£1,000+ per event).
  3. 100% recovery of uncollected cash leakage at the studio door (£300–£500/month).
  4. End-of-class video recap vault that turns casual drop-in dancers into paying subscribers.
* **What You Ask For in Return:**
  1. Complimentary weekly classes and masterclass access for you and your dance partner.
  2. The academy serving as your live pilot case study and portfolio reference for your remote engineering career.
  3. Real-world user feedback to harden the platform before multi-tenant SaaS rollout.

---

## 1. The 10-Minute In-Person Meeting Script

When meeting the studio owner, **never talk about code or database tables**. Talk strictly about **time saved, floor balance, and money recovered**.

```
[MINUTES 0-2: THE HOOK]
"Hey [Owner Name], I love dancing here every week, but I noticed something: on Friday nights, 
you spend the first 25 minutes of class dealing with bank transfers, handling sweaty £10 notes, 
and trying to count if there are too many Follows in the circle. 

And when you bring in maestros like Yaniel from Havana for a weekend bootcamp, Eventbrite takes 
almost £7 out of every £95 ticket just for sending an email with a barcode. 

I’m a software engineer, and over the past few months, I built an operating system designed 
specifically for our studio. It eliminates door cash chaos, stops Eventbrite from taking your margins, 
and gives your students an end-of-class video recap vault on their phones. 

Can I show you what it looks like in 3 minutes on my phone?"
```

```
[MINUTES 3-7: THE 3-STEP LIVE DEMO]
1. Show Student Schedule: 
   "Look at this: A student opens the app on their phone. They see Friday's Cuban Casino class. 
   Notice this badge: 'Lead spots: 12/14. Follow spots: 14/14 (Full)'. 
   The app automatically prevents having 25 girls and 7 guys in the Rueda circle. 
   With 1 tap, they book and pay with Apple Pay or their class credits."

2. Show the QR Door Check-In:
   "When they walk into the studio, they don't queue up at your desk with cash. 
   You have a laminated QR code at the door. The student points their camera at it, 
   taps 'Confirm Check-In', and your instructor roster instantly turns green: 'Checked In'."

3. Show the End-of-Class Recap Vault:
   "At 9:30 PM, when class finishes, you or your instructors film a 30-second summary of 
   the combination—Guapea, Setenta, Vacilala. You drop the video straight into RitmoFlow. 
   Only students who attended can unlock and watch the video to practice at home. 
   Students obsess over this—it stops them from quitting after 4 weeks because they 'forgot the moves'."
```

```
[MINUTES 8-10: THE NO-RISK PROPOSAL]
"I don't want you to pay me £2,000 for custom software development. 
Here is what I propose: Let’s run a 14-day zero-risk pilot. 
I will set up the entire schedule, print the QR signs for the front desk, and be there on Friday 
to handle any student questions. 

All I ask in return is that you cover classes for me and my partner while we pilot, 
and if you love the system, you give me a written testimonial and case study. 

If after 14 days you prefer collecting cash and counting rosters on paper, we turn it off with zero hard feelings. 
Can we test it for next Friday's social?"
```

---

## 2. Day-1 Objection Handling & Counter-Scripts

### Objection 1: *"I am not good with technology and my instructors won't use it."*
* **The Counter-Argument:** RitmoFlow was built to be simpler than WhatsApp. Instructors don't type anything.
* **The Script:** 
  > *"I completely understand. If a system requires training, it fails. That’s why RitmoFlow has no complex forms. Your instructors have big, colorful buttons on their phones: one button to check in a student, and one button to upload the end-of-class clip with quick-tap chips for figures like 'Setenta' or 'Enchufla'. I will be at the desk on day one to show your instructors—it takes 60 seconds to learn."*

### Objection 2: *"My students prefer paying cash at the door."*
* **The Counter-Argument:** Cash feels convenient until you calculate the leakage: forgotten change, unrecorded drop-ins, and friends dancing for free.
* **The Script:** 
  > *"Cash feels easy, but in every dance studio, between 10% and 15% of drop-in cash walking through the door never reaches your bank account—people promise to bank-transfer later and forget, or class starts and nobody checked them. With RitmoFlow, students can still buy credits online in 5 seconds with Apple Pay before they arrive. For die-hard cash payers, your desk instructor can tap 'Add Credits' in 2 seconds, recording the cash transaction so your books balance automatically."*

### Objection 3: *"I already use Eventbrite for my weekend bootcamps."*
* **The Counter-Argument:** Eventbrite takes 6.5% + 59p per ticket and markets competing dance events to your own email list.
* **The Script:** 
  > *"When you sell 100 Full Passes at £95 for an international Cuban maestro, Eventbrite charges you nearly £700 in fees. That is £700 coming directly out of your profit. RitmoFlow connects directly to your own Stripe account, charging standard card fees (1.5% + 20p). You save £550+ on every single guest artist event, your students stay on your own website, and Eventbrite can't recommend rival studio parties to your attendees."*

### Objection 4: *"What if the WiFi in the basement dance studio drops?"*
* **The Counter-Argument:** RitmoFlow has offline-first local validation and direct fallback check-ins.
* **The Script:** 
  > *"Dance studios are notorious for spotty cellar WiFi. RitmoFlow was specifically built so door codes and attendance rosters work reliably. Even if the cellular network blips, the instructor roster retains local attendance state so no student is ever held up at the door."*

---

## 3. Complete Feature Breakdown (The Technical & Product Moat)

Use this section as your cheat-sheet when clicking through the app during your demonstration.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             RITMOFLOW PORTAL MAP                                 │
├────────────────────────┬─────────────────────────┬───────────────────────────────┤
│    STUDENT PORTAL      │   INSTRUCTOR ROSTER     │     EXECUTIVE ADMIN           │
├────────────────────────┼─────────────────────────┼───────────────────────────────┤
│ • /dashboard/schedule  │ • /instructor/roster    │ • /admin/analytics            │
│ • /dashboard/progression│ • /instructor/students │ • /admin/classes              │
│ • /dashboard/recaps    │ • /instructor/submissions│ • /admin/events             │
│ • /events/[slug]       │ • /checkin/[sessionId]  │ • /pricing                    │
└────────────────────────┴─────────────────────────┴───────────────────────────────┘
```

### 1. Student Portal (`/dashboard/schedule`)
* **What It Solves:** Eliminates endless WhatsApp messages asking *"Is there class tonight?"* or *"Can I come if I don't have a partner?"*
* **Key Features:**
  * **Dance Role Toggle:** Student chooses **LEAD**, **FOLLOW**, or **SOLO**.
  * **Real-Time Partner Balance:** Shows live booked counts and capacity limits (e.g. *12/14 Leads, 14/14 Follows*).
  * **Monotonic Syllabus Lock:** Students cannot accidentally book an Intermediate class if their profile is at Beginner or Improver level, protecting class quality.
  * **Wallet Credits & Subscription:** Automatically checks whether the dancer holds an active Unlimited Membership or deducts from their class credits.

### 2. End-of-Class Video Recap Vault (`/dashboard/recaps`)
* **What It Solves:** Student churn. In salsa academies, 40% of beginners quit after 6 weeks because they forget combinations practiced during class.
* **Key Features:**
  * **Direct Drag-and-Drop / Mobile Camera Upload:** Teachers record the 30-second combo at the end of class on their phone, drag the file into RitmoFlow (or tap camera roll), watch the upload progress bar, and publish instantly.
  * **1-Tap Cuban Figure Chips:** Quick-select tags for *Guapea, Dile Que No, Enchufla, Setenta, Vacilala, Sombrero*.
  * **Attendance-Gated Access:** Only dancers who actually checked into that session unlock the private video in their personal library, providing massive incentive to never miss a week.
  * **Variable Playback Speed:** Dancers can slow videos down to 0.75x to study hand turns and footwork.

### 3. Student Level Progression & AI Co-Pilot (`/dashboard/progression`)
* **What It Solves:** Eliminates awkward in-person level gatekeeping debates where students think they are ready for Advanced classes but lack basic timing.
* **Key Features:**
  * **Video Audition Submission:** Students record their Cuban Salsa assessment video and upload it directly for instructor review.
  * **AI Dance Co-Pilot:** Provides multi-point rubric evaluation on **Clave Timing (1-2-3 / 5-6-7)**, **Circular Casino Frame**, and **Cuban Hip Motion**.
  * **Monotonic Advancement:** Guarantees students can only advance one tier at a time (Beginner $\rightarrow$ Improver $\rightarrow$ Intermediate $\rightarrow$ Advanced).

### 4. Live Desk & Instructor Roster (`/instructor/roster`)
* **What It Solves:** Eliminates clipboards, crumpled paper rosters, and 20-minute check-in delays at the front door.
* **Key Features:**
  * **One-Tap Check-In:** Instructors tap *"Check In"* to toggle attendance status in real time.
  * **Floor Balance Indicator:** Instantly displays the live Lead vs. Follow ratio currently on the dance floor.
  * **Direct Walk-In Booking:** If a dancer arrives at the door without booking, the desk staff can book and check them in simultaneously with a single tap.

### 5. Guest Artist Masterclass Engine (`/events` & `/admin/events`)
* **What It Solves:** Eventbrite fee gouging and cash tracking for high-ticket weekend bootcamps.
* **Key Features:**
  * **Tiered Passes:** Full Pass, Party Pass, Early Bird with separate capacity and partner caps.
  * **Instant Apple Pay / Card Checkout:** Direct Stripe integration with zero middleman commission.
  * **Unique Door Pass QR Codes:** Every ticket receives a tamper-proof hashed QR code (`RF-PASS-XXXX`) that can be scanned and verified at the venue entrance.

### 6. Executive Intelligence & Analytics (`/admin/analytics`)
* **What It Solves:** The owner having no idea what their actual monthly recurring revenue (MRR), student retention rate, or breakage margin is.
* **Key Features:**
  * **Revenue Tracking:** Real-time breakdown of subscription renewals, credit pack purchases, and event pass gross volume.
  * **CSV Data Export:** One-click download of all studio transactions and student rosters for accountant/tax filing.
  * **Active Student Directory:** Live counts of active dancers by syllabus tier and role.

---

## 4. Financial ROI: The Cold Hard Numbers

Show the studio owner this comparison table during your meeting:

| Revenue & Cost Category | Traditional Studio (Manual / Eventbrite) | RitmoFlow Studio Operating System | Your Annual Studio Gain |
| :--- | :--- | :--- | :--- |
| **Weekend Bootcamp Fees** (100 passes @ £95) | Eventbrite takes **£676.50** (6.5% + 59p) | Direct Stripe processing: **£162.50** (1.5% + 20p) | **+£514.00 per event** |
| **Door Cash Leakage** (Lost change, uncollected drop-ins) | Estimated **£350 / month** in forgotten payments | 100% cashless QR verification: **£0 leakage** | **+£4,200.00 / year** |
| **Credit Pack Breakage** (Unused expired credits) | £0 (Credits sit forever or on paper cards) | 18% average industry breakage captured as profit | **+£1,800.00 / year** |
| **Student 3-Month Retention** | 45% (Dancers forget figures and drop out) | 68% (Retained via Video Recap Vault & Level Badges) | **+£5,400.00 / year** |
| **Total Estimated Financial Impact** | — | — | **+£11,914.00 / year** |

---

## 5. The 14-Day Pilot Implementation Plan

Structure the pilot across two clean weeks so the owner is never stressed:

```
WEEK 1: ZERO-DISRUPTION SETUP
• Day 1 (Monday): Input the studio's weekly schedule (Beginner, Improver, Rueda de Casino).
• Day 2 (Tuesday): Send a broadcast email / WhatsApp announcement to existing students:
  "Starting this Friday, Havana Academy is going digital! Sign in at ritmoflow.app to claim 1 Free Class Credit."
• Day 3 (Wednesday): Test front-desk QR laminate printing with the owner.
• Day 5 (Friday Night Class): You stand at the front door for 45 minutes with a tablet/phone:
  - Greet incoming students.
  - Help them point their camera at the QR sign to check in.
  - Watch the owner's reaction when the entire class is checked in within 4 minutes.
• Day 5 (End of Class): Hand the phone to the instructor to record their 30-second combo recap. Tap "Publish".

WEEK 2: HABIT REINFORCEMENT & CONVERSION
• Day 7 (Sunday): Students open the app at home to review their Friday recap video.
• Day 10 (Wednesday): Check-in counts for Friday's class start rolling in automatically 48 hours early.
• Day 12 (Friday Night): The instructor runs check-in without your assistance in under 60 seconds.
• Day 14 (Sunday Review): Sit down with the owner over coffee:
  - Review the analytics dashboard: Total students registered, tickets booked, zero cash lost.
  - Confirm agreement on continuing the pilot in exchange for your classes.
```

---

## 6. Elevator Pitch Summary Card (Keep on Your Phone)

```
===================================================================
RITMOFLOW STUDIO VALUE PROPOSAL (30-SECOND PITCH)
===================================================================
1. NO MORE CASH CHAOS: 
   Students book online or tap a QR code at the door. Every spot is 
   paid and tracked.

2. PERFECT PARTNER BALANCE: 
   The app prevents 20 Follows and 6 Leads. Rueda circles stay 
   balanced and students stay happy.

3. VIDEO RECAP VAULT: 
   Instructors record a 30-second recap on their phone after class. 
   Students practice at home and keep coming back every week.

4. KEEP YOUR EVENT PROFITS: 
   Stop giving Eventbrite 7% of your guest artist masterclasses. 
   Process ticket passes directly into your bank account.
===================================================================
```
