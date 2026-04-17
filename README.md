# SlimML

SlimML is a compact markup language designed for AI-first web generation.

Main goal:
- Reduce noisy HTML syntax in model output.
- Keep structure deterministic so parser feedback is easy for an LLM to fix.

The project currently includes:
- A SlimML parser with line and column errors.
- A shared AST.
- Two compilers: HTML string output and browser DOM output.
- A Vite playground with two writable editors (Slim and HTML), bidirectional conversion, preview, and token estimates.

## Why SlimML

Raw HTML is verbose for language models because every element repeats opening and closing tags.
SlimML removes most of this overhead by using indentation and selector-like declarations.

Example:

```txt
~.card#hero[data-theme=light]
  # Build less, ship faster
  p.lead AI can generate this syntax with fewer tokens.
  @[href=/docs].btn Read docs
```

Compiles to:

```html
<div id="hero" class="card" data-theme="light">
  <h1>Build less, ship faster</h1>
  <p class="lead">AI can generate this syntax with fewer tokens.</p>
  <a class="btn" href="/docs">Read docs</a>
</div>
```

## Syntax

One node per line:

```txt
tag.class#id[attr=value] optional inline text
```

Supported shortcuts:
- `~` => `div`
- `&` => `p`
- `@` => `a`
- `$` => `button`
- `!` => `img`
- `|` => `input`
- `^` => `span`
- `%` => `section`
- `+` => `ul`
- `*` => `li`
- `=` => `ol`
- `?` => `form`
- `:` => `label`
- `,` => `textarea`

Compact attribute aliases (lossless):
- `h` => `href`
- `s` => `src`
- `a` => `alt`
- `t` => `type`
- `n` => `name`
- `p` => `placeholder`
- `v` => `value`
- `g` => `target`
- `r` => `rel`

Positional compact attributes:
- `@[/docs]` is shorthand for `@[h=/docs]`
- `![hero.png]` is shorthand for `![s=hero.png]`

Other rules:
- `# Heading` to `###### Heading` map to `h1` to `h6`.
- `// comment` lines are ignored.
- `| plain text` creates a text node line.
- Use spaces only, with 2 spaces per indentation level.

## Project API

Core module: `src/lib/slimml.ts`

Available functions:
- `parseSlimML(source)`
- `compileToHtml(ast)`
- `compileToSlim(ast, { compact: true })`
- `compileToDom(ast, document)`
- `parseHtmlToAst(html)`
- `convertHtmlToSlim(html, { compact: true })`
- `compressSlimLossless(source)`
- `compareTokenUsage(slim, html)`
- `formatParseError(error)`

## Development

Install and run:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Prompt Snippet For Models

Use this as a system instruction:

```txt
Output only SlimML syntax.
Use 2-space indentation.
One node per line.
Use tag.class#id[attr=value] with optional inline text.
Aliases: ~ div, & p, @ a, $ button, ! img, | input, ^ span, % section, + ul, * li.
Compact attrs allowed: h href, s src, a alt, t type, g target.
Do not output raw HTML unless explicitly requested.
If parse errors are returned, regenerate valid SlimML only.
```

## Current Limitations

- No component syntax yet.
- Token counts in the UI are heuristic estimates.
- Grammar is intentionally strict for model reliability.
- HTML parsing follows browser DOM behavior and may normalize formatting whitespace.

## Next Iteration Ideas

- Add component-like declarations and props.
- Add source map positions from SlimML to HTML output.
- Add parser recovery hints to automate model retry loops.
