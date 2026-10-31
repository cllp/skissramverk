# Till alla agenter

Gäller Claude, Grok och alla andra agenter som gör dokument åt CP.

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
