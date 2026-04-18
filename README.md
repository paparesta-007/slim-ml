# SlimML

Linguaggio markup compatto, progettato per generazione AI-first con sintassi deterministica e compressione lossless verso HTML.

Obiettivi principali:
- ridurre rumore sintattico rispetto a HTML
- mantenere regole semplici e validabili
- facilitare round-trip SlimML <-> HTML
- ottimizzare output per prompt LLM senza perdere semantica DOM

Core engine: src/lib/slimml.ts

## Cosa Include Il Progetto

- parser SlimML con errori strutturati line/column
- AST condiviso per parse, compile, conversione
- compilazione verso HTML string e DOM reale
- conversione HTML -> AST -> SlimML (anche compatto)
- compressione lossless automatica
- stima euristica token e confronto Slim vs HTML

## Perche SlimML

HTML ripete continuamente apertura/chiusura tag, attributi verbosi e rumore lessicale.
SlimML comprime su tre livelli:

1. struttura: indentazione invece di tag di chiusura
2. lessico: alias tag e attributi
3. semantica implicita: default contestuali, boolean flags, ereditarieta

## Esempio Rapido

Input SlimML:

```txt
#home.page[d-theme=light]
  # SlimML: HTML for AI workflows
  &.lead Write less syntax and keep structure readable.
  +.menu [*c=nav-item]
    * Home
    * About
  ?
    |[n=email p="Your email" required]
    $ Subscribe
```

Output HTML:

```html
<div id="home" class="page" data-theme="light">
  <h1>SlimML: HTML for AI workflows</h1>
  <p class="lead">Write less syntax and keep structure readable.</p>
  <ul class="menu">
    <li class="nav-item">Home</li>
    <li class="nav-item">About</li>
  </ul>
  <form>
    <input name="email" placeholder="Your email" required type="text">
    <button type="submit">Subscribe</button>
  </form>
</div>
```

## Grammatica Base

Un nodo per riga:

```txt
tag.class#id[attr=value attr2=value2] testo inline opzionale
```

Regole di parsing:
- indentazione coerente: solo spazi o solo tab per documento
- con spazi: default 2 spazi per livello
- con tab: 1 tab per livello
- opzionale modalità minified: prefisso numerico di profondità per riga (es: 0..., 1..., 2...)
- salto indentazione massimo +1 livello per riga
- commenti con prefisso //
- heading Markdown-like da # a ######
- text node puro con prefisso | seguito da spazio

## Catalogo Completo Delle Compressioni

Questa sezione descrive tutte le compressioni attualmente implementate nel motore.

### 1) Compressione Strutturale

Descrizione:
- niente tag di chiusura in input
- gerarchia espressa solo con indentazione

Esempio:

```txt
~
  & Ciao
```

### 2) Alias Tag

Mappa alias -> tag:
- ~ -> div
- ^ -> span
- @ -> a
- $ -> button
- ! -> img
- | -> input
- % -> section
- + -> ul
- * -> li
- = -> ol
- ? -> form
- : -> label
- , -> textarea
- & -> p
- N -> nav
- H -> header
- F -> footer
- M -> main
- A -> article
- Z -> aside
- B -> strong
- I -> em
- ` -> code
- P -> pre
- G -> figure
- f -> figcaption
- D -> details
- S -> summary
- X -> dialog
- Q -> blockquote
- T -> table
- E -> thead
- Y -> tbody
- R -> tr
- C -> td
- U -> th
- V -> select
- O -> option
- J -> script
- L -> link
- m -> meta
- w -> dl
- x -> dt
- y -> dd

Vantaggio:
- riduzione lessicale costante e lossless.

### 3) Alias Attributi

Mappa alias -> attributo:
- h -> href
- s -> src
- a -> alt
- t -> type
- n -> name
- p -> placeholder
- v -> value
- g -> target
- r -> rel
- c -> class
- i -> id
- fl -> for
- ac -> action
- m -> method
- l -> loading
- st -> style
- ro -> role
- x -> tabindex
- lg -> lang
- ss -> srcset
- sz -> sizes
- me -> media
- cs -> colspan
- rs -> rowspan
- w -> width
- ht -> height
- ml -> maxlength
- nl -> minlength
- mn -> min
- mx -> max
- sp -> step
- pt -> pattern
- au -> autocomplete
- dl -> download
- hl -> hreflang
- co -> crossorigin
- fp -> fetchpriority
- ig -> integrity
- ct -> content
- ch -> charset
- rw -> rows
- cl -> cols
- lb -> label
- d-* -> data-*

Vantaggio:
- riduzione rumore su attributi frequenti.

### 4) Compressione Selettori Class e ID

Descrizione:
- class e id possono essere espressi in forma selector-like:
  - .nome-classe
  - #id
- equivalenza lossless con class= e id=

Esempio:

```txt
@.btn#cta[h=/docs] Docs
```

### 5) Attributi Posizionali Compatti

Descrizione:
- su a, un token URL/path senza chiave viene letto come href
- su img, un token URL/path/file senza chiave viene letto come src

Esempi:

```txt
@[/docs] Docs
![hero.png a="Hero image"]
```

Equivalenti verbosi:

```txt
@[h=/docs] Docs
![s=hero.png a="Hero image"]
```

### 6) Input Type Implicito Da Token Singolo

Descrizione:
- dentro blocco attributi di input, un token senza uguale che matcha un tipo comune viene interpretato come type

Esempio:

```txt
|[email n=userEmail]
```

Equivalente:

```txt
|[t=email n=userEmail]
```

Tipi comuni supportati:
- text, password, email, number, search, url, tel, checkbox, radio, submit, reset, button, date, time

### 7) Boolean Flags Senza Valore

Descrizione:
- attributi booleani possono essere scritti senza =true
- parser normalizza true/false quando il nome appartiene al set boolean HTML noto

Esempi equivalenti:

```txt
|[required disabled]
|[required=true disabled=true]
```

Nota:
- false viene mantenuto in AST come boolean false e non emesso nell'HTML finale.

### 8) Default Contestuali Impliciti

Descrizione:
- input senza type esplicito => type="text"
- button fuori da un form senza type esplicito => type="button"
- button dentro form senza type esplicito => type="submit"

Esempio:

```txt
?
  |[n=email]
  $ Invia
```

In modalità compatta, questi type di default vengono omessi in emissione SlimML.

### 9) Ereditarieta Intelligente Su Figli

Descrizione:
- il parent può definire attributi default per i figli diretti di un certo tag
- sintassi: [<aliasTagFiglio><attr>=<valore>]

Esempi:

```txt
+.nav [*class=item]
  * Home
  * About
```

```txt
~.gallery [!a="Gallery image" !loading=lazy]
  ![hero.jpg]
  ![detail.jpg]
```

Regole importanti:
- il tag figlio in ereditarieta usa alias di tag (es. *, @, !)
- class del parent-rule viene mergeata (senza duplicati)
- gli attributi del figlio espliciti vincono su quelli ereditati
- id ereditato si applica solo se il figlio non ha id esplicito

### 10) Flattening Testo Inline In Emissione

Descrizione:
- se un elemento ha un unico figlio text node, compileToSlim lo compatta in testo inline

Da:

```txt
&
  | Ciao
```

A:

```txt
& Ciao
```

### 11) Compressione Lossless Automatica End-To-End

Descrizione:
- compressSlimLossless(source) esegue parse + compileToSlim(compressionMode: 'aggressive')
- applica in cascata tutte le forme di compressione lossless disponibili
- in modalità aggressive, il serializer può sintetizzare childDefaults per classi ripetute sui figli diretti e rimuovere i duplicati dai figli

### 12) Modi Di Compressione Selezionabili

Sono disponibili 4 modalità, selezionabili con `compressionMode`:
- `none`: serializzazione leggibile, senza alias compatti
- `compact`: alias + attributi posizionali + default impliciti, senza sintesi automatica dei childDefaults
- `aggressive`: come `compact` + sintesi automatica childDefaults + indentazione output a tab (salvo override `indent`)
- `minified`: come `aggressive` + prefisso numerico di profondità (zero padding di indentazione)

Compatibilità:
- l'opzione legacy `compact: true` continua a funzionare ed equivale a `compressionMode: 'aggressive'`
- `compact: false` equivale a `compressionMode: 'none'`

## Precedenza E Risoluzione (Dettagli Operativi)

Ordine semantico pratico:

1. parse nodo e attributi espliciti
2. applicazione regole ereditarieta dal parent (solo dove mancano valori)
3. applicazione default contestuali (input text, form button submit)
4. serializzazione HTML o Slim compatto

Priorita:
- esplicito locale > ereditato
- ereditato > assente
- default contestuale solo quando type e ancora assente

## Sintassi Di Riferimento

Forme valide comuni:

```txt
~.box#main[data-x=1] Titolo
@[/docs g=_blank].btn Docs
![/img/hero.webp a="Hero"]
|[n=email p="Email" required]
?.form
  :[for=email] Email
  |#email[n=email required]
  $ Invia
.panel[data-kind=base]
.panel
.panel#main
+.menu [*c=item]
  * Home
```

Nota su spaziatura:
- e valida sia +.menu[*c=item] sia +.menu [*c=item]
- su div puoi omettere `~` quando la riga inizia con `.`, `#` o `[`

## API Completa

Modulo: src/lib/slimml.ts

Tipi principali:
- SlimAttributeValue = string | boolean
- SlimCompressionMode = 'none' | 'compact' | 'aggressive' | 'minified'
- SlimTextNode
- SlimElementNode
- SlimChildDefaultRule
- SlimDocument
- SlimParseError
- SlimParseResult
- HtmlParseResult
- SlimCompileOptions
- TokenComparison

Funzioni esportate:

```ts
parseSlimML(source: string, indentSize?: number): SlimParseResult
compileToHtml(ast: SlimDocument): string
compileToSlim(ast: SlimDocument, options?: SlimCompileOptions): string
compileToDom(ast: SlimDocument, doc: Document): DocumentFragment
parseHtmlToAst(html: string): HtmlParseResult
convertHtmlToSlim(html: string, options?: SlimCompileOptions):
  | { ok: true; slim: string; ast: SlimDocument; warnings: string[] }
  | { ok: false; error: string }
compressSlimLossless(source: string):
  | { ok: true; slim: string; ast: SlimDocument; warnings: string[] }
  | { ok: false; error: SlimParseError }
estimateTokenCount(value: string): number
compareTokenUsage(slim: string, html: string): TokenComparison
formatParseError(error: SlimParseError): string
```

Opzioni `SlimCompileOptions`:
- `compressionMode?: 'none' | 'compact' | 'aggressive' | 'minified'`
- `compact?: boolean` (legacy)
- `indent?: string` (override esplicito dell'indentazione output)

Firma aggiornata compressione:

```ts
compressSlimLossless(source: string, options?: SlimCompileOptions):
  | { ok: true; slim: string; ast: SlimDocument; warnings: string[] }
  | { ok: false; error: SlimParseError }
```

## Stima Token: Nota Importante

La funzione estimateTokenCount usa una euristica chars/4.
Non rappresenta esattamente la tokenizzazione BPE reale dei provider LLM.
Va usata come metrica comparativa interna, non come costo API reale garantito.

## Prompt Master Pronto Da Copiare Per AI

Usa questo blocco come system prompt o instruction base.

```txt
Genera solo SlimML valido.

Regole fondamentali:
- Indentazione coerente: solo spazi (2 per livello) oppure solo tab (1 per livello).
- Un nodo per riga.
- Sintassi nodo: tag.class#id[attr=value ...] testo inline opzionale.
- Commenti con //.
- Testo puro con prefisso "| " (pipe + spazio).
- Heading da # a ######.

Alias tag consentiti:
~ div, ^ span, @ a, $ button, ! img, | input, % section, + ul, * li, = ol, ? form, : label, , textarea, & p, N nav, H header, F footer, M main, A article, Z aside, B strong, I em, ` code, P pre, G figure, f figcaption, D details, S summary, X dialog, Q blockquote, T table, E thead, Y tbody, R tr, C td, U th, V select, O option, J script, L link, m meta, w dl, x dt, y dd.

Alias attributi consentiti:
h href, s src, a alt, t type, n name, p placeholder, v value, g target, r rel, c class, i id, fl for, ac action, m method, l loading, st style, ro role, x tabindex, lg lang, ss srcset, sz sizes, me media, cs colspan, rs rowspan, w width, ht height, ml maxlength, nl minlength, mn min, mx max, sp step, pt pattern, au autocomplete, dl download, hl hreflang, co crossorigin, fp fetchpriority, ig integrity, ct content, ch charset, rw rows, cl cols, lb label, d-* data-*.

Compressioni da preferire (lossless):
1) Usa alias tag/attributi quando possibile.
2) Su link usa forma posizionale: @[/path] invece di @[h=/path].
3) Su immagini usa forma posizionale: ![img.png] invece di ![s=img.png].
4) Su input usa boolean flags senza valore: [required disabled].
5) Ometti type sugli input se e text.
6) Ometti type sui button fuori dai form se e button.
7) Ometti type sui button dentro form se e submit.
8) Usa ereditarieta per attributi ripetuti sui figli diretti, es: +.menu [*c=item] o .btn-group[$c=btn $c=btn-outline-secondary].
9) Se disponibile, usa compressionMode=minified per massima riduzione token lossless.

Semantica implicita da rispettare:
- input senza type => type=text
- button fuori da un form senza type => type=button
- button dentro form senza type => type=submit

Vincoli di validita:
- Nessun salto di indentazione oltre +1 livello.
- Nessun testo inline su tag void come img/input.

Output policy:
- Restituisci solo SlimML, nessun testo extra.
- Se ricevi errori parser, rigenera SlimML corretto mantenendo la stessa semantica.
```

## Sviluppo

Installazione e run:

```bash
npm install
npm run dev
```

Controlli qualità:

```bash
npm run lint
npm run build
```

## Limitazioni Attuali

- nessuna sintassi component/props dedicata
- conteggio token solo euristico
- grammatica volutamente rigida per affidabilità parser
- parsing HTML delegato al comportamento DOMParser/browser (possibile normalizzazione whitespace)

## Roadmap Suggerita

- componenti e macro riusabili
- source-map SlimML -> HTML
- recovery hints automatici per correzione LLM dopo parse error
