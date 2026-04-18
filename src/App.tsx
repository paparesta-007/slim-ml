import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  SLIM_COMPRESSION_MODES,
  compareTokenUsage,
  compileToHtml,
  compressSlimLossless,
  convertHtmlToSlim,
  formatParseError,
  parseHtmlToAst,
  parseSlimML,
  type SlimCompressionMode,
  type SlimDocument,
} from './lib/slimml'
import './App.css'

const STARTER_SLIM = `// SlimML sample
#home.page[d-theme=light]
  # SlimML: HTML for AI workflows
  &.lead Write less syntax and keep structure readable.
  .actions
    @[/docs g=_blank].btn Docs
    $.btn.btn-ghost Try playground
  +.menu [*c=nav-item]
    * Home
    * About
  ?
    |[n=email p="Your email" required]
    $ Subscribe
  .cards[~c=card]
    [d-kind=cost]
      h3 Token savings
      & Cut output noise from repetitive closing tags.
    [d-kind=speed]
      h3 Faster iteration
      & Parse errors tell the model exactly what to fix.
  ![https://images.unsplash.com/photo-1557683316-973673baf926?w=800 a="Abstract color waves"]`

const STARTER_HTML = `<div id="home" class="page" data-theme="light">
  <h1>SlimML: HTML for AI workflows</h1>
  <p class="lead">Write less syntax and keep structure readable.</p>
  <div class="actions">
    <a class="btn" href="/docs" target="_blank">Docs</a>
    <button class="btn btn-ghost">Try playground</button>
  </div>
  <ul class="menu">
    <li class="nav-item">Home</li>
    <li class="nav-item">About</li>
  </ul>
  <form>
    <input name="email" placeholder="Your email" required type="text">
    <button type="submit">Subscribe</button>
  </form>
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

const COMPRESSION_MODE_LABELS: Record<SlimCompressionMode, string> = {
  none: 'None',
  compact: 'Compact',
  aggressive: 'Aggressive',
  minified: 'Minified',
}

interface DomPreviewProps {
  ast: SlimDocument | null
  useBootstrap: boolean
  useTailwind: boolean
}

const SLIM_ALIAS_TAGS = new Set([
  '~', '^', '@', '$', '!', '|', '%', '+', '*', '=', '?', ':', ',', '&',
  'N', 'H', 'F', 'M', 'A', 'Z', 'B', 'I', '`', 'P', 'G', 'f', 'D', 'S', 'X',
  'Q', 'T', 'E', 'Y', 'R', 'C', 'U', 'V', 'O', 'J', 'L', 'm', 'w', 'x', 'y'
])

function shouldUseTagAliasToken(declaration: string, index = 0): boolean {
  const aliasToken = declaration[index]
  if (!/[a-zA-Z]/.test(aliasToken)) {
    return true
  }

  const nextChar = declaration[index + 1]
  if (!nextChar) {
    return true
  }

  return nextChar === '.' || nextChar === '#' || nextChar === '[' || /\s/.test(nextChar)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function splitDeclarationAndTextForHighlight(line: string): { declaration: string; text?: string } {
  let bracketDepth = 0
  let quote: '"' | "'" | null = null

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (quote) {
      if (char === quote && line[i - 1] !== '\\') {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === '[') {
      bracketDepth += 1
      continue
    }

    if (char === ']') {
      bracketDepth -= 1
      continue
    }

    if (char === ' ' && bracketDepth === 0) {
      const declaration = line.slice(0, i)
      const text = line.slice(i + 1)
      return {
        declaration,
        text: text.length > 0 ? text : undefined,
      }
    }
  }

  return { declaration: line }
}

function tokenizeAttributeBlock(content: string): string[] {
  const tokens: string[] = []
  let token = ''
  let quote: '"' | "'" | null = null
  let expressionDepth = 0
  let expressionQuote: '"' | "'" | null = null

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]

    if (expressionDepth > 0) {
      token += char

      if (expressionQuote) {
        if (char === expressionQuote && content[i - 1] !== '\\') {
          expressionQuote = null
        }
        continue
      }

      if (char === '"' || char === "'") {
        expressionQuote = char
        continue
      }

      if (char === '{') {
        expressionDepth += 1
        continue
      }

      if (char === '}') {
        expressionDepth -= 1
        continue
      }

      continue
    }

    if (quote) {
      token += char
      if (char === quote && content[i - 1] !== '\\') {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      token += char
      quote = char
      continue
    }

    if (char === '$' && content[i + 1] === '{') {
      token += '${'
      expressionDepth = 1
      i += 1
      continue
    }

    if (char === '{') {
      token += char
      expressionDepth = 1
      continue
    }

    if (/\s/.test(char)) {
      if (token.length > 0) {
        tokens.push(token)
        token = ''
      }
      continue
    }

    token += char
  }

  if (token.length > 0) {
    tokens.push(token)
  }

  return tokens
}

function highlightAttributeToken(token: string): string {
  const eqIndex = token.indexOf('=')
  if (eqIndex === -1) {
    return `<span class="sl-token-attr">${escapeHtml(token)}</span>`
  }

  const key = token.slice(0, eqIndex)
  const rawValue = token.slice(eqIndex + 1)
  const value =
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
      ? rawValue.slice(1, -1)
      : rawValue

  return `<span class="sl-token-attr">${escapeHtml(key)}</span>=<span class="sl-token-value">${escapeHtml(
    value,
  )}</span>`
}

function highlightAttributeBlock(content: string): string {
  const tokens = tokenizeAttributeBlock(content)
  if (tokens.length === 0) {
    return '<span class="sl-token-bracket">[]</span>'
  }

  const renderedTokens = tokens.map(highlightAttributeToken).join(' ')
  return `<span class="sl-token-bracket">[</span>${renderedTokens}<span class="sl-token-bracket">]</span>`
}

function highlightDeclaration(declaration: string): string {
  if (!declaration) {
    return ''
  }

  let index = 0
  let output = ''

  const firstChar = declaration[index]
  if (SLIM_ALIAS_TAGS.has(firstChar) && shouldUseTagAliasToken(declaration, index)) {
    output += `<span class="sl-token-tag">${escapeHtml(firstChar)}</span>`
    index += 1
  } else if (/[a-zA-Z]/.test(firstChar)) {
    const start = index
    while (index < declaration.length && /[a-zA-Z0-9:_-]/.test(declaration[index])) {
      index += 1
    }
    output += `<span class="sl-token-tag">${escapeHtml(declaration.slice(start, index))}</span>`
  }

  while (index < declaration.length) {
    const char = declaration[index]

    if (char === '.') {
      const start = index
      index += 1
      while (index < declaration.length && /[a-zA-Z0-9:_-]/.test(declaration[index])) {
        index += 1
      }
      output += `<span class="sl-token-class">${escapeHtml(declaration.slice(start, index))}</span>`
      continue
    }

    if (char === '#') {
      const start = index
      index += 1
      while (index < declaration.length && /[a-zA-Z0-9:_-]/.test(declaration[index])) {
        index += 1
      }
      output += `<span class="sl-token-id">${escapeHtml(declaration.slice(start, index))}</span>`
      continue
    }

    if (char === '[') {
      let end = index + 1
      let quote: '"' | "'" | null = null

      while (end < declaration.length) {
        const c = declaration[end]
        if (quote) {
          if (c === quote && declaration[end - 1] !== '\\') {
            quote = null
          }
          end += 1
          continue
        }

        if (c === '"' || c === "'") {
          quote = c
          end += 1
          continue
        }

        if (c === ']') {
          break
        }
        end += 1
      }

      if (declaration[end] === ']') {
        output += highlightAttributeBlock(declaration.slice(index + 1, end))
        index = end + 1
      } else {
        output += `<span class="sl-token-bracket">${escapeHtml(declaration.slice(index))}</span>`
        break
      }
      continue
    }

    output += escapeHtml(char)
    index += 1
  }

  return output
}

function highlightSlimML(source: string): string {
  return source
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      const indentation = line.match(/^[\t ]*/)?.[0] ?? ''
      const content = line.slice(indentation.length)
      const indentPart = escapeHtml(indentation)

      let depthPrefixPart = ''
      let contentBody = content
      const depthPrefixMatch = content.match(/^(\d+)(\S.*)$/)
      if (depthPrefixMatch) {
        depthPrefixPart = `<span class="sl-token-depth">${escapeHtml(depthPrefixMatch[1])}</span>`
        contentBody = depthPrefixMatch[2]
      }

      if (!contentBody) {
        return indentPart
      }

      if (contentBody.startsWith('//')) {
        return `${indentPart}${depthPrefixPart}<span class="sl-token-comment">${escapeHtml(contentBody)}</span>`
      }

      const headingMatch = contentBody.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        return `${indentPart}${depthPrefixPart}<span class="sl-token-heading-mark">${escapeHtml(
          headingMatch[1],
        )}</span> <span class="sl-token-heading-text">${escapeHtml(headingMatch[2])}</span>`
      }

      if (contentBody.startsWith('| ')) {
        return `${indentPart}${depthPrefixPart}<span class="sl-token-pipe">|</span> <span class="sl-token-text">${escapeHtml(
          contentBody.slice(2),
        )}</span>`
      }

      const { declaration, text } = splitDeclarationAndTextForHighlight(contentBody)
      const declarationPart = highlightDeclaration(declaration)

      if (text === undefined) {
        return `${indentPart}${depthPrefixPart}${declarationPart}`
      }

      return `${indentPart}${depthPrefixPart}${declarationPart} <span class="sl-token-text">${escapeHtml(text)}</span>`
    })
    .join('\n')
}

function buildPreviewDocument(
  ast: SlimDocument,
  useBootstrap: boolean,
  useTailwind: boolean,
): string {
  const frameworkTags = [
    useBootstrap
      ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>'
      : '',
    useTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${frameworkTags}
    <style>
      body {
        margin: 0;
        padding: 1rem;
        font: 500 14px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #fffef8 0%, #f4f7ff 100%);
        color: #11203d;
      }

      #preview-root {
        min-height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="preview-root">${compileToHtml(ast)}</div>
  </body>
</html>`
}

function DomPreview({ ast, useBootstrap, useTailwind }: DomPreviewProps) {
  const srcDoc = useMemo(() => {
    if (!ast) {
      return ''
    }
    return buildPreviewDocument(ast, useBootstrap, useTailwind)
  }, [ast, useBootstrap, useTailwind])

  return (
    <iframe
      title="DOM Preview"
      className="dom-preview-frame"
      sandbox="allow-same-origin allow-scripts"
      srcDoc={srcDoc}
    />
  )
}

function normalizeEscapedNewlines(source: string): string {
  if (source.includes('\\n') || source.includes('\\r\\n')) {
    return source.replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n')
  }

  return source
}

function looksLikeHtmlOrJsx(source: string): boolean {
  const trimmed = source.trimStart()
  return (
    trimmed.startsWith('<') ||
    trimmed.startsWith('</') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<!DOCTYPE')
  )
}

function normalizeJsxForHtmlParsing(source: string): string {
  return source
    .replace(/\bclassName=/g, 'class=')
    .replace(/\bhtmlFor=/g, 'for=')
    .replace(/<>/g, '<div>')
    .replace(/<\/>/g, '</div>')
    .replace(/\{\.\.\.[^}]+\}/g, '')
    .replace(/=\{([^}]+)\}/g, '="$1"')
    .replace(/\{([^}]+)\}/g, '$1')
}

interface SlimInputInterpretationSuccess {
  ok: true
  ast: SlimDocument
  mode: 'slim' | 'html-jsx'
  normalizedSlim?: string
}

interface SlimInputInterpretationFailure {
  ok: false
  error: string
}

type SlimInputInterpretation = SlimInputInterpretationSuccess | SlimInputInterpretationFailure

function interpretSlimSource(
  source: string,
  compressionMode: SlimCompressionMode,
): SlimInputInterpretation {
  const parsedSlim = parseSlimML(source)
  if (parsedSlim.ok) {
    return {
      ok: true,
      ast: parsedSlim.ast,
      mode: 'slim',
    }
  }

  if (!looksLikeHtmlOrJsx(source)) {
    return {
      ok: false,
      error: formatParseError(parsedSlim.errors),
    }
  }

  const jsxNormalized = normalizeJsxForHtmlParsing(source)
  const converted = convertHtmlToSlim(jsxNormalized, { compressionMode })
  if (!converted.ok) {
    return {
      ok: false,
      error: `Slim parse failed:\n${formatParseError(parsedSlim.errors)}\n\nHTML/JSX parse failed:\n${converted.error}`,
    }
  }

  return {
    ok: true,
    ast: converted.ast,
    mode: 'html-jsx',
    normalizedSlim: converted.slim,
  }
}

function buildLineNumbers(source: string): string {
  const totalLines = source.replace(/\r\n?/g, '\n').split('\n').length
  return Array.from({ length: totalLines }, (_, index) => `${index + 1}`).join('\n')
}

function App() {
  const [slimSource, setSlimSource] = useState(STARTER_SLIM)
  const [htmlSource, setHtmlSource] = useState(STARTER_HTML)
  const [compressionMode, setCompressionMode] = useState<SlimCompressionMode>('aggressive')
  const [useBootstrapPreview, setUseBootstrapPreview] = useState(false)
  const [useTailwindPreview, setUseTailwindPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [actionMessage, setActionMessage] = useState('Ready.')
  const [lastEdited, setLastEdited] = useState<'slim' | 'html' | null>(null)
  const slimEditorRef = useRef<HTMLTextAreaElement>(null)
  const slimHighlightRef = useRef<HTMLPreElement>(null)
  const slimGutterRef = useRef<HTMLPreElement>(null)
  const htmlEditorRef = useRef<HTMLTextAreaElement>(null)
  const htmlGutterRef = useRef<HTMLPreElement>(null)

  const slimInterpretation = useMemo(
    () => interpretSlimSource(slimSource, compressionMode),
    [compressionMode, slimSource],
  )
  const htmlParse = useMemo(() => parseHtmlToAst(htmlSource), [htmlSource])

  const previewAst = slimInterpretation.ok ? slimInterpretation.ast : htmlParse.ok ? htmlParse.ast : null

  const slimError = slimInterpretation.ok ? null : slimInterpretation.error
  const htmlError = htmlParse.ok ? null : htmlParse.error

  const tokenStats = useMemo(
    () => compareTokenUsage(slimSource.trimEnd(), htmlSource.trimEnd()),
    [slimSource, htmlSource],
  )

  const compressedSlim = useMemo(() => {
    const sourceToCompress =
      slimInterpretation.ok && slimInterpretation.mode === 'html-jsx'
        ? (slimInterpretation.normalizedSlim ?? slimSource)
        : slimSource

    const result = compressSlimLossless(sourceToCompress, { compressionMode })
    if (!result.ok) {
      return ''
    }
    return result.slim
  }, [compressionMode, slimInterpretation, slimSource])

  const compactStats = useMemo(
    () => compareTokenUsage(compressedSlim, slimSource.trimEnd()),
    [compressedSlim, slimSource],
  )

  const highlightedSlimSource = useMemo(() => `${highlightSlimML(slimSource)}\n`, [slimSource])
  const slimLineNumbers = useMemo(() => `${buildLineNumbers(slimSource)}\n`, [slimSource])
  const htmlLineNumbers = useMemo(() => `${buildLineNumbers(htmlSource)}\n`, [htmlSource])

  const syncSlimEditorDecorators = (target: HTMLTextAreaElement) => {
    if (!slimHighlightRef.current) {
      if (slimGutterRef.current) {
        slimGutterRef.current.scrollTop = target.scrollTop
      }
      return
    }

    slimHighlightRef.current.scrollTop = target.scrollTop
    slimHighlightRef.current.scrollLeft = target.scrollLeft

    if (slimGutterRef.current) {
      slimGutterRef.current.scrollTop = target.scrollTop
    }
  }

  const syncHtmlGutterScroll = (target: HTMLTextAreaElement) => {
    if (!htmlGutterRef.current) {
      return
    }

    htmlGutterRef.current.scrollTop = target.scrollTop
  }

  const handleBracketAwareKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    sourceValue: string,
    setSourceValue: (value: string) => void,
    edited: 'slim' | 'html',
  ) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return
    }

    const openToClose: Record<string, string> = {
      '[': ']',
      '{': '}',
      '(': ')',
      '<': '>',
      '"': '"',
      "'": "'",
    }

    const closeChars = new Set(Object.values(openToClose))
    const openChar = openToClose[event.key]
    const target = event.currentTarget
    const start = target.selectionStart
    const end = target.selectionEnd

    if (openChar && start === end) {
      const nextChar = sourceValue.slice(start, start + 1)
      const shouldPairQuote = event.key === '"' || event.key === "'"
      const canInsertPair =
        nextChar.length === 0 || /[\s\]})>,.;:]/.test(nextChar) || closeChars.has(nextChar)

      if (!shouldPairQuote || canInsertPair) {
        event.preventDefault()
        const updated = `${sourceValue.slice(0, start)}${event.key}${openChar}${sourceValue.slice(end)}`
        setSourceValue(updated)
        setLastEdited(edited)

        requestAnimationFrame(() => {
          target.selectionStart = start + 1
          target.selectionEnd = start + 1
        })
      }
      return
    }

    if (closeChars.has(event.key) && start === end && sourceValue[start] === event.key) {
      event.preventDefault()
      requestAnimationFrame(() => {
        target.selectionStart = start + 1
        target.selectionEnd = start + 1
      })
    }
  }

  useEffect(() => {
    if (!slimEditorRef.current) {
      return
    }
    syncSlimEditorDecorators(slimEditorRef.current)
  }, [slimSource])

  useEffect(() => {
    if (!htmlEditorRef.current) {
      return
    }
    syncHtmlGutterScroll(htmlEditorRef.current)
  }, [htmlSource])

  useEffect(() => {
    if (lastEdited !== 'slim') {
      return
    }

    const timer = window.setTimeout(() => {
      const interpreted = interpretSlimSource(slimSource, compressionMode)
      if (!interpreted.ok) {
        return
      }

      setHtmlSource(compileToHtml(interpreted.ast))
    }, 220)

    return () => window.clearTimeout(timer)
  }, [compressionMode, slimSource, lastEdited])

  useEffect(() => {
    if (lastEdited !== 'html') {
      return
    }

    const timer = window.setTimeout(() => {
      const converted = convertHtmlToSlim(htmlSource, { compressionMode })
      if (!converted.ok) {
        return
      }
      setSlimSource(converted.slim)
    }, 220)

    return () => window.clearTimeout(timer)
  }, [compressionMode, htmlSource, lastEdited])

  const handleSlimToHtml = () => {
    const interpreted = interpretSlimSource(slimSource, compressionMode)
    if (!interpreted.ok) {
      setActionMessage(interpreted.error)
      return
    }

    setHtmlSource(compileToHtml(interpreted.ast))
    setLastEdited('slim')
    setActionMessage(
      interpreted.mode === 'html-jsx'
        ? 'Detected HTML/JSX in Slim editor and converted it to HTML preview.'
        : 'Converted SlimML to HTML.',
    )
  }

  const handleHtmlToSlim = () => {
    const converted = convertHtmlToSlim(htmlSource, { compressionMode })
    if (!converted.ok) {
      setActionMessage(`HTML parse failed: ${converted.error}`)
      return
    }

    setSlimSource(converted.slim)
    setLastEdited('html')
    setActionMessage(`Converted HTML to ${COMPRESSION_MODE_LABELS[compressionMode]} SlimML.`)
  }

  const handleCompressSlim = () => {
    const sourceToCompress =
      slimInterpretation.ok && slimInterpretation.mode === 'html-jsx'
        ? (slimInterpretation.normalizedSlim ?? slimSource)
        : slimSource

    const compressed = compressSlimLossless(sourceToCompress, { compressionMode })
    if (!compressed.ok) {
      setActionMessage(`Slim compression failed: ${formatParseError(compressed.errors)}`)
      return
    }

    setSlimSource(compressed.slim)
    setLastEdited('slim')
    setActionMessage(
      `Applied lossless ${COMPRESSION_MODE_LABELS[compressionMode].toLowerCase()} compression to SlimML.`,
    )
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-main">
          <p className="eyebrow">E.g.</p>
          <h1>SlimML</h1>
          <p className="subtitle">lossless compressor built with AI for the AI</p>
        </div>

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
            <h2>Compressed Slim</h2>
            <p>{compactStats.slimTokens}</p>
            <span>
              saves {Math.max(compactStats.tokenSavingsPct, 0).toFixed(1)}% vs current Slim
            </span>
          </article>
        </div>
      </header>

      <section className="toolbar panel" aria-label="Conversion controls">
        <div className="toolbar-controls">
          <div className="toolbar-buttons">
            <button type="button" className="action-btn" onClick={handleSlimToHtml}>
              Slim -&gt; HTML
            </button>
            <button type="button" className="action-btn" onClick={handleHtmlToSlim}>
              HTML -&gt; Slim
            </button>
            <button
              type="button"
              className="action-btn action-btn-accent"
              onClick={handleCompressSlim}
            >
              Compress Slim (lossless)
            </button>
          </div>
          <div className="compression-mode-control">
            <label htmlFor="compression-mode">Compression mode</label>
            <select
              id="compression-mode"
              className="mode-select"
              value={compressionMode}
              onChange={(event) => {
                const nextMode = event.target.value as SlimCompressionMode
                setCompressionMode(nextMode)
                setActionMessage(`Compression mode set to ${COMPRESSION_MODE_LABELS[nextMode]}.`)
              }}
            >
              {SLIM_COMPRESSION_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {COMPRESSION_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </div>
          <div className="preview-cdn-control" role="group" aria-label="DOM preview frameworks">
            <span>DOM CDN</span>
            <label className="check-chip" htmlFor="preview-bootstrap">
              <input
                id="preview-bootstrap"
                type="checkbox"
                checked={useBootstrapPreview}
                onChange={(event) => {
                  setUseBootstrapPreview(event.target.checked)
                  setActionMessage(
                    event.target.checked
                      ? 'Bootstrap CDN enabled in DOM preview.'
                      : 'Bootstrap CDN disabled in DOM preview.',
                  )
                }}
              />
              Bootstrap
            </label>
            <label className="check-chip" htmlFor="preview-tailwind">
              <input
                id="preview-tailwind"
                type="checkbox"
                checked={useTailwindPreview}
                onChange={(event) => {
                  setUseTailwindPreview(event.target.checked)
                  setActionMessage(
                    event.target.checked
                      ? 'Tailwind CDN enabled in DOM preview.'
                      : 'Tailwind CDN disabled in DOM preview.',
                  )
                }}
              />
              Tailwind
            </label>
          </div>
        </div>
        <p className="status status-ok" aria-live="polite">
          {actionMessage}
        </p>
      </section>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-head">
            <div className="panel-head-title">
              <h2>SlimML Editor</h2>
              <p>Extended compact aliases enabled</p>
            </div>
          </div>
          <label htmlFor="slimml-editor" className="sr-only">
            SlimML source editor
          </label>
          <div className="editor-shell">
            <pre ref={slimGutterRef} className="editor-gutter" aria-hidden="true">
              {slimLineNumbers}
            </pre>
            <div className="editor-stack">
              <pre
                ref={slimHighlightRef}
                className="editor-highlight"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlightedSlimSource }}
              />
              <textarea
                id="slimml-editor"
                ref={slimEditorRef}
                className="editor editor-overlay"
                spellCheck={false}
                wrap="off"
                value={slimSource}
                onScroll={(event) => syncSlimEditorDecorators(event.currentTarget)}
                onKeyDown={(event) =>
                  handleBracketAwareKeyDown(event, slimSource, (value) => setSlimSource(value), 'slim')
                }
                onChange={(event) => {
                  setSlimSource(normalizeEscapedNewlines(event.target.value))
                  setLastEdited('slim')
                }}
              />
            </div>
          </div>
          <p className={slimError ? 'status status-error' : 'status status-ok'} aria-live="polite">
            {slimError ?? 'Slim parser status: valid.'}
          </p>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-head-title">
              <h2>HTML Editor</h2>
              <p>Writable source for reverse conversion</p>
            </div>
          </div>
          <label htmlFor="html-editor" className="sr-only">
            HTML source editor
          </label>
          <div className="editor-shell">
            <pre ref={htmlGutterRef} className="editor-gutter" aria-hidden="true">
              {htmlLineNumbers}
            </pre>
            <textarea
              id="html-editor"
              ref={htmlEditorRef}
              className="editor editor-plain"
              spellCheck={false}
              wrap="off"
              value={htmlSource}
              onScroll={(event) => syncHtmlGutterScroll(event.currentTarget)}
              onKeyDown={(event) =>
                handleBracketAwareKeyDown(event, htmlSource, (value) => setHtmlSource(value), 'html')
              }
              onChange={(event) => {
                setHtmlSource(normalizeEscapedNewlines(event.target.value))
                setLastEdited('html')
              }}
            />
          </div>
          <p className={htmlError ? 'status status-error' : 'status status-ok'} aria-live="polite">
            {htmlError ?? 'HTML parser status: valid.'}
          </p>
        </section>

        <section className="panel-full">
          <div className="panel-head">
            <div className="panel-head-title">
              <h2>Compact Slim Preview</h2>
              <p>{COMPRESSION_MODE_LABELS[compressionMode]} mode output</p>
            </div>
          </div>
          <pre className="code-block">{compressedSlim || 'Fix Slim parser errors to compress.'}</pre>
        </section>

        <section className="panel-full dom-preview-panel" data-fullscreen={isFullscreen}>
          <div className="panel-head">
            <div className="panel-head-title">
              <h2>DOM Preview</h2>
              <p>Uses whichever source currently parses</p>
            </div>
            <div className="panel-head-actions">
              <button 
                type="button" 
                className="action-btn" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
          {previewAst ? (
            <DomPreview
              ast={previewAst}
              useBootstrap={useBootstrapPreview}
              useTailwind={useTailwindPreview}
            />
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
            <p>Base aliases plus semantic set: N nav, H header, M main, A article, B strong, T table, V select</p>
          </article>
          <article>
            <h3>Attr Aliases</h3>
            <p>Core aliases + extended set: fl for, ac action, ro role, w width, ht height, ss srcset, sz sizes</p>
          </article>
          <article>
            <h3>Implicit Defaults</h3>
            <p>
              | means input type=text, button outside a form defaults to type=button,
              and button in form defaults to submit
            </p>
          </article>
          <article>
            <h3>Child Inheritance</h3>
            <p>
              Use $c=... on the parent, for example $c=btn $c=btn-outline-secondary,
              to inherit repeated button classes once
            </p>
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
            <p>Minified mode uses numeric depth prefixes; aggressive emits tabs; others use spaces</p>
          </article>
        </div>
      </section>
    </div>
  )
}

export default App
