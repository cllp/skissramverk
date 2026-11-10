---
name: skissramverk
description: Använd när en sida, en presentation, en ritning eller ett beslutsunderlag ska göras i CP:s redaktionella skisstil (serif, mycket luft, ockra understrykning, lätt skissade kort och pilar). Innehållet beskrivs som JSON eller YAML och renderas till PNG och PDF med cllp/skissramverk. Gäller kort, tabeller, flöden, stegflöden och simbanor i alla CP:s repon.
---

# Skissramverk

Ett ramverk för alla CP:s dokument som ska se likadana ut oavsett repo och agent.
Källan är `cllp/skissramverk`. Kopiera inte ramverket in i andra repon. Ändringar
görs med en PR i `cllp/skissramverk`.

## Så används det

1. Skriv en spec i JSON eller YAML i det egna repot, bredvid dokumentet den hör till.
   Specen är källan. Ändra aldrig i genererad HTML, PNG eller PDF.
2. Rendera från repots rot eller specens mapp:

   ```
   npx --yes github:cllp/skissramverk <spec.json> <utkatalog>
   ```

   Flaggor: `--pdf-only`, `--png-only`, `--seed N` (samma seed ger samma skisslinjer),
   `--scale 2` (skarpare PNG). Utan utkatalog skrivs filerna till `./out`.
3. Läs QA-raden. Exit 0 är inga fel, 1 är QA-fel (filerna skrivs ändå), 2 är att något gick sönder.
4. Titta på varje sid-PNG med Read-verktyget. QA ser inte allt.
5. Lägg PDF (och vid behov PNG) i det egna repot med versionsnummer i filnamnet.
   Skriv aldrig över en tidigare version.

Kräver Node 18 eller senare, Chrome eller Chromium (hittas i `/usr/bin/google-chrome`,
`/opt/pw-browsers/chromium` med flera, annars `CHROME_PATH`) och typsnitten DejaVu Serif och DejaVu Sans.

Versioner av en spec görs gärna med ett litet skript som läser föregående version och
skriver nästa, till exempel `generera-spec-v1.15.py` som läser v1.14. Då syns varje ändring.

## Stilregler

Gör:
- DejaVu Serif för rubriker, namn och nummer. DejaVu Sans för brödtext, etiketter och fotnoter.
- En budskapsrubrik per sida, få block, stora mellanrum. Hellre två sidor än en trång.
- Raka tunna linjer bär strukturen. Skissat bara som accent: en ockra understrykning
  av rubrikens nyckelord (`mark`), lätt skissad ram på kort, pilar i flöden.
- En ton per sak, konsekvent i hela dokumentet.
- Svensk text med åäö, korta meningar, datum som "den 31 oktober 2026".
- Källa i fotnoten när ett påstående bygger på ett beslut eller dokument.
- Ärlig sammanfattning. Rita aldrig in sådant som inte finns.

Gör inte:
- Inga tankstreck (– eller —). Komma, kolon eller punkt. QA stoppar tankstreck.
- Inga fyllda färgplattor, skuggor, gradienter, rundade app-kort eller handskriftsfont.
- Ingen text som klipps eller överlappar. Mät i webbläsaren, gissa aldrig utifrån teckenantal.
- Högst en ockra understrykning per sida.
- Ändra inte färger eller storlekar per sida. Ändra tokens i `cllp/skissramverk`.

## Tokens

Papper #faf7f1, creme #f3eee4, bläck #2e2a24, salvia #4e7558, ockra #bf9522,
terrakotta #c0683a, lera #8a8073. Sida 1600 × 1131 px (A4 liggande).
Toner i specen: `salvia`, `ockra`, `terrakotta`, `lera`, `ink`.

Vad tonerna betyder bestäms per projekt och skrivs i projektets `_projektminne.md`.
Vanligast: salvia fungerar eller huvudton, ockra finns men oprövad eller accent,
terrakotta saknas, lera neutral eller sekundär.

## Specens form

```yaml
title: Dokumentets namn
meta: Projekt, version 1.0            # uppe till höger, kan sättas per sida
footer: Sida 1 av 3, läget den 31 oktober 2026   # kan sättas per sida
pages:
  - eyebrow: Område 1 av 3
    title: En förfrågan får svar inom en vecka
    mark: inom en vecka               # måste finnas ordagrant i title
    lede: En rad ingress
    status: {text: Finns men är inte prövad, tone: ockra}
    source: Styrelsebeslut den 18 september 2026
    bodyTop: 40                       # avstånd rubrik till innehåll (px)
    gap: 28                           # avstånd mellan block (px)
    blocks: [ ... ]
```

## Komponenter (block.type)

| type | Fält | Används till |
|---|---|---|
| columns | widths [1,1], cols [[block...],...] | spalter |
| cards | cols, compact, tight, items [{icon,label,title,sub,text,status,tone}] | kort med skissad ram, även numrerade steg ("Steg 1"). `tight` för 6 till 7 kolumner |
| rows | cols, compact, items [{nr,title,sub,text,status,tone}] | rader med tunn linje och nummer |
| process | lanes [..], nodes [{id,t,lane,col,strong,w}], edges [{from,to,label,sub,lw}], cols, height, nodeW, nodeH | stegflöde med simbanor och etiketter på pilarna |
| flow | sources [{icon,title,sub,label,tone,dashed}], hub {...}, target {...} | källor via nav till mål, högst cirka fem källor |
| chain | tone, steps [{title,text}] | enkel pil mellan steg |
| steps | heading, tone, items [text] | numrerad lista |
| list | heading, tone, items [text] | lista med tonlinje |
| text | heading, tone, body (text eller lista) | stycken |
| callout | heading, tone, text, notes [text] | stor rad i serif, till exempel "Varför det behövs" |
| persona | icon, title, sub, tone, status | person eller maskin |
| table | heading, head [..], rows [[cell...]] | tabell, en cell {text,tone} blir statusring |
| tags | heading, items [text] | små etiketter |
| legend | items [{text,tone}] | färgförklaring |
| status | text, tone | fristående statusring |
| photos | cols, height, compact, items [{src,title,sub,credit,tone,status}] | bilder med rubrik och källa. `src` är en fil relativt specens mapp (jpg, png, webp, svg) och bäddas in i HTML |

Ikoner är Lucide-namn (lucide-static), till exempel inbox, users, gavel, wallet,
calendar-check, folder-open, scale, repeat. Ett okänt namn ger fel direkt.

## Kvalitetskontroll

1. Läs QA-raden. Den fångar text som klipps, går utanför sidan eller ner i fotnoten,
   överlappar annan text, ringar som rör text, samt tankstreck.
2. Titta på varje sid-PNG. Pilar som trängs, obalans och tomma ytor ser bara ögat.
3. Läs texten: åäö, inga tankstreck, datum och namn stämmer mot källan.
4. Går en sida inte ihop: korta texten, sätt compact eller tight, minska gap eller bodyTop,
   dela sidan. Ändra inte typstorlekar per sida.

## Projektregler

Ramverket bär stilen. Innehållsregler hör till projektet och står i projektets
`_projektminne.md`, till exempel vilka ord som inte får användas, roller i stället för namn
eller vad en ton betyder. Läs det innan du ändrar ett dokument.
