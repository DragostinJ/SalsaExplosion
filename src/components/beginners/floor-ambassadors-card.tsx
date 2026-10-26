import { Heart, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ambassador {
  name: string;
  role: "Lead & Follow Angel" | "Beginner Welcome Desk" | "Rhythm Guide";
  yearsAtStudio: string;
  favoriteFigure: string;
  welcomeMessage: string;
  avatarInitials: string;
}

const AMBASSADORS: Ambassador[] = [
  {
    name: "Sofia Moreno",
    role: "Lead & Follow Angel",
    yearsAtStudio: "3 years at Salsa Explosion",
    favoriteFigure: "Enchufla Doble",
    welcomeMessage:
      "I was terrified on my first night in Bournemouth! My job is to stand in the beginner Rueda circle with you and make sure you feel totally relaxed.",
    avatarInitials: "SM",
  },
  {
    name: "David Kim",
    role: "Rhythm Guide",
    yearsAtStudio: "2 years at BOH Studios",
    favoriteFigure: "Setenta Complicado",
    welcomeMessage:
      "If you're worried about 'having two left feet' or finding beat 1, come find me before class! We'll tap the clave beat together in 30 seconds.",
    avatarInitials: "DK",
  },
  {
    name: "Elena Vasquez",
    role: "Beginner Welcome Desk",
    yearsAtStudio: "4 years with Maestro Enrique",
    favoriteFigure: "Sombrero con Mambo",
    welcomeMessage:
      "I'm at the front desk every Thursday! I'll hand you your pass wristband, show you where to put your coat, and introduce you to fellow first-timers.",
    avatarInitials: "EV",
  },
];

export function FloorAmbassadorsCard() {
  return (
    <Card className="border border-line bg-surface-1 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500 text-stone-950 font-bold text-[10px]">
            <Heart className="mr-1 h-3 w-3 fill-zinc-950" />
            Floor Ambassadors
          </Badge>
          <span className="text-xs font-semibold text-amber-400">
            Look for the Yellow Lanyard at BOH Studios
          </span>
        </div>
        <CardTitle className="text-base sm:text-lg font-bold">
          Friendly Faces Here to Help You (Never Dance Alone)
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Walking into a dance studio for the first time can feel intimidating. Our volunteer Floor Ambassadors are veteran students whose only mission is to welcome you, answer questions, and support you on the floor.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {AMBASSADORS.map((amb) => (
            <div
              key={amb.name}
              className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs ring-1 ring-amber-500/40">
                    {amb.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate text-foreground">
                      {amb.name}
                    </h4>
                    <p className="text-[10px] text-amber-400 font-semibold truncate">
                      {amb.role}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1">
                  &ldquo;{amb.welcomeMessage}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between">
                <span>{amb.yearsAtStudio}</span>
                <span className="font-medium text-foreground">Fav: {amb.favoriteFigure}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-3 text-xs flex items-center gap-2.5 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>First Night Guarantee:</strong> If you feel shy or overwhelmed at any point during class, step to the side and tap an Ambassador on the shoulder. They will gladly walk you through the moves step-by-step!
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
