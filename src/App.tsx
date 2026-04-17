import { useEffect, useMemo, useRef, useState } from 'react'
import {
  compareTokenUsage,
  compileToDom,
  compileToHtml,
  compressSlimLossless,
  convertHtmlToSlim,
  formatParseError,
  parseHtmlToAst,
  parseSlimML,
  type SlimDocument,
} from './lib/slimml'
import './App.css'

const STARTER_SLIM = `// SlimML sample
~.page#home[data-theme=light]
  # SlimML: HTML for AI workflows
  &.lead Write less syntax and keep structure readable.
  ~.actions
    @[/docs g=_blank].btn Docs
    $[t=button].btn.btn-ghost Try playground
  ~.cards
    ~.card[data-kind=cost]
      h3 Token savings
      & Cut output noise from repetitive closing tags.
    ~.card[data-kind=speed]
      h3 Faster iteration
      & Parse errors tell the model exactly what to fix.
  ![https://images.unsplash.com/photo-1557683316-973673baf926?w=800 a="Abstract color waves"]`

const STARTER_HTML = `<div id="home" class="page" data-theme="light">
  <h1>SlimML: HTML for AI workflows</h1>
  <p class="lead">Write less syntax and keep structure readable.</p>
  <div class="actions">
    <a class="btn" href="/docs" target="_blank">Docs</a>
    <button class="btn btn-ghost" type="button">Try playground</button>
  </div>
  <div class="cards">
    <div class="card" data-kind="cost">
      <h3>Token savings</h3>
      <p>Cut output noise from repetitive closing tags.</p>
    </div>
    <div class="card" data-kind="speed">
      <h3>Faster iteration</h3>
      <p>Parse errors tell the model exactly what to fix.</p>
    </div>
  </div>
  <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800" alt="Abstract color waves">
</div>`

interface DomPreviewProps {
  ast: SlimDocument | null
}

function DomPreview({ ast }: DomPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = previewRef.current
    if (!host) {
      return
    }

    host.replaceChildren()

    if (!ast) {
      return
    }

    host.append(compileToDom(ast, document))
  }, [ast])

  return <div className="dom-preview-surface" ref={previewRef} />
}

function App() {
  const [slimSource, setSlimSource] = useState(STARTER_SLIM)
  const [htmlSource, setHtmlSource] = useState(STARTER_HTML)
  const [actionMessage, setActionMessage] = useState('Ready.')
  const [lastEdited, setLastEdited] = useState<'slim' | 'html' | null>(null)

  const slimParse = useMemo(() => parseSlimML(slimSource), [slimSource])
  const htmlParse = useMemo(() => parseHtmlToAst(htmlSource), [htmlSource])

  const previewAst = slimParse.ok ? slimParse.ast : htmlParse.ok ? htmlParse.ast : null

  const slimError = slimParse.ok ? null : formatParseError(slimParse.error)
  const htmlError = htmlParse.ok ? null : htmlParse.error

  const tokenStats = useMemo(
    () => compareTokenUsage(slimSource.trimEnd(), htmlSource.trimEnd()),
    [slimSource, htmlSource],
  )

  const compressedSlim = useMemo(() => {
    const result = compressSlimLossless(slimSource)
    if (!result.ok) {
      return ''
    }
    return result.slim
  }, [slimSource])

  const compactStats = useMemo(
    () => compareTokenUsage(compressedSlim, slimSource.trimEnd()),
    [compressedSlim, slimSource],
  )

  useEffect(() => {
    if (lastEdited !== 'html') {
      return
    }

    const timer = window.setTimeout(() => {
      const converted = convertHtmlToSlim(htmlSource, { compact: true })
      if (!converted.ok) {
        return
      }
      setSlimSource(converted.slim)
    }, 220)

    return () => window.clearTimeout(timer)
  }, [htmlSource, lastEdited])

  const handleSlimToHtml = () => {
    const parsed = parseSlimML(slimSource)
    if (!parsed.ok) {
      setActionMessage(`Slim parse failed: ${formatParseError(parsed.error)}`)
      return
    }

    setHtmlSource(compileToHtml(parsed.ast))
    setLastEdited('slim')
    setActionMessage('Converted SlimML to HTML.')
  }

  const handleHtmlToSlim = () => {
    const converted = convertHtmlToSlim(htmlSource, { compact: true })
    if (!converted.ok) {
      setActionMessage(`HTML parse failed: ${converted.error}`)
      return
    }

    setSlimSource(converted.slim)
    setLastEdited('html')
    setActionMessage('Converted HTML to compact SlimML.')
  }

  const handleCompressSlim = () => {
    const compressed = compressSlimLossless(slimSource)
    if (!compressed.ok) {
      setActionMessage(`Slim compression failed: ${formatParseError(compressed.error)}`)
      return
    }

    setSlimSource(compressed.slim)
    setLastEdited('slim')
    setActionMessage('Applied lossless compact compression to SlimML.')
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <p className="eyebrow">AI-Native Markup Lab</p>
        <h1>SlimML Bidirectional Playground</h1>
        <p className="subtitle">
          Edit both sources freely. Convert in either direction and apply
          lossless compact compression with alias rules.
        </p>

        <div className="stats-grid" role="list" aria-label="Compression metrics">
          <article role="listitem" className="stat-card">
            <h2>Slim Tokens</h2>
            <p>{tokenStats.slimTokens}</p>
            <span>{tokenStats.slimChars} chars</span>
          </article>
          <article role="listitem" className="stat-card">
            <h2>HTML Tokens</h2>
            <p>{tokenStats.htmlTokens}</p>
            <span>{tokenStats.htmlChars} chars</span>
          </article>
          <article role="listitem" className="stat-card stat-card-accent">
            <h2>Slim vs HTML</h2>
            <p>{Math.max(tokenStats.tokenSavingsPct, 0).toFixed(1)}%</p>
            <span>estimated token savings</span>
          </article>
          <article role="listitem" className="stat-card">
            <h2>Compact Slim</h2>
            <p>{compactStats.slimTokens}</p>
            <span>
              saves {Math.max(compactStats.tokenSavingsPct, 0).toFixed(1)}% vs current Slim
            </span>
          </article>
        </div>
      </header>

      <section className="toolbar panel" aria-label="Conversion controls">
        <div className="toolbar-buttons">
          <button type="button" className="action-btn" onClick={handleSlimToHtml}>
            Slim -&gt; HTML
          </button>
          <button type="button" className="action-btn" onClick={handleHtmlToSlim}>
            HTML -&gt; Slim
          </button>
          <button type="button" className="action-btn action-btn-accent" onClick={handleCompressSlim}>
            Compress Slim (lossless)
          </button>
        </div>
        <p className="status status-ok" aria-live="polite">
          {actionMessage}
        </p>
      </section>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>SlimML Editor</h2>
            <p>Extended compact aliases enabled</p>
          </div>
          <label htmlFor="slimml-editor" className="sr-only">
            SlimML source editor
          </label>
          <textarea
            id="slimml-editor"
            className="editor"
            spellCheck={false}
            value={slimSource}
            onChange={(event) => {
              setSlimSource(event.target.value)
              setLastEdited('slim')
            }}
          />
          <p
            className={slimError ? 'status status-error' : 'status status-ok'}
            aria-live="polite"
          >
            {slimError ?? 'Slim parser status: valid.'}
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>HTML Editor</h2>
            <p>Writable source for reverse conversion</p>
          </div>
          <label htmlFor="html-editor" className="sr-only">
            HTML source editor
          </label>
          <textarea
            id="html-editor"
            className="editor"
            spellCheck={false}
            value={htmlSource}
            onChange={(event) => {
              setHtmlSource(event.target.value)
              setLastEdited('html')
            }}
          />
          <p
            className={htmlError ? 'status status-error' : 'status status-ok'}
            aria-live="polite"
          >
            {htmlError ?? 'HTML parser status: valid.'}
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Compact Slim Preview</h2>
            <p>Lossless compressed output</p>
          </div>
          <pre className="code-block">{compressedSlim || 'Fix Slim parser errors to compress.'}</pre>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>DOM Preview</h2>
            <p>Uses whichever source currently parses</p>
          </div>
          {previewAst ? (
            <DomPreview ast={previewAst} />
          ) : (
            <div className="dom-empty">Preview unavailable until one source is valid.</div>
          )}
        </section>
      </main>

      <section className="panel cheats-panel">
        <div className="panel-head">
          <h2>Compact Rules</h2>
          <p>Lossless alias mapping for better token compression</p>
        </div>
        <div className="cheats-grid">
          <article>
            <h3>Tag Aliases</h3>
            <p>~ div, &amp; p, @ a, ! img, + ul, * li, % section</p>
          </article>
          <article>
            <h3>Attr Aliases</h3>
            <p>h href, s src, a alt, t type, g target, p placeholder</p>
          </article>
          <article>
            <h3>Positional Attr</h3>
            <p>@[/path] maps to href, ![image.png] maps to src</p>
          </article>
          <article>
            <h3>Class and ID</h3>
            <p>.class and #id stay selector-like for model familiarity</p>
          </article>
          <article>
            <h3>Round Trip</h3>
            <p>HTML to Slim to HTML keeps the same document structure</p>
          </article>
          <article>
            <h3>Formatting</h3>
            <p>Keep 2-space nesting to retain parser reliability</p>
          </article>
        </div>
      </section>
    </div>
  )
}

export default App
