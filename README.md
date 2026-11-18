# Skissramverket

Skissramverket är CP:s gemensamma verktyg för presentationer, dokumentation, skisser och
beslutsunderlag. Ett dokument beskrivs i JSON eller YAML och renderas till HTML, PNG och PDF.
Samma innehåll och komponenter kan användas med olika visuella profiler.

**Skissramverket är namnet på hela repot. Redaktionell och LifeHub är profilerna.**
Stilen väljs för dokumentet, inte efter vilket repo dokumentet råkar ligga i. Om beställaren
inte har angett stil ska agenten fråga: **”Vilken stil vill du använda: Redaktionell eller
LifeHub?”** Agenternas arbetsinstruktion finns i [AGENTS.md](AGENTS.md).

## Profiler och aktuellt stöd

CP har valt två profilnamn:

- **Redaktionell:** den ursprungliga stilen från TAM. Ljust papper, DejaVu Serif i rubriker,
  DejaVu Sans i brödtext, salvia och ockra, tunna linjer och lätt skissade accenter.
  Passar bland annat presentationer, resonemang, ritningar och beslutsunderlag.
- **LifeHub:** LifeHubs visuella identitet. Skogsgrönt och kräm, Jost i rubriker, Inter i
  brödtext, fyllda kort och raka linjer. Har mörk och ljus yta för olika sidor.

**Leveransläget ska skiljas från namnvalet:** på main finns den ursprungliga stilen ännu som
enda stil, utan profilfält. [PR 2](https://github.com/cllp/skissramverk/pull/2) inför profilval
för LifeHub och kallar i sin nuvarande form originalets tekniska id `skiss`. Det valda namnet
är Redaktionell; `redaktionell` ska inte användas som ett fungerande tekniskt id förrän
namnbytet också är genomfört i renderaren. Okända fält kan annars ignoreras av den äldre
renderaren och ge fel stil utan felmeddelande.

I PR 2 väljs LifeHub med `"profil": "lifehub"`. `"yta": "mork"` eller `"yta": "ljus"`
kan anges för hela dokumentet eller per sida. Sidans val går före dokumentets. Mörk yta är
LifeHubs tekniska förval där. Kontrollera att profiländringen är mergad innan kommandot
från huvudgrenen används för LifeHub. Samma komponenter och innehållsfält används i båda
profilerna. I LifeHub blir `mark` accentfärgad text och status fyllda etiketter; i den
ursprungliga stilen används skissad understrykning och ringar.

## Kom igång

Krav: Node 18 eller senare samt Chrome eller Chromium. Ange `CHROME_PATH` om webbläsaren
inte hittas automatiskt. Den ursprungliga stilen kräver installerade DejaVu Serif och
DejaVu Sans. LifeHub-förslaget i PR 2 bäddar in Jost och Inter i den genererade HTML-filen.
Åtkomst till GitHub-repot krävs när verktyget hämtas därifrån.

Kör från projektet där dokumentet hör hemma:

```sh
npx --yes github:cllp/skissramverk docs/min-spec-v1.0.json docs/ut
```

För lokal utveckling av ramverket:

```sh
npm ci
node render.js examples/exempel-neutralt.json out
npm run exempel
```

Renderaren skriver HTML och normalt både en PNG per sida och en PDF för hela dokumentet.
Exempelvis ger `min-spec-v1.0.json` filerna `min-spec-v1.0.html`, `min-spec-v1.0-s1.png`
och `min-spec-v1.0.pdf`. Utan utkatalog används `./out`.

Flaggor:

- `--pdf-only`: skriv PDF och HTML, inga sid-PNG.
- `--png-only`: skriv sid-PNG och HTML, ingen PDF.
- `--seed N`: bestäm skisslinjernas slumpfrö; förval 7.
- `--scale 2`: högre pixeltäthet för PNG. Sidans layoutmått är samma.

Exitkod 0 betyder att QA inte hittade fel, 1 att QA hittade fel och 2 att körningen gick
sönder. Filer kan vara genererade även vid QA-fel; deras existens betyder inte att de är godkända.

## Så är ett dokument uppbyggt

Hierarkin är **dokument → sidor → block → innehåll**. Dokumentets `pages` innehåller sidor,
och varje sidas `blocks` innehåller komponenterna i läsordning. Formatet är A4 liggande,
med layoutmått 1600 × 1131 px.

Det här är ett komplett minimalt exempel för den ursprungliga stilen på main:

```json
{
  "title": "Plan för arbetet",
  "meta": "Version 1.0",
  "footer": "Underlag för samtal",
  "pages": [
    {
      "eyebrow": "Arbetssätt",
      "title": "Tre steg till ett beslut",
      "mark": "Tre steg",
      "lede": "Ett förslag blir ett gemensamt beslut.",
      "source": "Projektets beslutade arbetssätt",
      "blocks": [
        {
          "type": "chain",
          "tone": "salvia",
          "steps": [
            {"title": "Förslag", "text": "Beskriv behovet."},
            {"title": "Samtal", "text": "Pröva alternativen."},
            {"title": "Beslut", "text": "Skriv vad som gäller."}
          ]
        }
      ]
    }
  ]
}
```

Dokumentets `title` är HTML-titeln. Sidans `title` är den synliga huvudrubriken.
`meta` och `footer` kan sättas för hela dokumentet och ersättas per sida. `eyebrow` är
överrubriken, `lede` ingressen och `source` källan i fotnoten. `mark` måste finnas ordagrant
i sidans rubrik. `bodyTop` anger avståndet före blocken och `gap` mellanrummet mellan dem.
Profil väljs för hela dokumentet; mörk eller ljus yta hör till LifeHub och kan variera per sida.

## Komponenterna

Blockets `type` väljer komponent. Använd komponenter för strukturen och håll projektets
innehåll i specen. Följande komponenter finns i renderaren:

- **`columns`**, spalter med andra block. Ange `cols` som en lista av blocklistor och
  valfritt `widths`, exempelvis `[2, 1]`, för relativa spaltbredder.
- **`cards`**, kort för alternativ, områden eller numrerade steg. Ange `items` med
  `title` och vid behov `icon`, `label`, `sub`, `text`, `tone`, `status`. `cols` väljer
  antal kolumner; `compact` och `tight` ger tätare layout.
- **`rows`**, innehåll i rader med tunn avdelningslinje. Varje post i `items` kan ha
  `nr`, `title`, `sub`, `text`, `tone`, `status`. Styrs med `cols` och `compact`.
- **`flow`**, flera källor via ett nav till ett mål. Ange `sources`, `hub` och valfritt
  `target`. Noder har `title`, `sub`, `icon`, `tone`; källor kan ha `label` och `dashed`.
- **`chain`**, en enkel följd av steg med pilar. Ange `steps` med `title` och valfri
  `text`, samt en gemensam `tone`.
- **`process`**, ett stegflöde med simbanor. Ange `lanes`, `nodes` och `edges`.
  Noder använder `id`, `t`, `col`, `lane`, valfritt `strong` och `w`. Kolumn och bana
  räknas från 0. Kanter använder `from`, `to`, valfritt `label`, `sub`, `lw`.
  `cols`, `height`, `nodeW`, `nodeH` styr utrymmet. Utan `edges` länkas noderna i ordning.
- **`steps`**, en numrerad textlista. Ange `items` som strängar, valfri `heading` och `tone`.
- **`list`**, en punktlista. Samma innehållsfält som `steps`.
- **`text`**, ett eller flera stycken. `body` är en sträng eller lista av strängar;
  `heading` och `tone` är valfria.
- **`callout`**, ett framhävt budskap. Ange `text`, valfri `heading`, `tone` och
  `notes` som en lista av kompletterande stycken.
- **`persona`**, en roll eller aktör. Ange `title`, valfri `icon`, `sub`, `tone`, `status`.
- **`table`**, en tabell. Ange rubrikceller i `head` och rader som cellistor i `rows`.
  En cell är text eller ett statusobjekt med `text` och `tone`. `heading` är valfri.
- **`tags`**, korta etiketter. Ange strängar i `items` och valfri `heading`.
- **`legend`**, en färgförklaring. Ange `items` med `text` och `tone`.
- **`status`**, en fristående statusmarkering. Ange `text` och `tone`.
- **`photos`**, bilder med rubrik och källa. Ange `items` med `src`, valfri `title`,
  `sub`, `credit`, `tone`, `status`. `cols`, `height` och `compact` styr layouten.
  Lokala bildsökvägar räknas från specens mapp och bäddas in i HTML som data-URI.

Ikoner anges med namn från `lucide-static`, exempelvis `inbox`, `users` eller `folder-open`.
Ett okänt ikonnamn eller en okänd komponent stoppar renderingen. Renderaren är inte en
fullständig schemavaliderare; utgå från exemplen och kontrollera resultatet.

## Toner och innehåll

Komponenternas `tone` kan vara `salvia`, `ockra`, `terrakotta`, `lera` eller `ink`.
Tonen är en roll i dokumentets färgspråk. Profilen bestämmer hur den ser ut.
Projektets `_projektminne.md` beskriver vad tonerna betyder i just det projektet.
Vanliga betydelser är huvudspår eller fungerar, accent eller oprövat, problem, neutralt
respektive bläck. Byt inte betydelse mellan sidor utan förklaring.

Skriv svenska med åäö, tydliga budskapsrubriker och källor för påståenden. Inga tankstreck.
Om en sida blir trång: korta innehållet, använd komponentens täta variant eller dela sidan.
Ändra inte typsnitt och färger i en enskild projektspec för att få plats.

## Från beställning till godkänt dokument

1. Läs projektets regler och `_projektminne.md`. Klargör syfte, mottagare och stil.
   Saknas stilval, fråga och erbjud Redaktionell och LifeHub. Saknat val i en gammal
   spec är inte beställarens godkännande av en stil för ett nytt dokument.
2. Skriv eller ändra JSON/YAML i dokumentets eget projekt. Kontrollera att den valda
   profilen stöds av den rendererrevision som ska användas.
3. Rendera. Kräv `QA: inga fel` och exit 0.
4. Öppna varje sid-PNG. Kontrollera läsordning, pilar, balans, bildkällor och textens
   riktighet. Automatisk QA ersätter inte granskning med ögat.
5. Leverera versionsmärkta filer. Ny version får nya filnamn; skriv inte över historiken.
6. Uppdatera `_projektminne.md` med versionen och vad som ändrats.

QA mäter bland annat klippt och överlappande text, sidmarginaler, fotnoter och förbjudna
tecken. Godkänd QA bevisar inte att innehållet är sant eller att en presentation är lätt att förstå.

## Vad ligger var?

**I skissramverket:** gemensam renderare, komponenter, profiler, tokens, QA och neutrala
exempel. Här finns inga projektspecifika presentationer, personuppgifter eller hemligheter.

**I projektets eget repo:** specen, versionsskript, PDF, PNG och `_projektminne.md`.
Kopiera inte ramverkskoden dit. Använd den gemensamma källan.

Viktiga filer i detta repo:

- `render.js`: kommandoraden, läser specen, startar Chrome och skriver utdata.
- `lib/build-html.js`: bygger HTML för sidor och komponenter.
- `lib/accents.js`: mäter element, ritar accenter och utför QA i webbläsaren.
- `lib/rough.js`: biblioteket för skissade linjer.
- `tokens.css`: grundpalett, typsnitt, typstorlekar och sidmått.
- `skiss.css`: komponenternas grundlayout.
- `profiler/lifehub.css`: profilens tilläggsstil i PR 2, ännu inte i main.
- `examples/`: neutrala exempel som visar och verifierar funktionerna.
- `skills/skissramverk/SKILL.md`: detaljerad arbetsinstruktion och specguide.
- `AGENTS.md`: gemensamma instruktioner för alla agenter.
- `.claude-plugin/`: registrering av skillen för Claude Code.

## Underhåll och vidareutveckling

Ändra ramverket i en liten PR med ett neutralt exempel som visar förändringen. Rendera
alla exempel med `npm run exempel`, läs QA och granska sidbilderna. Kontrollera båda
profilerna när profilvalet är levererat. Befintliga dokument ska behålla sitt utseende om
CP inte uttryckligen har beställt en förändring.

Gemensamma färger, typsnitt och typstorlekar ändras bara med CP:s godkännande. En ny
komponent eller profil beskrivs både här och i skillen. Håll statusavsnittet ovan aktuellt
när profilvalet och namnbytet mergas. Äldre överlämningar är historik; använd aktuella
AGENTS.md, README och kod för nya arbeten.

För Claude Code kan skillen anslutas med `skissramverk@skissramverk` från GitHub-repot
`cllp/skissramverk`. Andra agenter börjar med AGENTS.md och skillfilen. Projektrepot ska
peka på den gemensamma instruktionen, inte bära en handskriven kopia av ramverket.
