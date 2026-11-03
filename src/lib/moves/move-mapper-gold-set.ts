/**
 * Clips with a known answer, used to measure the AI Studio Move Mapper before we trust it on
 * professional dancers. Each video names its figure in the title (a tutorial or a workshop), so
 * we know what the Mapper should find. Two clips teach figures we do NOT have (Tornillo, Figura 85):
 * the right answer there is "not-in-library", never the nearest catalogue name.
 *
 * Every video was checked with YouTube oEmbed on 2026-11-02 (public and embeddable); the title and
 * channel are exactly what oEmbed returned. Found by web search, never recalled from memory.
 * Tutorials say the name out loud, so the score separates "seen" from "Name heard:" rows.
 */
export interface GoldClip {
  youtubeVideoId: string;
  channelTitle: string;
  title: string;
  /** A confident row naming any of these ids is a hit. Empty: the figure is not in our library. */
  expected: readonly string[];
  /** What the figure is called in the video, for the not-in-library cases and the report. */
  figure: string;
}

export const GOLD_SET_CHECKED_AT = "2026-11-02";

export const MOVE_MAPPER_GOLD_SET: readonly GoldClip[] = [
  { youtubeVideoId: "Jexcy9LGKjo", channelTitle: "Dance Papi", title: "Learn Cuban Salsa: Dile Que No!", expected: ["dile-que-no"], figure: "Dile que no" },
  { youtubeVideoId: "3tUcawE0Bhs", channelTitle: "Dance Papi", title: "Learn Cuban Salsa: Enchufla", expected: ["enchufla"], figure: "Enchufla" },
  { youtubeVideoId: "9t6ceGBk3vA", channelTitle: "Salsaficion", title: "Intermediate Salsa Casino: Sácala en el Dile que No | Cuban Salsa Course 💃 Lesson 04", expected: ["exhibela"], figure: "Sácala (Exhíbela)" },
  { youtubeVideoId: "UdEYSvR7nYg", channelTitle: "Rumbanana Salsa Group", title: "Vacilala - Cuban Casino Fundamental", expected: ["vacilala"], figure: "Vacílala" },
  { youtubeVideoId: "X0G7rMlBt3M", channelTitle: "Salsaficion", title: "Intermediate Salsa Casino: Sombrero | Cuban Salsa Course 💃 Lesson 02", expected: ["sombrero"], figure: "Sombrero" },
  { youtubeVideoId: "WjEmeSgWHg0", channelTitle: "Salsaficion", title: "Intermediate Salsa Casino: Kentucky | Cuban Salsa Course 💃 Lesson 12", expected: ["kentucky"], figure: "Kentucky" },
  { youtubeVideoId: "xF6MEjk1JYg", channelTitle: "Latino Move", title: "KENTUCKY | Clase de Casino/Salsa cubana | Nivel intermedio.", expected: ["kentucky"], figure: "Kentucky" },
  { youtubeVideoId: "KONXbOQDw0I", channelTitle: "Salsaficion", title: "Intermediate Salsa Casino: Candado | Cuban Salsa Course 💃 Lesson 19", expected: ["candado"], figure: "Candado" },
  { youtubeVideoId: "u4M1h7SmovM", channelTitle: "Salsaficion", title: "Intermediate Salsa Casino: 70 (Setenta) | Cuban Salsa Course 💃 Lesson 21", expected: ["setenta"], figure: "Setenta (70)" },
  { youtubeVideoId: "NWYA8LIWZng", channelTitle: "Jessica Montoya", title: "Cuban (Casino) Salsa - Figure Setenta (70)", expected: ["setenta"], figure: "Setenta (70)" },
  { youtubeVideoId: "Ql17KJ77-fE", channelTitle: "Salsaficion", title: "Setenta y Uno 💃 Salsa Casino Figures 🕺 Cuban Salsa Course", expected: ["setenta-y-uno"], figure: "Setenta y Uno (71)" },
  { youtubeVideoId: "GuRcwzX5HuI", channelTitle: "Latino Move", title: "Figura 72 Salsa Cubana (Casino) | Paso Fácil y Rápido para Principiantes", expected: ["setenta-y-dos"], figure: "Figura 72" },
  { youtubeVideoId: "Bmi6Ytxd-ic", channelTitle: "Cuban Vibes Dance School", title: "Setenta por los Manos | Rueda de Casino (Improvers Level)", expected: ["setenta-por-las-manos"], figure: "Setenta por las manos" },
  { youtubeVideoId: "T0hFRd-aEBA", channelTitle: "Salsa y Sol Dance & Yoga", title: "Cuban Salsa Moves #25 - Ochenta (80)", expected: ["ochenta"], figure: "Ochenta (80)" },
  { youtubeVideoId: "pYHYv2WTCEA", channelTitle: "Cuban Vibes Dance School", title: "Ochenta (80) | Rueda de Casino (Improvers Level)", expected: ["ochenta"], figure: "Ochenta (80)" },
  { youtubeVideoId: "yfExmoHs55s", channelTitle: "Latino Move", title: "¡Aprende la FIGURA 84 de Salsa Cubana/Casino paso a paso! 💃🕺| Ideal para Principiantes e Intermedios", expected: ["ochenta-y-cuatro"], figure: "Figura 84" },
  { youtubeVideoId: "yJ8sskO-Rhs", channelTitle: "Salsa y Sol Dance & Yoga", title: "Cuban Salsa Moves #46   Siete Loco by Salsa y Sol Winchester", expected: ["siete-y-siete-loco"], figure: "Siete Loco" },
  { youtubeVideoId: "4dBlNnPN0hY", channelTitle: "Casino Con El Pelon", title: "Siete Loco Salsa Casino - Siete Loco Steps, Move, Figura, Turn Demo (7 Loco, Salsa Cubana)", expected: ["siete-y-siete-loco"], figure: "Siete Loco" },
  { youtubeVideoId: "1CIDrXsqIQQ", channelTitle: "SalsaValeTodo", title: "Salsa Cubana Figures - Coca-Cola", expected: ["coca-cola-y-bayamo"], figure: "Coca-Cola" },
  { youtubeVideoId: "CAzsMHf-At8", channelTitle: "SalsaValeTodo", title: "Salsa Cubana Figures - Abanico", expected: ["abanico"], figure: "Abanico" },
  { youtubeVideoId: "4tDKLXTxrto", channelTitle: "Salsaficion", title: "Juana la Cubana 💃 Salsa Casino Figures 🕺 Cuban Salsa Course", expected: ["juana-la-cubana"], figure: "Juana la Cubana" },
  { youtubeVideoId: "2FESL7iePec", channelTitle: "Messina Dance", title: "BASICS OF GUAGUANCO | Cuban Rumba", expected: ["rumba-guaguanco-basics"], figure: "Guaguancó basics" },
  { youtubeVideoId: "HvuqVdROT5s", channelTitle: "Messina Dance", title: "how to dance contratiempo (son cubano)", expected: ["son-cubano-contratiempo"], figure: "Son contratiempo" },
  { youtubeVideoId: "WpV1ch3BO24", channelTitle: "Comicucha", title: "Jorge Camaguey and Misladys. Timba & Despelote Workshop / Хорхе Камагуэй и Мисладис. Тимба)", expected: ["thoracic-isolation-despelote", "bloqueo-despelote-accent", "tembleque"], figure: "Despelote" },
  { youtubeVideoId: "DW5DR7E64bY", channelTitle: "Latino Move", title: "Aprende la Figura Tornillo en Salsa Cubana (Casino) | Cambios de agarre y giros.", expected: [], figure: "Tornillo" },
  { youtubeVideoId: "ndCkYeUsVlE", channelTitle: "Zaragozando a lo cubano", title: "¿CÓMO HACER PASO A PASO LA FIGURA 85 salsa cubana  con Michael & Neilys zaragozando a lo cubano", expected: [], figure: "Figura 85" },
];
