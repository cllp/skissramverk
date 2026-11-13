# Skissramverk

CP:s redaktionella skisstil för sidor, presentationer och beslutsunderlag. Innehållet
beskrivs som JSON eller YAML, och ramverket renderar det till PNG och PDF med HTML, CSS,
rough.js för de skissade accenterna och headless Chrome. A4 liggande, 1600 × 1131 px.

Det här repot är den enda källan till ramverket. Alla repon använder det härifrån.
Agenter: läs [`AGENTS.md`](AGENTS.md) och [`OVERLAMNING.md`](OVERLAMNING.md).

## Rendera

Från vilket repo som helst, utan installation:

```
npx --yes github:cllp/skissramverk min-spec.json out
```

Lokalt i det här repot:

```
npm install
node render.js examples/exempel-neutralt.json out
npm run exempel
```

Flaggor: `--pdf-only`, `--png-only`, `--seed N`, `--scale 2`.
Exit 0 betyder att QA inte hittade fel, 1 att QA hittade fel, 2 att något gick sönder.

Krav: Node 18 eller senare, Chrome eller Chromium (annars `CHROME_PATH`), typsnitten DejaVu Serif och DejaVu Sans.

## Minsta spec

```json
{"pages":[{"eyebrow":"Exempel","title":"Tre steg till ett beslut","mark":"Tre steg",
 "blocks":[{"type":"chain","tone":"ockra","steps":[{"title":"Förslag"},{"title":"Möte"},{"title":"Protokoll"}]}]}]}
```

**Två profiler.** `skiss` är förvalet: papper, serif och lätt skissade accenter. `lifehub` ger mörk skogsgrön eller ljus kräm, Jost och Inter, fyllda kort och raka linjer. Välj med `"profil": "lifehub"` i specen och `"yta": "ljus"` per sida. Exempel: `examples/exempel-lifehub.json`.

Specens form, profilerna, alla komponenter, stilregler och kvalitetskontroll:
[`skills/skissramverk/SKILL.md`](skills/skissramverk/SKILL.md).

## Använda i ett repo

1. **Skillen för Claude Code.** Lägg till i repots `.claude/settings.json`:

   ```json
   {
     "extraKnownMarketplaces": {
       "skissramverk": {"source": {"source": "github", "repo": "cllp/skissramverk"}}
     },
     "enabledPlugins": {"skissramverk@skissramverk": true}
   }
   ```

   Då har varje session i repot, även i molnet, skillen `skissramverk` med stilreglerna.
   För bara din egen dator räcker det att köra en gång i Claude Code:

   ```
   /plugin install skissramverk --marketplace cllp/skissramverk
   ```

2. **Andra agenter.** Lägg en rad i repots `AGENTS.md` eller README:

   > Dokument i CP:s skisstil görs med `cllp/skissramverk`, se dess AGENTS.md.
   > Rendera med `npx --yes github:cllp/skissramverk <spec> <ut>`.

3. **Projektets egna regler** (innehåll, ord, vad tonerna betyder) skrivs i projektmappens
   `_projektminne.md`, inte här.

Repon som använder ramverket: `cllp/kulturrum` (föreningens arbetssätt). Ursprunget är `cllp/TAM`.

## Filer

```
render.js            spec till HTML, PNG per sida och PDF, med QA
lib/build-html.js    spec till HTML, alla komponenter
lib/accents.js       körs i webbläsaren: mäter, ritar accenter, QA
lib/rough.js         rough.js
tokens.css           palett, typografi, mått. Ändra här, inte i komponenterna
skiss.css            komponenternas layout (profilen skiss)
profiler/lifehub.css profilen lifehub, läggs ovanpå när specen väljer den
examples/            neutrala exempel
skills/skissramverk/ skillen för Claude Code
.claude-plugin/      plugin och marketplace för Claude Code
AGENTS.md            instruktioner till alla agenter
```
