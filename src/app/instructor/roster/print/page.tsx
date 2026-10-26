import { notFound } from "next/navigation";
import { BookingStatus, DanceRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { PrintRosterControls } from "@/components/instructor/print-roster-controls";

export const metadata = {
  title: "Printable Class Door Roster | Salsa Explosion UK",
  description: "A4 paper door roster with Lead and Follow sections for manual check-ins at BOH Studios Bournemouth.",
};

interface PrintRosterPageProps {
  searchParams: Promise<{
    sessionId?: string;
    autoPrint?: string;
  }>;
}

export default async function PrintRosterPage({ searchParams }: PrintRosterPageProps) {
  await requireRole(STAFF_ROLES);
  const { sessionId, autoPrint } = await searchParams;

  let classSession = null;

  if (sessionId) {
    classSession = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: {
          select: { firstName: true, lastName: true, email: true },
        },
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentLevel: true,
              },
            },
          },
        },
      },
    });
  } else {
    // If no sessionId specified, pick the next upcoming session
    classSession = await prisma.classSession.findFirst({
      where: { isCancelled: false },
      orderBy: { startTime: "asc" },
      include: {
        instructor: {
          select: { firstName: true, lastName: true, email: true },
        },
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.ATTENDED] },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentLevel: true,
              },
            },
          },
        },
      },
    });
  }

  if (!classSession) {
    notFound();
  }

  // Sort Leads and Follows alphabetically
  const leads = classSession.bookings
    .filter((b) => b.danceRole === DanceRole.LEAD)
    .sort((a, b) =>
      `${a.user.lastName} ${a.user.firstName}`.localeCompare(
        `${b.user.lastName} ${b.user.firstName}`
      )
    );

  const follows = classSession.bookings
    .filter((b) => b.danceRole === DanceRole.FOLLOW)
    .sort((a, b) =>
      `${a.user.lastName} ${a.user.firstName}`.localeCompare(
        `${b.user.lastName} ${b.user.firstName}`
      )
    );

  const dateFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(classSession.startTime));

  const timeFormatted = `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(classSession.startTime))} – ${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(classSession.endTime))}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 print:p-0 print:max-w-full">
      <PrintRosterControls
        autoPrint={autoPrint === "true"}
        backUrl={`/instructor/roster`}
      />

      {/* Printable Sheet Container */}
      {/* Print-fidelity: intentionally black text on white paper */}
      <div className="bg-white text-zinc-950 p-8 rounded-xl border print:border-none print:p-0 print:shadow-none shadow-sm space-y-6">
        {/* Header */}
        <div className="border-b-2 border-zinc-900 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black uppercase tracking-wider text-amber-700 print:text-black">
                Salsa Explosion UK
              </span>
              <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded font-bold border border-zinc-300">
                Official Door Roster
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Hub: BOH Studios Bournemouth • 104 Commercial Road, Bournemouth BH2 5LR
            </p>
            <h1 className="text-2xl font-black mt-2 tracking-tight">
              {classSession.title}
            </h1>
            <p className="text-xs font-semibold text-zinc-700 mt-0.5">
              {dateFormatted} • {timeFormatted} • Room: {classSession.room}
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-bold">
              Instructor: Maestro {classSession.instructor.firstName} {classSession.instructor.lastName}
            </div>
            <div className="text-zinc-600">
              Level: <span className="font-bold text-zinc-900">{classSession.minLevel}</span>
            </div>
            <div className="text-[11px] font-mono bg-zinc-100 px-2 py-1 rounded border border-zinc-200 inline-block">
              Ratio: {leads.length} Leads / {follows.length} Follows
            </div>
          </div>
        </div>

        {/* Section 1: Leads Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
              <span className="h-3 w-3 bg-blue-600 print:bg-black inline-block rounded-xs" />
              1. Leads Roster ({leads.length} Registered)
            </h2>
            <span className="text-[11px] text-zinc-500">Max Leads: {classSession.maxLeads}</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-800 bg-zinc-100">
                <th className="py-1.5 px-2 w-10 text-center font-bold">Check</th>
                <th className="py-1.5 px-2 font-bold">Dancer Name</th>
                <th className="py-1.5 px-2 font-bold">Syllabus Level</th>
                <th className="py-1.5 px-2 font-bold">Email</th>
                <th className="py-1.5 px-2 font-bold">Status</th>
                <th className="py-1.5 px-2 w-28 font-bold">Initials</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 text-center text-zinc-500 italic">
                    No leads registered yet.
                  </td>
                </tr>
              ) : (
                leads.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={`border-b border-zinc-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                    }`}
                  >
                    <td className="py-2 px-2 text-center">
                      <div className="h-4 w-4 mx-auto border-2 border-zinc-600 rounded-xs flex items-center justify-center font-bold text-xs">
                        {b.status === BookingStatus.ATTENDED ? "✓" : ""}
                      </div>
                    </td>
                    <td className="py-2 px-2 font-bold text-zinc-900">
                      {b.user.lastName}, {b.user.firstName}
                    </td>
                    <td className="py-2 px-2 text-zinc-600">{b.user.currentLevel}</td>
                    <td className="py-2 px-2 text-zinc-500 font-mono text-xs">
                      {b.user.email}
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {b.status === BookingStatus.ATTENDED ? "Attended" : "Paid Pass"}
                      </span>
                    </td>
                    <td className="py-2 px-2 border-l border-zinc-200" />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Follows Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
              <span className="h-3 w-3 bg-pink-600 print:bg-black inline-block rounded-xs" />
              2. Follows Roster ({follows.length} Registered)
            </h2>
            <span className="text-[11px] text-zinc-500">Max Follows: {classSession.maxFollows}</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-800 bg-zinc-100">
                <th className="py-1.5 px-2 w-10 text-center font-bold">Check</th>
                <th className="py-1.5 px-2 font-bold">Dancer Name</th>
                <th className="py-1.5 px-2 font-bold">Syllabus Level</th>
                <th className="py-1.5 px-2 font-bold">Email</th>
                <th className="py-1.5 px-2 font-bold">Status</th>
                <th className="py-1.5 px-2 w-28 font-bold">Initials</th>
              </tr>
            </thead>
            <tbody>
              {follows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 text-center text-zinc-500 italic">
                    No follows registered yet.
                  </td>
                </tr>
              ) : (
                follows.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={`border-b border-zinc-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                    }`}
                  >
                    <td className="py-2 px-2 text-center">
                      <div className="h-4 w-4 mx-auto border-2 border-zinc-600 rounded-xs flex items-center justify-center font-bold text-xs">
                        {b.status === BookingStatus.ATTENDED ? "✓" : ""}
                      </div>
                    </td>
                    <td className="py-2 px-2 font-bold text-zinc-900">
                      {b.user.lastName}, {b.user.firstName}
                    </td>
                    <td className="py-2 px-2 text-zinc-600">{b.user.currentLevel}</td>
                    <td className="py-2 px-2 text-zinc-500 font-mono text-xs">
                      {b.user.email}
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {b.status === BookingStatus.ATTENDED ? "Attended" : "Paid Pass"}
                      </span>
                    </td>
                    <td className="py-2 px-2 border-l border-zinc-200" />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Manual Door Cash / Walk-In Table */}
        <div className="space-y-2 pt-2 break-inside-avoid">
          <h2 className="text-sm font-black uppercase tracking-wide">
            3. Door Walk-Ins & Cash Registrations (Manual Entry)
          </h2>
          <table className="w-full text-left border-collapse text-xs border border-zinc-300">
            <thead>
              <tr className="border-b border-zinc-300 bg-zinc-50">
                <th className="py-1.5 px-2 w-10 text-center font-bold">#</th>
                <th className="py-1.5 px-2 font-bold">Dancer Name</th>
                <th className="py-1.5 px-2 w-24 font-bold">Role</th>
                <th className="py-1.5 px-2 font-bold">Phone / Email</th>
                <th className="py-1.5 px-2 w-24 font-bold">Amount Paid</th>
                <th className="py-1.5 px-2 w-28 font-bold">Door Notes</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((rowNum) => (
                <tr key={rowNum} className="border-b border-zinc-200 h-8">
                  <td className="py-1.5 px-2 text-center text-zinc-400 font-bold">{rowNum}</td>
                  <td className="py-1.5 px-2" />
                  <td className="py-1.5 px-2 text-zinc-400 text-xs">Lead / Follow</td>
                  <td className="py-1.5 px-2" />
                  <td className="py-1.5 px-2 text-zinc-400 text-xs">£__________</td>
                  <td className="py-1.5 px-2" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Footer */}
        <div className="pt-4 border-t-2 border-zinc-900 flex items-center justify-between text-xs text-zinc-600">
          <div>
            <span>Door Staff Signature: _______________________</span>
          </div>
          <div>
            <span>Total Cash Collected at Door: £_______________</span>
          </div>
          <div>
            <span>Verified by Maestro Enrique Perez Valdes</span>
          </div>
        </div>
      </div>
    </main>
  );
}
