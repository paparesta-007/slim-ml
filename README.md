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

## Prompt AI Consigliato

Usa questo prompt quando vuoi convertire o formattare contenuto in SlimML:

```txt
You are a SlimML formatter.
Output only valid SlimML, and nothing else.

Rules:
- one DOM node per line
- output in depth-prefix mode: each line starts with a numeric depth (`0`, `1`, `2`, ...)
- do not use tab/space indentation when depth-prefix numbering is used
- keep declarations tight: tag.class#id[attr=value]
- do not add padding spaces around tags, selectors, brackets, or equals signs
- do not fuse alias and tag names together; write either the alias or the full tag, not both
- when emitting attributes, prefer standard `=` separators inside brackets
- do not write attributes like `tag.attr=value` inside the declaration; use brackets or loose attributes after the declaration
- quote any value that contains spaces; never leave unquoted multi-word attribute values
- prefer SlimML alias tags and alias attributes when available
- preserve DOM semantics and accessibility
- if the input is ambiguous, choose the most lossless representation
- no markdown fences, no explanations, no extra prose
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

### 3.1) Alias Valori Contestuali

Descrizione:
- alcuni valori frequenti hanno alias brevi, riconosciuti solo nel contesto del relativo attributo (e, quando necessario, del tag), evitando ambiguità.

Mappa alias valore -> valore reale:
- `target`: `_b` -> `_blank`
- `loading`: `z` -> `lazy`, `e` -> `eager`
- `method`: `p` -> `post`, `g` -> `get`
- `decoding`: `a` -> `async`
- `crossorigin`: `an` -> `anonymous`
- `autocomplete`: `0` -> `off`, `1` -> `on`
- `fetchpriority`: `hi` -> `high`, `lo` -> `low`
- `rel` su `link`: `s`/`css` -> `stylesheet`, `ico` -> `icon`
- `rel` su `a`: `safe`/`no` -> `noopener noreferrer`

Nota:
- in modalità compatta, il serializer riemette automaticamente questi valori in forma alias quando applicabile.

### 3.2) Mini Alias CSS Inline (`st`)

Descrizione:
- quando l'attributo `st`/`style` contiene dichiarazioni CSS inline, SlimML supporta alias sulle proprietà CSS più frequenti.
- decodifica/ricodifica è contestuale a `style`, quindi non interferisce con alias attributi globali.

Esempio:

```txt
~[st="fw:bold;fs:30px;cu:pointer;co:blue"]
```

Equivalente CSS:

```txt
~[st="font-weight:bold;font-size:30px;cursor:pointer;color:blue"]
```

Alias proprietà supportati (estratto):
- `fw` font-weight, `fs` font-size, `ff` font-family
- `co` color, `bg` background, `bc` background-color
- `cu` cursor, `bd` border, `pd` padding, `mg` margin
- `dp` display, `fd` flex-direction, `ai` align-items, `jc` justify-content
- `wd` width, `hg` height, `mw` max-width, `br` border-radius
- `ta` text-align, `ps` position, `tp`/`rt`/`bt`/`lf` top/right/bottom/left
- `zi` z-index, `ov` overflow, `op` opacity, `tr` transition, `tf` transform
- `gp` gap, `lh` line-height, `ls` letter-spacing, `td` text-decoration
- `bs` box-shadow, `gc` grid-template-columns, `fwr` flex-wrap, `pe` pointer-events, `ws` white-space

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
- su img/video/canvas/svg, un token `NxM` viene letto come `width=N` e `height=M`

Esempi:

```txt
@[/docs] Docs
![hero.png a="Hero image"]
![hero.png 1200x630 a="Hero image"]
```

Equivalenti verbosi:

```txt
@[h=/docs] Docs
![s=hero.png a="Hero image"]
![s=hero.png w=1200 ht=630 a="Hero image"]
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
- script senza type esplicito => omette `t=text/javascript`
- style senza type esplicito => omette `t=text/css`
- form senza method esplicito => omette `m=get`
- form senza enctype esplicito => omette `enctype=application/x-www-form-urlencoded`
- link rel=stylesheet => omette `t=text/css`
- ol senza type esplicito => omette `t=1`
- td/th con colspan=1 o rowspan=1 => omette `cs=1` e `rs=1`
- img con decoding=auto => omette `decoding=auto`

Nota round-trip HTML -> Slim:
- in emissione compatta, i default `type="text"` sugli input e `type="submit"`/`type="button"` sui button vengono omessi anche quando provengono da HTML.

Esempio:

```txt
?
  |[n=email]
  $ Invia
```

In modalità compatta, questi type di default vengono omessi in emissione SlimML.

### 9) Child Tag Impliciti (Container Deterministici)

Descrizione:
- in modalità compatta, alcuni parent consentono di omettere il tag figlio quando il contenuto è testo inline puro

Regole:
- `ul` / `ol` -> figlio implicito `li`
- `select` / `datalist` -> figlio implicito `option`
- `tbody` -> figlio implicito `tr`
- `tr` -> figlio implicito `td`

Esempio:

```txt
+.menu
  Home
  About
  Contact
```

Round-trip:
- il parser espande in modo deterministico ai tag reali, mantenendo round-trip lossless.

### 10) Ereditarieta Intelligente Su Figli

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

### 11) Flattening Testo Inline In Emissione

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

### 12) Compressione Lossless Automatica End-To-End

Descrizione:
- compressSlimLossless(source) esegue parse + compileToSlim(compressionMode: 'aggressive')
- applica in cascata tutte le forme di compressione lossless disponibili
- in modalità aggressive, il serializer può sintetizzare childDefaults per classi ripetute sui figli diretti e rimuovere i duplicati dai figli

### 13) Modi Di Compressione Selezionabili

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
Genera solo SlimML valido. Non aggiungere testo extra.

━━━ REGOLA ASSOLUTA: INDENTAZIONE ━━━
Ogni figlio DEVE essere indentato di UN livello rispetto al padre.
Usa SOLO spazi (2 per livello) oppure SOLO tab (1 per livello) — mai misti.
Un nodo per riga. Nessun salto di più di +1 livello.

Struttura di esempio obbligatoria da seguire:
  genitore
    figlio
      nipote

Esempio tabella (4 livelli obbligatori):
  T.my-table
    Y
      R
        C Cella 1
        C Cella 2

Esempio form con input:
  ?.login[ac=/login m=p]
    |[email n=email p="Email" required]
    |[password n=pwd p="Password" required]
    $ Accedi

━━━ ALIAS TAG ━━━
~ div  ^ span  @ a  $ button  ! img  | input  % section
+ ul  * li  = ol  ? form  : label  , textarea  & p
N nav  H header  F footer  M main  A article  Z aside
B strong  I em  ` code  P pre  G figure  f figcaption
D details  S summary  X dialog  Q blockquote
T table  E thead  Y tbody  R tr  C td  U th
V select  O option  J script  L link  m meta
w dl  x dt  y dd

━━━ ALIAS ATTRIBUTI ━━━
h href  s src  a alt  t type  n name  p placeholder
v value  g target  r rel  c class  i id  fl for
ac action  m method  l loading  st style  ro role
x tabindex  lg lang  ss srcset  sz sizes  me media
cs colspan  rs rowspan  w width  ht height
ml maxlength  nl minlength  mn min  mx max
sp step  pt pattern  au autocomplete  dl download
hl hreflang  co crossorigin  fp fetchpriority
ig integrity  ct content  ch charset  rw rows  cl cols
lb label  d-* → data-*

━━━ ALIAS VALORI (contestuali) ━━━
target:   _b → _blank
loading:  z → lazy  |  e → eager
method:   p → post  |  g → get
rel(link): s → stylesheet  |  ico → icon
rel(a):   no → "noopener noreferrer"
fetchpriority: hi → high  |  lo → low

━━━ COMPRESSIONI LOSSLESS (applica in ordine) ━━━
1. Alias tag e attributi sempre quando disponibili
2. Testo inline diretto: `C Full Name` non `C\n  | Full Name`
3. Valori stringa con spazi → virgolette: p="My label"
4. Valori senza spazi → no virgolette: n=email
5. Posizionale su @: `@[/path]` non `@[h=/path]`
6. Posizionale su !: `![img.png]` non `![s=img.png]`
7. Boolean senza valore: `[required disabled]` non `[required=true]`
8. Ometti type=text su input (default)
9. Ometti type=submit su button dentro form (default)
10. Ometti type=button su button fuori form (default)
11. Ometti method=get su form (default HTML5)
12. Ometti type=text/javascript su script (default HTML5)
13. Ereditarietà su figli ripetuti: `+.menu [*c=item]`
14. Container deterministici: dentro ul/ol/select/tbody/tr
    il tag figlio si può omettere se il contenuto è solo testo inline:
      +.menu
        Home        ← implicito <li>
        About       ← implicito <li>

━━━ VINCOLI RIGIDI ━━━
- Tag void (img/input/br/hr/link/meta) → nessun testo inline
- Nessun salto indentazione > +1 livello
- Valori con caratteri speciali o spazi → sempre tra virgolette

━━━ CHECKLIST MENTALE PRIMA DI EMETTERE ━━━
Prima di rispondere, verifica mentalmente:
□ Ogni nodo figlio è indentato di esattamente 1 livello in più del padre?
□ I tag T/Y/R/C formano sempre 4 livelli annidati?
□ I valori con spazi sono tra virgolette?
□ I tag void non hanno testo inline?
□ Ho usato alias ovunque disponibili?
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
