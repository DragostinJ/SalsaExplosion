# Filling the move library with Gemini

The library starts with 30 moves seeded from the syllabus. This brief drafts the rest, about 150 named figures, calls, steps and dances, in batches of about 10, using the AI Studio move maker that already feeds the teacher review desk.

Everything Gemini writes is a **draft**. Nothing reaches dancers until a teacher opens it at `/instructor/moves/[id]`, counts it on the music, and approves it. Teachers can edit any draft, mark it *Needs work*, or *Reject* it (rejected moves never show).

The names below come from public lists by other Cuban salsa schools (see [Sources](#sources)). Only the names are taken: Gemini writes its own explanations, and the teachers correct them. Schools disagree about which level a figure belongs to, so the levels here are a starting point for Enrique's teachers to change.

---

## 1. Set up AI Studio (once)

1. Open [Google AI Studio](https://aistudio.google.com/), then **Playground**, and pick the strongest Gemini model available.
2. **System instructions:** paste the whole of [`docs/ai-studio-move-maker/system-instructions.txt`](../ai-studio-move-maker/system-instructions.txt).
3. **Structured outputs:** turn it on, click **Edit**, and paste [`docs/ai-studio-move-maker/response-schema-batch.json`](../ai-studio-move-maker/response-schema-batch.json). This is the batch version: the reply is `{ "moves": [ … ] }`, one entry per move.
4. Turn search, code execution and URL tools **off** (structured output needs them off).
5. Temperature about 0.4.

## 2. Run one batch

1. Paste the **standing rules** (section 3) and then **one batch** from section 4 into the chat as a single message.
2. Check the reply has one entry per move requested, then copy the JSON.
3. Sign in as a teacher, open `/instructor/moves/import`, paste, and click **Validate Move JSON**. Fix or delete any entry the validator rejects, then click **Add N Draft(s) to Review Report**.
4. Start a new chat for the next batch (long chats drift).

When a few batches are in, open `/instructor/moves`, click **Copy Review Report**, save it as `report.json`, and apply it:

```bash
npx tsx scripts/apply-move-review.ts report.json          # dry run
npx tsx scripts/apply-move-review.ts report.json --write  # writes src/lib/moves/data/
npm test
```

Then commit `src/lib/moves/data/move-drafts.json` and `move-reviews.json` on a branch.

## 3. Standing rules (paste before every batch)

```text
Draft one move-library entry for EACH move listed below, in the order listed, as {"moves": [...]}.

Rules:
- Write your own explanation. Do not copy wording from any school's website or video.
- Cuban casino timing: steps on 1-2-3 and 5-6-7, pauses on 4 and 8. Group step counts as "1-3", "5-7", "1-8", "9-16".
- eightCounts is the length of the whole figure. If the steps go past count 8, eightCounts is at least 2.
- Rueda calls: describe what the couple does AND where the partner change happens (if it changes partner, say so in the summary and add the tag "partner-change").
- ruedaCall: use the exact canonical name only if it is in the schema's list; otherwise "none".
- prerequisites: use the existing move ids from the system instructions, or ids from earlier entries in THIS batch. Never invent an id for a move that is not in the library.
- id: kebab-case of the Spanish name, without accents (e.g. "juana-la-cubana", "ochenta-y-cuatro").
- Level: use the level given below; if you think it is wrong, keep it and say why in notes.
- Safety: any duck-under, wrap, hammerlock, neck slide, dip or jump needs a safety note in commonMistakes.
- If you are not sure how a figure goes (names differ between cities and schools), still give your best version, start notes with "UNSURE:" and say what the teacher should check. Never skip a move silently.
- Afro-Cuban orisha dances are sacred in Regla de Ocha (Santería). Describe them respectfully as dance vocabulary taught in class, name the orisha's attributes and colours correctly, and never present them as entertainment or parody.
- No videos, links or YouTube ids.
```

## 4. The batches

Each batch is ready to paste after the standing rules. Moves already in the library are left out (see section 5).

### Batch 1: Casino figures, Beginner and Improver

```text
Category for all: "Casino figure".
1. Dile que sí (Beginner)
2. Abajo y arriba: turning the closed-position basic clockwise and anticlockwise (Beginner)
3. Cubanito (Improver)
4. Cubanita (Improver)
5. Aguajea (Improver)
6. Ochenta y cuatro (84) (Improver)
7. Setenta y uno (71) (Improver)
8. Preciosa (Improver)
9. Paseo (Improver)
10. Saloneo (Improver)
```

### Batch 2: Casino figures, Intermediate (1)

```text
Category for all: "Casino figure". Level for all: "Intermediate".
1. Balsero
2. Enróscate
3. Juana la Cubana
4. Lazo
5. Ochenta (80)
6. Paséala por arriba
7. Sombrero nuevo
8. Sombrero complicado
9. Tijeras
10. Vacílense
```

### Batch 3: Casino figures, Intermediate (2) and Advanced (1)

```text
Category for all: "Casino figure".
1. Setenta y cinco (75) (Intermediate)
2. Sácala abajo (Intermediate)
3. Candado (Intermediate)
4. Abanico (Intermediate)
5. Bayamo por Matanzas (Advanced)
6. Esquina de Tejas (Advanced)
7. Puente doble (Advanced)
8. Reina (Advanced)
9. Setenta y dos (72) (Advanced)
10. Tijeras complicado (Advanced)
```

### Batch 4: Casino figures, Advanced (2)

```text
Category for all: "Casino figure". Level for all: "Advanced".
1. Vacílala con bamboleo
2. Vacílala con Columbia
3. Vacílala y florea
4. Ochenta y ocho (88)
5. Setenta por las manos
6. Toma eléctrica
```

### Batch 5: Rueda calls, Beginner (1)

```text
Category for all: "Rueda call". Level for all: "Beginner".
1. Dame (Dame una / dame otra)
2. Dame dos
3. Dame una arriba
4. Dos con dos
5. Echeverría
6. Enchufla con mambo
7. Un tarro
8. Vamos abajo / Vamos arriba
9. Al centro (Al medio)
10. Ni pa' ti ni pa' mí
```

### Batch 6: Rueda calls, Beginner (2)

```text
Category for all: "Rueda call". Level for all: "Beginner".
1. Festival de pelota
2. Fly
3. Foto
4. La familia
5. Patín
6. Pelota (una, dos, tres)
7. Prima con la hermana
8. Sombrero con mambo
9. ¡Mentira!
10. Exhíbela > repite
```

### Batch 7: Rueda calls, Improver (1)

```text
Category for all: "Rueda call". Level for all: "Improver".
1. Adentro y afuera
2. Americano / Americana
3. Cero
4. Dame pa' atrás
5. Dame por la mano
6. Dame rápido
7. Doble play
8. Triple play
9. Enchufla con vuelta
10. Enchufla con Manolín
```

### Batch 8: Rueda calls, Improver (2)

```text
Category for all: "Rueda call". Level for all: "Improver".
1. Enchufla con palma y pata'
2. Enchufla con rumba
3. Enchufla y escóndete
4. Enchúflense
5. Engáñala
6. Panqué
7. Patineta
8. Príncipe bueno / Príncipe malo
9. Saca la vecina
10. Saluda
```

### Batch 9: Rueda calls, Improver (3)

```text
Category for all: "Rueda call". Level for all: "Improver".
1. Tobillo
2. Una media
3. Yogur
4. Flor
5. Cadena
6. Camina
7. Contra mambo
8. Derecha / Izquierda
9. Festival de fly (los tres)
10. Prima doble
```

### Batch 10: Rueda calls, Intermediate (1)

```text
Category for all: "Rueda call". Level for all: "Intermediate".
1. Alarde
2. Amistad
3. Babosa
4. Cangrejo
5. Consorte
6. Cruce
7. Egoísta
8. El puente
9. Enchufla moderno
10. Enchufla y adiós
```

### Batch 11: Rueda calls, Intermediate (2)

```text
Category for all: "Rueda call". Level for all: "Intermediate".
1. Enchufla y rodeo
2. Enróscala
3. Isaura
4. La prima cruzada
5. Media doble
6. Mujeres al centro
7. Parte el brazo
8. Paséala por Bayamo
9. Pelota loca
10. Quédatela
```

### Batch 12: Rueda calls, Intermediate (3)

```text
Category for all: "Rueda call". Level for all: "Intermediate".
1. Saborea
2. Seis y nueve
3. Sombrero y plancha
4. Vacílala completa
5. Ya tú sabes
6. Caja de bolas
7. Estrella (se fue)
8. Tumba francesa
9. Rotonda > tráfico
10. Cambio de pareja
```

### Batch 13: Rueda calls, Advanced

```text
Category for all: "Rueda call". Level for all: "Advanced".
1. Sale tú
2. Compota
3. Dame dos con Cuba
4. El dedo con guarapo y bota
5. Enchufla contra-mambo
6. Enchufla para hombres
7. Indeciso
8. Media triple
9. Ocho para mujeres
10. Pedro Navaja
11. Por mí por ti
12. Salsita
13. Una pa' ti, una pa' mí
14. Adiós doble
```

### Batch 14: Shines (suelta) and body movement

```text
Use the category given for each.
1. Paso de son, danced solo (Shine / suelta, Beginner)
2. Caminando: the walking basic with arms (Shine / suelta, Beginner)
3. Mambo adelante y atrás (Shine / suelta, Beginner)
4. Paso cruzado (cross step) (Shine / suelta, Improver)
5. Paso de cumbia (Shine / suelta, Improver)
6. Suzie Q (Shine / suelta, Improver)
7. Arrollao: the conga comparsa walk (Shine / suelta, Improver)
8. Hombros: shoulder movement and shimmy (Body movement, Beginner)
9. Cadera: Cuban hip action from the knees (Body movement, Beginner)
10. Bloqueo: the body "block" accent in timba despelote (Body movement, Intermediate)
```

### Batch 15: Rumba, son and other Cuban dances

```text
Use the category given for each.
1. Yambú basics (Rumba, Improver)
2. Botao: the follower's answer to the vacunao (Rumba, Intermediate)
3. Rumba arms and the pañuelo (handkerchief) (Rumba, Intermediate)
4. Son montuno: closed-position basic and turns (Son, Improver)
5. Changüí basics (Son, Intermediate)
6. Danzón basics (Son, Intermediate)
7. Chachachá cubano basics (Son, Beginner)
8. Reparto basic step (Reparto, Beginner)
9. Reparto: three more steps teachers commonly use in class, named as they are called in Cuba (Reparto, Improver). Start notes with "UNSURE:" if the names vary.
```

### Batch 16: Orishas

```text
Category for all: "Afro-Cuban Orishas". Level for all: "Intermediate".
1. Oyá
2. Obatalá
3. Ochosi
4. Babalú Ayé
5. Yemayá: her own entry, beyond the existing introduction
6. Oggún: his own entry, beyond the existing introduction
```

## 5. Already in the library (don't draft again)

Guapea · Dile que no · Enchufla (simple and doble) · Prima (Adiós) · Exhíbela (Sácala) · Paso básico, lateral y atrás · Rueda level 1 essentials · Finding beat 1 and the conga tumbao · Setenta · Setenta complicado · Vacílala · Sombrero · Kentucky · Paséala · Rumba guaguancó basics and the vacunao · Son contratiempo · Son clave direction · Montaña · Dedo, El uno and El dos · Siete and Siete loco · Coca-Cola and Bayamo · Despelote · Orishas intro (Eleguá, Yemayá, Oggún) · Timba anatomy · Micro-leading · Rhythm reversals · Tembleque · Rumba Columbia and orishas (Changó, Ochún) · Rueda cruzada and Pa'fuera · Rumba clave syncopation.

If a teacher wants one of these split into separate entries (for example Enchufla doble on its own), draft it as a new id and reject or edit the combined one at the review desk.

## 6. For the teachers

- **Approve** only after you have danced or counted it on the music. The approve button stays locked until you tick "I counted this on the music".
- Names vary between cities. If Salsa Explosion calls a figure something else, change the name and keep the other one in *Variations*.
- **Reject** anything you don't teach. It disappears from the library, and it can be drafted again later.
- Attach a video at the review desk (YouTube search or a link, with start and end times). Gemini never adds videos.

## Sources

These lists supplied the names only. None of their text is used.

- Rueda.Casino, [All casino figures](https://rueda.casino/casino/all-casino-figures/) and [All rueda figures](https://rueda.casino/rueda/all-rueda-figures/)
- La Friquedance Company, [Rueda de casino calls](https://www.lafriquedancecompany.nl/rueda-de-casino-calls/)
- Wikipedia, [Rueda de casino](https://en.wikipedia.org/wiki/Rueda_de_casino) and [Cuban salsa](https://en.wikipedia.org/wiki/Cuban_salsa)
