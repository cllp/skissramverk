# Överlämning till alla agenter: skissramverket

Från CP, den 31 oktober 2026. Gäller alla agenter och alla repon.

## Vad som gäller från i dag

Skissramverket, CP:s redaktionella skisstil för sidor, presentationer och beslutsunderlag, har ett eget repo: **https://github.com/cllp/skissramverk**. Det är den enda källan. Läs `AGENTS.md` och `skills/skissramverk/SKILL.md` där innan du gör ett dokument.

## Så gör du

1. Skriv specen i JSON eller YAML i det repo där dokumentet hör hemma, bredvid dokumentet.
2. Rendera därifrån:
   ```
   npx --yes github:cllp/skissramverk <spec.json> <utkatalog>
   ```
   Flaggor: `--pdf-only`, `--png-only`, `--seed N`, `--scale 2`.
3. Läs QA-raden. "QA: inga fel" krävs. Titta sedan på varje sid-PNG, QA ser inte allt.
4. Lägg PDF och PNG i projektets repo med versionsnummer i filnamnet. Ny version blir ny fil, skriv aldrig över en tidigare.
5. Uppdatera projektets `_projektminne.md` med vad som ändrats i versionen.

Krav: Node 18 eller senare, Chrome eller Chromium (annars `CHROME_PATH`), typsnitten DejaVu Serif och DejaVu Sans.

## Regler

- Kopiera inte ramverket in i andra repon. Finns en gammal kopia, använd den inte för nya dokument.
- Innehållet stannar i sitt repo. Till `cllp/skissramverk` kommer bara ramverket: kod, stil, komponenter och neutrala exempel. Inga namn, inget projektinnehåll, inga hemligheter.
- Specen är källan. Ändra aldrig i genererad HTML, PNG eller PDF.
- Projektets egna regler (ord som inte används, roller i stället för namn, vad tonerna betyder) står i projektmappens `_projektminne.md`. Läs det först.
- Inga tankstreck. QA stoppar dem.
- Ändringar i ramverket görs med en liten PR i `cllp/skissramverk`, med ett neutralt exempel. Färger, typsnitt och typskala ändras inte utan CP:s ja.

## Koppla in ditt repo

Lägg till i repots `.claude/settings.json`, så laddas skillen i varje Claude Code-session, även i molnet:

```json
{
  "extraKnownMarketplaces": {
    "skissramverk": {"source": {"source": "github", "repo": "cllp/skissramverk"}}
  },
  "enabledPlugins": {"skissramverk@skissramverk": true}
}
```

Och en rad i repots `AGENTS.md` eller README:

> Dokument i CP:s skisstil görs med `cllp/skissramverk`, se dess AGENTS.md. Rendera med `npx --yes github:cllp/skissramverk <spec> <ut>`.

## Läget

- Kopplat: `cllp/kulturrum`. Kopian i `arbetssatt/ritregler/skissramverk` är fryst.
- Ursprunget är `cllp/TAM`. TAM:s egna ritregler (vägarna, modellerna A till D) stannar i TAM.
- Ej kopplade än: övriga repon. Varje agent kopplar sitt repo enligt ovan när CP säger ja.
