# Till alla agenter

Gäller Claude, Grok och alla andra agenter som gör dokument åt CP.

## Välj stil med beställaren

**Skissramverket** är namnet på hela verktyget och repot. Det finns två val av stil:

- **Redaktionell:** den ursprungliga stilen från TAM. Ljust papper, serifrubriker,
  salvia och ockra, tunna linjer och lätt skissade accenter.
- **LifeHub:** LifeHubs visuella identitet. Skogsgrönt och kräm, Jost och Inter,
  fyllda kort och raka linjer. Mörk och ljus yta är varianter inom samma profil.

Om beställaren inte uttryckligen har angett stil för dokumentet eller uppdraget,
**fråga innan du skapar eller renderar det**:

> Vilken stil vill du använda: Redaktionell eller LifeHub?

Lista alltid båda alternativen. Gissa inte utifrån projektnamn, repo, tidigare dokument
eller renderarens tekniska förval. Ett uttryckligt stilval för hela det aktuella uppdraget
behöver inte frågas om igen. Om LifeHub är valt men ytan inte angiven kan profilens
tekniska förval användas; mörk och ljus är inte ytterligare stilalternativ.

Läs README:s avsnitt om aktuellt profilstöd innan du väljer tekniska fält. På nuvarande
main finns bara originalstilen utan profilfält; PR 2 inför LifeHub och använder ännu
`skiss` som originalets tekniska id. Redaktionell är det beslutade namnet, men skicka
inte `profil: redaktionell` till en renderer som ännu inte stöder det. Om vald stil inte
stöds, säg det och ordna rätt rendererrevision; byt aldrig stil tyst.

## Arbetsgång för ett dokument

1. Läs det aktuella projektets regler och dokumentmappens `_projektminne.md`.
2. Bekräfta stil enligt regeln ovan. Läs `skills/skissramverk/SKILL.md` för spec och layout.
3. Skriv JSON eller YAML i dokumentets eget repo. Använd komponenterna i README.
4. Rendera med den gemensamma renderaren. Kräv exit 0 och `QA: inga fel`.
5. Öppna och granska varje sid-PNG. Kontrollera innehåll, källor, läsordning och layout.
6. Leverera versionsmärkta filer och uppdatera `_projektminne.md`. Skriv aldrig över
   tidigare dokumentversioner.

## Det viktigaste

- **Ett ramverk, en källa.** Alla sidor, presentationer och beslutsunderlag i CP:s stil görs
  med `cllp/skissramverk`. Kopiera inte ramverket in i andra repon. Finns en gammal kopia,
  använd den inte för nya dokument.
- **Kör det direkt från GitHub** i det repo där dokumentet hör hemma:

  ```
  npx --yes github:cllp/skissramverk <spec.json> <utkatalog>
  ```

- **Innehållet stannar i sitt repo.** Spec, skript, PDF och PNG ligger i projektets repo.
  Hit kommer bara ramverket: kod, stil, komponenter och neutrala exempel. Inget
  projektinnehåll, inga namn och inga hemligheter i det här repot.
- **Specen är källan.** Ändra i JSON eller YAML, aldrig i genererad HTML, PNG eller PDF.
  Ny version blir ny fil, skriv aldrig över en tidigare.
- **Läs projektets regler först.** Varje projektmapp har `_projektminne.md` med
  innehållsregler och versionslogg. Uppdatera det när du gör en ny version.

Hela arbetssättet, stilreglerna, specens form och komponenterna står i
[`skills/skissramverk/SKILL.md`](skills/skissramverk/SKILL.md). Läs den innan du gör ett dokument.

## Ändra ramverket

- Ändringar i ramverket (komponenter, tokens, QA) görs med en liten PR här, med
  ett neutralt exempel i `examples/` som visar ändringen.
- Rendera alla exempel innan PR: `npm install && npm run exempel`. QA ska säga "inga fel".
- Ändra inte färger, typsnitt eller typskala utan CP:s ja. Det slår igenom i alla dokument.
- En ändring får inte göra att befintliga specar i andra repon ser annorlunda ut,
  om det inte är syftet och CP har sagt ja.

## CP-regler

- Svenska, kort. Inga tankstreck.
- Inga hemligheter i chatt, kod eller repo.
- Skarpa raderingar, utskick och nya repon kräver CP:s ja.
