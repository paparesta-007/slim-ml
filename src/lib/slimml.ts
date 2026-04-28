export type SlimAttributeValue = string | boolean

export interface SlimTextNode {
  type: 'text'
  value: string
  line: number
}

export interface SlimElementNode {
  type: 'element'
  tag: string
  id?: string
  classes: string[]
  attrs: Record<string, SlimAttributeValue>
  childDefaults?: Record<string, SlimChildDefaultRule>
  text?: string
  children: SlimNode[]
  line: number
}

export interface SlimChildDefaultRule {
  classes: string[]
  attrs: Record<string, SlimAttributeValue>
}

export type SlimNode = SlimTextNode | SlimElementNode

export interface SlimDocument {
  type: 'document'
  children: SlimNode[]
}

export interface SlimParseError {
  message: string
  line: number
  column: number
}

export interface SlimParseSuccess {
  ok: true
  ast: SlimDocument
  warnings: string[]
}

export interface SlimParseFailure {
  ok: false
  errors: SlimParseError[]
}

export type SlimParseResult = SlimParseSuccess | SlimParseFailure

export interface HtmlParseSuccess {
  ok: true
  ast: SlimDocument
  warnings: string[]
}

export interface HtmlParseFailure {
  ok: false
  error: string
}

export type HtmlParseResult = HtmlParseSuccess | HtmlParseFailure

export const SLIM_COMPRESSION_MODES = ['none', 'compact', 'aggressive', 'minified'] as const
export type SlimCompressionMode = (typeof SLIM_COMPRESSION_MODES)[number]

export interface SlimCompileOptions {
  indent?: string
  compact?: boolean
  compressionMode?: SlimCompressionMode
}

interface ResolvedSlimCompileOptions {
  indent: string
  useCompactSyntax: boolean
  synthesizeChildDefaults: boolean
  useDepthPrefix: boolean
}

const ALIAS_TAGS: Record<string, string> = {
  d: 'div',
  s: 'span',
  a: 'a',
  b: 'button',
  i: 'img',
  n: 'input',
  c: 'section',
  u: 'ul',
  l: 'li',
  o: 'ol',
  r: 'form',
  e: 'label',
  t: 'textarea',
  p: 'p',
  N: 'nav',
  H: 'header',
  F: 'footer',
  M: 'main',
  A: 'article',
  Z: 'aside',
  B: 'strong',
  I: 'em',
  k: 'code',
  P: 'pre',
  G: 'figure',
  f: 'figcaption',
  D: 'details',
  S: 'summary',
  X: 'dialog',
  Q: 'blockquote',
  T: 'table',
  E: 'thead',
  Y: 'tbody',
  R: 'tr',
  C: 'td',
  U: 'th',
  V: 'select',
  O: 'option',
  J: 'script',
  L: 'link',
  m: 'meta',
  w: 'dl',
  x: 'dt',
  y: 'dd',
  svg: 'svg',
  path: 'path',
  circle: 'circle',
  rect: 'rect',
}

const IMPLICIT_CHILD_TAG_BY_PARENT: Record<string, string> = {
  ul: 'li',
  ol: 'li',
  select: 'option',
  datalist: 'option',
  tbody: 'tr',
  tr: 'td',
}

const DIMENSIONAL_MEDIA_TAGS = new Set(['img', 'video', 'canvas', 'svg'])
const VALUE_CONTINUATION_ATTRIBUTES = new Set([
  'alt',
  'placeholder',
  'title',
  'label',
  'value',
  'aria-label',
])

const TAG_TO_ALIAS: Record<string, string> = {
  div: 'd',
  span: 's',
  a: 'a',
  button: 'b',
  img: 'i',
  input: 'n',
  section: 'c',
  ul: 'u',
  li: 'l',
  ol: 'o',
  form: 'r',
  label: 'e',
  textarea: 't',
  p: 'p',
  nav: 'N',
  header: 'H',
  footer: 'F',
  main: 'M',
  article: 'A',
  aside: 'Z',
  strong: 'B',
  em: 'I',
  code: 'k',
  pre: 'P',
  figure: 'G',
  figcaption: 'f',
  details: 'D',
  summary: 'S',
  dialog: 'X',
  blockquote: 'Q',
  table: 'T',
  thead: 'E',
  tbody: 'Y',
  tr: 'R',
  td: 'C',
  th: 'U',
  select: 'V',
  option: 'O',
  script: 'J',
  link: 'L',
  meta: 'm',
  dl: 'w',
  dt: 'x',
  dd: 'y',
}

const EXPLICIT_TAG_HINTS = new Set<string>([
  ...Object.keys(TAG_TO_ALIAS),
  'html',
  'head',
  'body',
  'title',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'video',
  'audio',
  'canvas',
  'svg',
  'path',
  'source',
  'iframe',
  'small',
  'time',
  'mark',
])

const ATTR_ALIASES: Record<string, string> = {
  h: 'href',
  s: 'src',
  a: 'alt',
  t: 'type',
  n: 'name',
  p: 'placeholder',
  v: 'value',
  g: 'target',
  r: 'rel',
  c: 'class',
  i: 'id',
  fl: 'for',
  ac: 'action',
  m: 'method',
  l: 'loading',
  st: 'style',
  ro: 'role',
  x: 'tabindex',
  lg: 'lang',
  ss: 'srcset',
  sz: 'sizes',
  me: 'media',
  cs: 'colspan',
  rs: 'rowspan',
  w: 'width',
  ht: 'height',
  ml: 'maxlength',
  nl: 'minlength',
  mn: 'min',
  mx: 'max',
  sp: 'step',
  pt: 'pattern',
  au: 'autocomplete',
  dl: 'download',
  hl: 'hreflang',
  co: 'crossorigin',
  fp: 'fetchpriority',
  ig: 'integrity',
  ct: 'content',
  ch: 'charset',
  rw: 'rows',
  cl: 'cols',
  lb: 'label',
}

const ATTR_TO_ALIAS: Record<string, string> = {
  href: 'h',
  src: 's',
  alt: 'a',
  type: 't',
  name: 'n',
  placeholder: 'p',
  value: 'v',
  target: 'g',
  rel: 'r',
  class: 'c',
  id: 'i',
  for: 'fl',
  action: 'ac',
  method: 'm',
  loading: 'l',
  style: 'st',
  role: 'ro',
  tabindex: 'x',
  lang: 'lg',
  srcset: 'ss',
  sizes: 'sz',
  media: 'me',
  colspan: 'cs',
  rowspan: 'rs',
  width: 'w',
  height: 'ht',
  maxlength: 'ml',
  minlength: 'nl',
  min: 'mn',
  max: 'mx',
  step: 'sp',
  pattern: 'pt',
  autocomplete: 'au',
  download: 'dl',
  hreflang: 'hl',
  crossorigin: 'co',
  fetchpriority: 'fp',
  integrity: 'ig',
  content: 'ct',
  charset: 'ch',
  rows: 'rw',
  cols: 'cl',
  label: 'lb',
}

const VALUE_ALIAS_TO_VALUE_BY_ATTR: Record<string, Record<string, string>> = {
  target: {
    _b: '_blank',
  },
  loading: {
    z: 'lazy',
    e: 'eager',
  },
  method: {
    p: 'post',
    g: 'get',
  },
  decoding: {
    a: 'async',
  },
  crossorigin: {
    an: 'anonymous',
  },
  autocomplete: {
    '0': 'off',
    '1': 'on',
  },
  fetchpriority: {
    hi: 'high',
    lo: 'low',
  },
}

const VALUE_ALIAS_TO_VALUE_BY_ATTR_AND_TAG: Record<
  string,
  Record<string, Record<string, string>>
> = {
  rel: {
    link: {
      s: 'stylesheet',
      css: 'stylesheet',
      ico: 'icon',
    },
    a: {
      safe: 'noopener noreferrer',
      no: 'noopener noreferrer',
    },
  },
}

const VALUE_TO_ALIAS_BY_ATTR: Record<string, Record<string, string>> = {
  target: {
    _blank: '_b',
  },
  loading: {
    lazy: 'z',
    eager: 'e',
  },
  method: {
    post: 'p',
    get: 'g',
  },
  decoding: {
    async: 'a',
  },
  crossorigin: {
    anonymous: 'an',
  },
  autocomplete: {
    off: '0',
    on: '1',
  },
  fetchpriority: {
    high: 'hi',
    low: 'lo',
  },
}

const VALUE_TO_ALIAS_BY_ATTR_AND_TAG: Record<
  string,
  Record<string, Record<string, string>>
> = {
  rel: {
    link: {
      stylesheet: 's',
      icon: 'ico',
    },
    a: {
      'noopener noreferrer': 'no',
    },
  },
}

const STYLE_PROP_ALIAS_TO_PROP: Record<string, string> = {
  fw: 'font-weight',
  fs: 'font-size',
  ff: 'font-family',
  co: 'color',
  bg: 'background',
  bc: 'background-color',
  cu: 'cursor',
  bd: 'border',
  pd: 'padding',
  mg: 'margin',
  dp: 'display',
  fd: 'flex-direction',
  ai: 'align-items',
  jc: 'justify-content',
  wd: 'width',
  hg: 'height',
  mw: 'max-width',
  br: 'border-radius',
  ta: 'text-align',
  ps: 'position',
  tp: 'top',
  rt: 'right',
  bt: 'bottom',
  lf: 'left',
  zi: 'z-index',
  ov: 'overflow',
  op: 'opacity',
  tr: 'transition',
  tf: 'transform',
  gp: 'gap',
  lh: 'line-height',
  ls: 'letter-spacing',
  td: 'text-decoration',
  bs: 'box-shadow',
  gc: 'grid-template-columns',
  fwr: 'flex-wrap',
  pe: 'pointer-events',
  ws: 'white-space',
}

const STYLE_PROP_TO_ALIAS: Record<string, string> = {
  'font-weight': 'fw',
  'font-size': 'fs',
  'font-family': 'ff',
  color: 'co',
  background: 'bg',
  'background-color': 'bc',
  cursor: 'cu',
  border: 'bd',
  padding: 'pd',
  margin: 'mg',
  display: 'dp',
  'flex-direction': 'fd',
  'align-items': 'ai',
  'justify-content': 'jc',
  width: 'wd',
  height: 'hg',
  'max-width': 'mw',
  'border-radius': 'br',
  'text-align': 'ta',
  position: 'ps',
  top: 'tp',
  right: 'rt',
  bottom: 'bt',
  left: 'lf',
  'z-index': 'zi',
  overflow: 'ov',
  opacity: 'op',
  transition: 'tr',
  transform: 'tf',
  gap: 'gp',
  'line-height': 'lh',
  'letter-spacing': 'ls',
  'text-decoration': 'td',
  'box-shadow': 'bs',
  'grid-template-columns': 'gc',
  'flex-wrap': 'fwr',
  'pointer-events': 'pe',
  'white-space': 'ws',
}

const COMMON_INPUT_TYPES = new Set([
  'text',
  'password',
  'email',
  'number',
  'search',
  'url',
  'tel',
  'checkbox',
  'radio',
  'submit',
  'reset',
  'button',
  'date',
  'time',
])

const BOOLEAN_ATTRIBUTES = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'download',
  'hidden',
  'inert',
  'loop',
  'multiple',
  'muted',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
])

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

class ParserIssue extends Error {
  line: number
  column: number

  constructor(message: string, line: number, column: number) {
    super(message)
    this.name = 'ParserIssue'
    this.line = line
    this.column = column
  }
}

interface ParseElementResult {
  node: SlimElementNode
}

function getChildren(target: SlimDocument | SlimElementNode): SlimNode[] {
  return target.children
}

function looksLikeDepthPrefixedSlimLine(line: string): boolean {
  const match = line.match(/^(\d+)\s*(.*)$/)
  if (!match) {
    return false
  }

  const firstToken = match[2][0]

  // Avoid false positives when user pastes HTML/JSX snippets.
  if (!firstToken || firstToken === '<' || firstToken === '/') {
    return false
  }

  if (ALIAS_TAGS[firstToken] || firstToken === '.' || firstToken === '#' || firstToken === '[') {
    return true
  }

  return /[a-zA-Z]/.test(firstToken)
}

function isIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9:_\-\/%\[\]\\]/.test(char)
}

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

function shouldConsumeRepeatedTagName(declaration: string, index: number, tag: string): boolean {
  const repeatedTag = tag.toLowerCase()
  if (!declaration.slice(index).toLowerCase().startsWith(repeatedTag)) {
    return false
  }

  const nextChar = declaration[index + repeatedTag.length]
  return !nextChar || nextChar === '.' || nextChar === '#' || nextChar === '[' || /\s/.test(nextChar)
}

function getImplicitChildTag(parent: SlimDocument | SlimElementNode): string | undefined {
  if (parent.type !== 'element') {
    return undefined
  }

  return IMPLICIT_CHILD_TAG_BY_PARENT[parent.tag.toLowerCase()]
}

function isExplicitDeclarationInImplicitContext(content: string): boolean {
  const trimmed = content.trim()
  if (!trimmed) {
    return false
  }

  if (trimmed.startsWith('| ') || /^(#{1,6})\s+/.test(trimmed)) {
    return true
  }

  const firstChar = trimmed[0]
  if (
    firstChar === '.' ||
    firstChar === '#' ||
    firstChar === '[' ||
    (ALIAS_TAGS[firstChar] && shouldUseTagAliasToken(trimmed, 0))
  ) {
    return true
  }

  if (!isIdentifierChar(firstChar)) {
    return false
  }

  let index = 0
  while (index < trimmed.length && isIdentifierChar(trimmed[index])) {
    index += 1
  }

  const token = trimmed.slice(0, index).toLowerCase()
  const nextChar = trimmed[index]
  if (nextChar === '.' || nextChar === '#' || nextChar === '[') {
    return true
  }

  return EXPLICIT_TAG_HINTS.has(token)
}

function resolveAttributeName(name: string): string {
  // Accept React-ism: className → class
  if (name === 'className') {
    return 'class'
  }

  // Accept React-ism: htmlFor → for
  if (name === 'htmlFor') {
    return 'for'
  }

  if (ATTR_ALIASES[name]) {
    return ATTR_ALIASES[name]
  }

  if (name.length > 2 && name.toLowerCase().startsWith('d-')) {
    return `data-${name.slice(2)}`
  }

  return name
}

function resolveAttributeNameForTag(name: string, tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (lowerTag === 'img') {
    // Backward compatibility for previous compact syntax where img[h] mapped to height.
    if (name === 'h') {
      return 'height'
    }
  }

  return resolveAttributeName(name)
}

function resolveAttributeOutputName(name: string, compact: boolean): string {
  if (!compact) {
    return name
  }

  if (ATTR_TO_ALIAS[name]) {
    return ATTR_TO_ALIAS[name]
  }

  if (name.startsWith('data-') && name.length > 5) {
    return `d-${name.slice(5)}`
  }

  return name
}

function resolveAttributeOutputNameForTag(
  name: string,
  tag: string,
  compact: boolean,
): string {
  void tag

  return resolveAttributeOutputName(name, compact)
}

function resolveAttributeValueAlias(
  attributeName: string,
  tag: string,
  value: string,
): string {
  const normalizedAttr = attributeName.toLowerCase()
  const normalizedTag = tag.toLowerCase()
  const normalizedValue = value.toLowerCase()

  const tagScopedAlias = VALUE_ALIAS_TO_VALUE_BY_ATTR_AND_TAG[normalizedAttr]?.[normalizedTag]
  if (tagScopedAlias?.[normalizedValue]) {
    return tagScopedAlias[normalizedValue]
  }

  const alias = VALUE_ALIAS_TO_VALUE_BY_ATTR[normalizedAttr]
  if (alias?.[normalizedValue]) {
    return alias[normalizedValue]
  }

  return value
}

function resolveAttributeValueOutputAlias(
  attributeName: string,
  tag: string,
  value: string,
  compact: boolean,
): string {
  if (!compact) {
    return value
  }

  const normalizedAttr = attributeName.toLowerCase()
  const normalizedTag = tag.toLowerCase()
  const normalizedValue = value.toLowerCase()

  const tagScopedAlias = VALUE_TO_ALIAS_BY_ATTR_AND_TAG[normalizedAttr]?.[normalizedTag]
  if (tagScopedAlias?.[normalizedValue]) {
    return tagScopedAlias[normalizedValue]
  }

  const alias = VALUE_TO_ALIAS_BY_ATTR[normalizedAttr]
  if (alias?.[normalizedValue]) {
    return alias[normalizedValue]
  }

  return value
}

function splitStyleDeclarations(value: string): string[] {
  const out: string[] = []
  let token = ''
  let quote: '"' | "'" | null = null
  let parenDepth = 0

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (quote) {
      token += char
      if (char === quote && value[index - 1] !== '\\') {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      token += char
      continue
    }

    if (char === '(') {
      parenDepth += 1
      token += char
      continue
    }

    if (char === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      token += char
      continue
    }

    if (char === ';' && parenDepth === 0) {
      if (token.trim().length > 0) {
        out.push(token.trim())
      }
      token = ''
      continue
    }

    token += char
  }

  if (token.trim().length > 0) {
    out.push(token.trim())
  }

  return out
}

function normalizeInlineStyleValue(value: string, mode: 'parse' | 'emit'): string {
  const declarations = splitStyleDeclarations(value)
  if (declarations.length === 0) {
    return value
  }

  const normalized: string[] = []

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex === -1) {
      normalized.push(declaration)
      continue
    }

    const rawProp = declaration.slice(0, colonIndex).trim()
    const rawCssValue = declaration.slice(colonIndex + 1).trim()

    if (!rawProp || !rawCssValue) {
      normalized.push(declaration)
      continue
    }

    const normalizedProp = mode === 'parse'
      ? (STYLE_PROP_ALIAS_TO_PROP[rawProp] ?? rawProp)
      : (STYLE_PROP_TO_ALIAS[rawProp.toLowerCase()] ?? rawProp)

    normalized.push(`${normalizedProp}:${rawCssValue}`)
  }

  return normalized.join(';')
}

function isSlimExpressionValue(value: string): boolean {
  const trimmed = value.trim()

  return (
    (trimmed.startsWith('${') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  )
}

function parseAttributeValue(
  name: string,
  rawValue: string,
  tag: string,
): SlimAttributeValue {
  const value = resolveAttributeValueAlias(name, tag, stripQuotes(rawValue))

  if (isSlimExpressionValue(value)) {
    return value
  }

  if (name.toLowerCase() === 'style') {
    return normalizeInlineStyleValue(value, 'parse')
  }

  const lowerName = name.toLowerCase()

  if (BOOLEAN_ATTRIBUTES.has(lowerName)) {
    const lowered = value.toLowerCase()
    if (lowered === 'true') {
      return true
    }
    if (lowered === 'false') {
      return false
    }
  }

  return value
}

function ensureChildDefaultRule(
  node: SlimElementNode,
  childTag: string,
): SlimChildDefaultRule {
  if (!node.childDefaults) {
    node.childDefaults = {}
  }

  const key = childTag.toLowerCase()
  if (!node.childDefaults[key]) {
    node.childDefaults[key] = {
      classes: [],
      attrs: {},
    }
  }

  return node.childDefaults[key]
}

function tryApplyChildDefaultToken(
  token: string,
  node: SlimElementNode,
  line: number,
): boolean {
  if (!token) {
    return false
  }

  const firstChar = token[0]
  const childTag = ALIAS_TAGS[firstChar]
  if (!childTag) {
    return false
  }

  const secondChar = token[1]
  if ((secondChar === '=' || secondChar === ':') && ATTR_ALIASES[firstChar] !== undefined) {
    // Disambiguate compact attribute aliases like "m=p" from child-default syntax.
    return false
  }

  const eqIndex = token.indexOf('=')
  const rawName = (eqIndex === -1 ? token.slice(1) : token.slice(1, eqIndex)).trim()
  if (!rawName) {
    throw new ParserIssue('Child inheritance token is missing an attribute name.', line, 1)
  }

  const outputName = resolveAttributeNameForTag(rawName, childTag)
  const rule = ensureChildDefaultRule(node, childTag)

  if (eqIndex === -1) {
    if (outputName === 'class') {
      return true
    }
    rule.attrs[outputName] = true
    return true
  }

  const rawValue = token.slice(eqIndex + 1).trim()
  const value = parseAttributeValue(outputName, rawValue, childTag)

  if (outputName === 'class') {
    if (typeof value === 'string' && value.length > 0) {
      rule.classes.push(...value.split(/\s+/).filter(Boolean))
    }
    return true
  }

  rule.attrs[outputName] = value
  return true
}

function isLikelyAttributeName(name: string): boolean {
  return /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(name)
}

function looksLikeCompactValue(token: string): boolean {
  return (
    /^(https?:\/\/|\.\/|\.\.\/|\/|#|mailto:|tel:|data:)/.test(token) ||
    /\.[a-z0-9]{2,8}(\?|$)/i.test(token) ||
    token.includes('?')
  )
}

function looksLikeMetaCharsetValue(token: string): boolean {
  return /^(utf-?8|iso[-_][\w-]+|windows[-_][\w-]+|shift[_-]jis)$/i.test(token)
}

function parseDimensionToken(token: string): { width: string; height: string } | null {
  const match = token.match(/^(\d+)x(\d+)$/i)
  if (!match) {
    return null
  }

  return {
    width: match[1],
    height: match[2],
  }
}

function splitDeclarationAndText(line: string): {
  declaration: string
  text?: string
} {
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
      let lookAhead = i
      while (lookAhead < line.length && line[lookAhead] === ' ') {
        lookAhead += 1
      }

      if (line[lookAhead] === '[') {
        continue
      }

        const declaration = line.slice(0, i).trimEnd()
        const text = line.slice(i + 1).trimStart()
      return {
        declaration,
        text: text.length > 0 ? text : undefined,
      }
    }
  }

  return { declaration: line }
}

function tokenizeAttributes(content: string): string[] {
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
      quote = char
      token += char
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
        let lookAhead = i
        while (lookAhead < content.length && /\s/.test(content[lookAhead])) {
          lookAhead += 1
        }

        const nextChar = content[lookAhead]
        const shouldMergeSplitChildDefault =
          token.length === 1 &&
          ALIAS_TAGS[token] !== undefined &&
          Boolean(nextChar) &&
          isIdentifierChar(nextChar)

        if (
          token.endsWith('=') ||
          token.endsWith(':') ||
          nextChar === '=' ||
          nextChar === ':' ||
          shouldMergeSplitChildDefault
        ) {
          continue
        }

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

function stripQuotes(value: string): string {
  if (value.length < 2) {
    return value
  }

  const first = value[0]
  const last = value[value.length - 1]
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1)
  }

  return value
}

function applyAttributeToken(
  token: string,
  node: SlimElementNode,
  line: number,
): void {
  if (tryApplyChildDefaultToken(token, node, line)) {
    return
  }

  const compactValue = stripQuotes(token)
  const colonIndex = token.indexOf(':')
  if (colonIndex > 0 && token.indexOf('=') === -1) {
    const rawName = token.slice(0, colonIndex).trim()
    const rawValue = token.slice(colonIndex + 1).trim()

    if (isLikelyAttributeName(rawName)) {
      const name = resolveAttributeNameForTag(rawName, node.tag)
      const value = parseAttributeValue(name, rawValue, node.tag)

      if (name === 'class') {
        if (typeof value === 'string' && value) {
          node.classes.push(...value.split(/\s+/).filter(Boolean))
        }
        return
      }

      if (name === 'id') {
        if (typeof value === 'string' && value) {
          node.id = value
        }
        return
      }

      node.attrs[name] = value
      return
    }
  }

  if (
    node.tag === 'a' &&
    node.attrs.href === undefined &&
    looksLikeCompactValue(compactValue)
  ) {
    node.attrs.href = compactValue
    return
  }

  if (
    node.tag === 'img' &&
    node.attrs.src === undefined &&
    looksLikeCompactValue(compactValue)
  ) {
    node.attrs.src = compactValue
    return
  }

  if (
    node.tag === 'input' &&
    node.attrs.type === undefined &&
    COMMON_INPUT_TYPES.has(compactValue)
  ) {
    node.attrs.type = compactValue
    return
  }

  if (
    node.tag === 'meta' &&
    node.attrs.charset === undefined &&
    looksLikeMetaCharsetValue(compactValue)
  ) {
    node.attrs.charset = compactValue
    return
  }

  if (
    DIMENSIONAL_MEDIA_TAGS.has(node.tag.toLowerCase()) &&
    node.attrs.width === undefined &&
    node.attrs.height === undefined
  ) {
    const dimensions = parseDimensionToken(compactValue)
    if (dimensions) {
      node.attrs.width = dimensions.width
      node.attrs.height = dimensions.height
      return
    }
  }

  const eqIndex = token.indexOf('=')

  if (eqIndex === -1) {
    if (!token) {
      return
    }

    const attrName = resolveAttributeNameForTag(token, node.tag)
    node.attrs[attrName] = true
    return
  }

  const rawName = token.slice(0, eqIndex).trim()
  if (!isLikelyAttributeName(rawName)) {
    if (
      node.tag === 'a' &&
      node.attrs.href === undefined &&
      looksLikeCompactValue(compactValue)
    ) {
      node.attrs.href = compactValue
      return
    }

    if (
      node.tag === 'img' &&
      node.attrs.src === undefined &&
      looksLikeCompactValue(compactValue)
    ) {
      node.attrs.src = compactValue
      return
    }
  }

  const rawValue = token.slice(eqIndex + 1).trim()

  if (!rawName) {
    throw new ParserIssue('Invalid attribute key.', line, 1)
  }

  const name = resolveAttributeNameForTag(rawName, node.tag)
  const value = parseAttributeValue(name, rawValue, node.tag)

  if (name === 'class') {
    if (typeof value === 'string' && value) {
      node.classes.push(...value.split(/\s+/).filter(Boolean))
    }
    return
  }

  if (name === 'id') {
    if (typeof value === 'string' && value) {
      node.id = value
    }
    return
  }

  node.attrs[name] = value
}

function isLooseAttributeToken(token: string, node: SlimElementNode): boolean {
  if (!token) {
    return false
  }

  if (token.startsWith('[') && token.endsWith(']')) {
    return true
  }

  if (token.includes('=')) {
    return true
  }

  const colonIndex = token.indexOf(':')
  if (colonIndex > 0) {
    const key = token.slice(0, colonIndex)
    if (ATTR_ALIASES[key] || key.length <= 2) {
      return true
    }
  }

  const compactValue = stripQuotes(token)
  if (
    node.tag === 'a' &&
    node.attrs.href === undefined &&
    looksLikeCompactValue(compactValue)
  ) {
    return true
  }

  if (
    node.tag === 'img' &&
    node.attrs.src === undefined &&
    looksLikeCompactValue(compactValue)
  ) {
    return true
  }

  if (
    node.tag === 'input' &&
    node.attrs.type === undefined &&
    COMMON_INPUT_TYPES.has(compactValue)
  ) {
    return true
  }

  if (
    node.tag === 'meta' &&
    node.attrs.charset === undefined &&
    looksLikeMetaCharsetValue(compactValue)
  ) {
    return true
  }

  if (
    DIMENSIONAL_MEDIA_TAGS.has(node.tag.toLowerCase()) &&
    parseDimensionToken(compactValue) !== null &&
    node.attrs.width === undefined &&
    node.attrs.height === undefined
  ) {
    return true
  }

  const lowered = compactValue.toLowerCase()
  return BOOLEAN_ATTRIBUTES.has(lowered)
}

function shouldIgnoreLoosePaddingToken(token: string, node: SlimElementNode): boolean {
  const lowered = token.toLowerCase()

  if (node.id?.toLowerCase() === lowered) {
    return true
  }

  if (node.classes.some((className) => className.toLowerCase() === lowered)) {
    return true
  }

  for (const [attrName, attrValue] of Object.entries(node.attrs)) {
    if (attrName.toLowerCase() === lowered) {
      return true
    }

    if (typeof attrValue === 'string' && attrValue.toLowerCase() === lowered) {
      return true
    }
  }

  return false
}

function parseLooseInlineContent(
  content: string,
  node: SlimElementNode,
  line: number,
): string | undefined {
  const tokens = tokenizeAttributes(content)
  if (tokens.length === 0) {
    return undefined
  }

  const firstToken = tokens[0]
  if (!isLooseAttributeToken(firstToken, node) && !firstToken.startsWith('[')) {
    return content.trim().length > 0 ? content.trim() : undefined
  }

  const textTokens: string[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token.startsWith('[') && token.endsWith(']')) {
      const blockContent = token.slice(1, -1).trim()
      if (blockContent) {
        parseAttributesBlock(blockContent, node, line)
      }
      continue
    }

    if (isLooseAttributeToken(token, node)) {
      const separatorIndex = token.indexOf('=') >= 0 ? token.indexOf('=') : token.indexOf(':')
      if (separatorIndex > 0) {
        const rawName = token.slice(0, separatorIndex).trim()
        const name = resolveAttributeNameForTag(rawName, node.tag)
        const valueParts = [token.slice(separatorIndex + 1).trim()]

        if (VALUE_CONTINUATION_ATTRIBUTES.has(name.toLowerCase())) {
          while (index + 1 < tokens.length) {
            const nextToken = tokens[index + 1]
            if (nextToken.startsWith('[') && nextToken.endsWith(']')) {
              break
            }

            if (isLooseAttributeToken(nextToken, node) || shouldIgnoreLoosePaddingToken(nextToken, node)) {
              break
            }

            valueParts.push(nextToken)
            index += 1
          }
        }

        applyAttributeToken(`${rawName}=${valueParts.join(' ')}`, node, line)
      } else {
        applyAttributeToken(token, node, line)
      }
      continue
    }

    if (shouldIgnoreLoosePaddingToken(token, node)) {
      continue
    }

    for (let j = index; j < tokens.length; j += 1) {
      textTokens.push(tokens[j])
    }
    break
  }

  return textTokens.length > 0 ? textTokens.join(' ') : undefined
}

function parseAttributesBlock(
  content: string,
  node: SlimElementNode,
  line: number,
): void {
  const tokens = tokenizeAttributes(content)
  for (const token of tokens) {
    applyAttributeToken(token, node, line)
  }
}

function parseElementDeclaration(
  line: string,
  lineNumber: number,
): ParseElementResult {
  const { declaration, text } = splitDeclarationAndText(line)

  if (!declaration) {
    throw new ParserIssue('Missing element declaration.', lineNumber, 1)
  }

  let index = 0
  let tag = 'div'

  const firstChar = declaration[index]
  const aliasTag = ALIAS_TAGS[firstChar]
  let parsedAlias = false

  if (aliasTag) {
    const hasAliasBoundary = shouldUseTagAliasToken(declaration, index)
    const hasRepeatedTagName = shouldConsumeRepeatedTagName(declaration, index + 1, aliasTag)
    if (hasAliasBoundary || hasRepeatedTagName) {
      tag = aliasTag
      index += 1
      parsedAlias = true

      if (hasRepeatedTagName) {
        index += aliasTag.length
      }
    }
  }

  if (!parsedAlias) {
    if (isIdentifierChar(firstChar)) {
      const start = index
      while (index < declaration.length && isIdentifierChar(declaration[index])) {
        index += 1
      }
      tag = declaration.slice(start, index)
    } else if (firstChar !== '.' && firstChar !== '#' && firstChar !== '[') {
      throw new ParserIssue(
        `Unsupported declaration start "${firstChar}".`,
        lineNumber,
        1,
      )
    }
  }

  const node: SlimElementNode = {
    type: 'element',
    tag,
    classes: [],
    attrs: {},
    text: undefined,
    children: [],
    line: lineNumber,
  }

  while (index < declaration.length) {
    const char = declaration[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (char === '.') {
      index += 1
      const start = index
      while (index < declaration.length && isIdentifierChar(declaration[index])) {
        index += 1
      }
      const className = declaration.slice(start, index)
      if (!className) {
        throw new ParserIssue('Class selector is missing a name.', lineNumber, index)
      }

      let separatorIndex = index
      while (separatorIndex < declaration.length && /\s/.test(declaration[separatorIndex])) {
        separatorIndex += 1
      }

      const separator = declaration[separatorIndex]

      if (
        (separator === '=' || separator === ':') &&
        (ATTR_ALIASES[className] !== undefined || className.length <= 2)
      ) {
        let valueStart = separatorIndex + 1
        while (valueStart < declaration.length && /\s/.test(declaration[valueStart])) {
          valueStart += 1
        }

        let valueEnd = valueStart
        let quote: '"' | "'" | null = null

        while (valueEnd < declaration.length) {
          const current = declaration[valueEnd]
          if (quote) {
            if (current === quote && declaration[valueEnd - 1] !== '\\') {
              quote = null
            }
            valueEnd += 1
            continue
          }

          if (current === '"' || current === "'") {
            quote = current
            valueEnd += 1
            continue
          }

          if (/\s/.test(current)) {
            break
          }

          valueEnd += 1
        }

        const rawValue = declaration.slice(valueStart, valueEnd).trim()
        if (rawValue.length === 0) {
          throw new ParserIssue('Invalid attribute value.', lineNumber, separatorIndex + 1)
        }

        applyAttributeToken(`${className}${separator}${rawValue}`, node, lineNumber)
        index = valueEnd
        continue
      }

      node.classes.push(className)
      continue
    }

    if (char === '#') {
      index += 1
      const start = index
      while (index < declaration.length && isIdentifierChar(declaration[index])) {
        index += 1
      }
      const id = declaration.slice(start, index)
      if (!id) {
        throw new ParserIssue('ID selector is missing a name.', lineNumber, index)
      }
      node.id = id
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

      // Auto-close unclosed bracket at end of declaration instead of erroring
      if (declaration[end] !== ']') {
        end = declaration.length
      }
      
      const content = declaration.slice(index + 1, end).trim()
      if (content) {
        parseAttributesBlock(content, node, lineNumber)
      }
      index = end + 1
      continue
    }

    if (char === '=') {
      const end = declaration.length
      const equalsContent = declaration.slice(index + 1, end).trim()
      if (equalsContent) {
        applyAttributeToken(equalsContent, node, lineNumber)
      }
      index = end
      continue
    }
    
    // Check for inline tailwind classes with slashes or arbitrary values: .w-1/2, .bg-black/90, .mt-[20px] 
    // They should have been caught by the . class selector but they might have special chars.
    let specialCharMatch = false
    if (char === '/' || char === ':' || char === '%' || char === '-') {
       // if we are right after a class selector that aborted early because of this char
       const startSpecial = index
       while (index < declaration.length && (isIdentifierChar(declaration[index]) || declaration[index] === '/' || declaration[index] === '%' || declaration[index] === '[' || declaration[index] === ']' || declaration[index] === '\\')) {
         index += 1
       }
       const specialTail = declaration.slice(startSpecial, index)
       
       if (node.classes.length > 0) {
         node.classes[node.classes.length - 1] += specialTail
       } else {
         // Should not happen as first char, but just in case
         node.classes.push(specialTail)
       }
       specialCharMatch = true
       continue
    }

    if (!specialCharMatch) {
      // Graceful skip: instead of hard error, just stop parsing the declaration
      // and treat the rest as consumed
      break
    }
  }

  if (text) {
    let currentText = text.trim()
    while (currentText.length > 0 && currentText.endsWith(']')) {
      const match = currentText.match(/^(.*?)\[([^\]\\]*(?:\\.[^\]\\]*)*)\]$/)
      if (match) {
        const blockContent = match[2].trim()
        if (blockContent) {
          parseAttributesBlock(blockContent, node, lineNumber)
        }
        currentText = match[1].trim()
      } else {
        break
      }
    }

    if (currentText) {
      if (currentText.startsWith('> ')) {
        const itemsStr = currentText.slice(2).trim()
        const items = itemsStr.includes('|')
          ? itemsStr.split('|').map(s => s.trim())
          : itemsStr.split(',').map(s => s.trim())

        const childTag = IMPLICIT_CHILD_TAG_BY_PARENT[node.tag.toLowerCase()] || 'div'

        for (const item of items) {
          if (!item) continue
          node.children.push({
            type: 'element',
            tag: childTag,
            classes: [],
            attrs: {},
            text: item,
            children: [],
            line: lineNumber,
          })
        }
      } else {
        const looseText = parseLooseInlineContent(currentText, node, lineNumber)
        if (looseText !== undefined) {
          node.text = looseText
        }
      }
    }
  }

  // Void elements can't contain text — silently discard instead of hard error
  if (VOID_TAGS.has(node.tag.toLowerCase()) && node.text) {
    node.text = undefined
  }

  return { node }
}

export function parseSlimML(source: string, indentSize = 2): SlimParseResult {
  // Strip BOM, zero-width chars, and other invisible Unicode artifacts
  const cleanedSource = source
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')

  const ast: SlimDocument = {
    type: 'document',
    children: [],
  }

  const stack: Array<SlimDocument | SlimElementNode> = [ast]
  let indentationMode: 'space' | 'tab' | 'depth-prefix' | null = null
  let canUseDepthPrefix = true
  const warnings: string[] = []

  const rawLines = cleanedSource.replace(/\r\n?/g, '\n').split('\n')
  let isDepthPrefix = false
  for (const line of rawLines) {
    if (line.trim().length > 0) {
      if (looksLikeDepthPrefixedSlimLine(line)) {
        isDepthPrefix = true
      }
      break
    }
  }

  const lines: { text: string; lineNumber: number }[] = []
  if (isDepthPrefix) {
    for (let i = 0; i < rawLines.length; i += 1) {
      const line = rawLines[i]
      if (line.trim().length === 0) continue
      
      const isListItem = /^[ \t]*[-*+]\s+/.test(line)
      if (!/^\d/.test(line.trimStart()) && !isListItem && lines.length > 0) {
        lines[lines.length - 1].text += ' ' + line.trim()
      } else {
        lines.push({ text: line, lineNumber: i + 1 })
      }
    }
  } else {
    for (let i = 0; i < rawLines.length; i += 1) {
      if (rawLines[i].trim().length > 0) {
        lines.push({ text: rawLines[i], lineNumber: i + 1 })
      }
    }
  }

  const errors: SlimParseError[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index].text
    const lineNumber = lines[index].lineNumber

    try {
      const depthPrefixMatch = rawLine.match(/^(\d+)\s*(.*)$/)
      if (!indentationMode && canUseDepthPrefix && looksLikeDepthPrefixedSlimLine(rawLine)) {
        indentationMode = 'depth-prefix'
      }

      let depth = 0
      let content = ''

      if (indentationMode === 'depth-prefix') {
        if (!depthPrefixMatch) {
          // Graceful: treat line without depth prefix as continuation at current depth
          depth = Math.max(0, stack.length - 1)
          content = rawLine.trim()
          warnings.push(`Line ${lineNumber}: missing depth prefix, assumed depth ${depth}.`)
        } else {
          depth = Number.parseInt(depthPrefixMatch[1], 10)
          content = depthPrefixMatch[2]
        }
      } else {
        canUseDepthPrefix = false
        const indentation = rawLine.match(/^[ \t]*/)?.[0] ?? ''
        const hasTabs = indentation.includes('\t')
        const hasSpaces = indentation.includes(' ')

        // Auto-normalize mixed tabs and spaces instead of erroring
        if (hasTabs && hasSpaces) {
          warnings.push(`Line ${lineNumber}: mixed tabs and spaces, auto-normalized.`)
          // Convert to the dominant mode, or spaces if no mode set yet
          const normalizedIndent = indentation.replace(/\t/g, '  ')
          const leadingSpaces = normalizedIndent.length
          depth = Math.round(leadingSpaces / indentSize)
          if (!indentationMode) {
            indentationMode = 'space'
          }
          content = rawLine.slice(indentation.length).trimStart()
        } else {
          if (!indentationMode && indentation.length > 0) {
            indentationMode = hasTabs ? 'tab' : 'space'
          }

          // Auto-normalize style mismatch instead of erroring
          if (indentationMode === 'space' && hasTabs) {
            warnings.push(`Line ${lineNumber}: expected spaces but found tabs, auto-converted.`)
            const normalizedIndent = indentation.replace(/\t/g, '  ')
            depth = Math.round(normalizedIndent.length / indentSize)
            content = rawLine.slice(indentation.length).trimStart()
          } else if (indentationMode === 'tab' && hasSpaces) {
            warnings.push(`Line ${lineNumber}: expected tabs but found spaces, auto-converted.`)
            depth = Math.round(indentation.length / indentSize)
            content = rawLine.slice(indentation.length).trimStart()
          } else if (indentationMode === 'tab') {
            depth = indentation.length
            content = rawLine.slice(indentation.length).trimStart()
          } else {
            const leadingSpaces = indentation.length
            // Snap to nearest valid depth instead of erroring
            if (leadingSpaces % indentSize !== 0) {
              warnings.push(`Line ${lineNumber}: indentation (${leadingSpaces} spaces) not a multiple of ${indentSize}, snapped to nearest.`)
              depth = Math.round(leadingSpaces / indentSize)
            } else {
              depth = leadingSpaces / indentSize
            }
            content = rawLine.slice(indentation.length).trimStart()
          }
        }
      }

      if (depth > stack.length - 1) {
        depth = stack.length - 1
      }

      while (stack.length > depth + 1) {
        stack.pop()
      }

      content = content.replace(/^\\([^A-Za-z0-9])/, '$1')

      if (content.startsWith('//')) {
        continue
      }

      const headingMatch = content.match(/^(#{1,6})\s+(.+)$/)
      const parentNode = stack[stack.length - 1]
      const implicitChildTag = getImplicitChildTag(parentNode)
      const canUseImplicitChild =
        implicitChildTag !== undefined &&
        !content.startsWith('| ') &&
        !headingMatch &&
        !isExplicitDeclarationInImplicitContext(content)

      let node: SlimNode
      if (headingMatch) {
        node = {
          type: 'element',
          tag: `h${headingMatch[1].length}`,
          classes: [],
          attrs: {},
          text: headingMatch[2],
          children: [],
          line: lineNumber,
        }
      } else if (content.startsWith('| ')) {
        node = {
          type: 'text',
          value: content.slice(2),
          line: lineNumber,
        }
      } else if (canUseImplicitChild && implicitChildTag) {
        node = {
          type: 'element',
          tag: implicitChildTag,
          classes: [],
          attrs: {},
          text: content,
          children: [],
          line: lineNumber,
        }
      } else {
        try {
          node = parseElementDeclaration(content, lineNumber).node
        } catch (declError) {
          // Graceful fallback: treat unparseable line as text node
          if (declError instanceof ParserIssue) {
            warnings.push(`Line ${lineNumber}: ${declError.message} — treated as text.`)
          }
          node = {
            type: 'text',
            value: content,
            line: lineNumber,
          }
        }
      }

      getChildren(stack[stack.length - 1]).push(node)

      if (node.type === 'element' && !VOID_TAGS.has(node.tag.toLowerCase())) {
        stack.push(node)
      }
    } catch (error) {
      // Last resort: if we truly can't handle the line, add as warning + text node
      if (error instanceof ParserIssue) {
        warnings.push(`Line ${lineNumber}: ${error.message} — skipped.`)
      } else {
        warnings.push(`Line ${lineNumber}: unexpected parser error — skipped.`)
      }

      // Try to add the raw content as a text node instead of discarding
      const fallbackContent = rawLine.trim()
      if (fallbackContent.length > 0) {
        const fallbackNode: SlimTextNode = {
          type: 'text',
          value: fallbackContent,
          line: lineNumber,
        }
        getChildren(stack[stack.length - 1]).push(fallbackNode)
      }
      continue
    }
  }

  // Never hard-fail: always return ok with warnings instead of errors
  // Only fail if we truly have zero parseable content from a non-empty source
  if (errors.length > 0) {
    // Convert remaining hard errors to warnings and include whatever we parsed
    for (const err of errors) {
      warnings.push(`Line ${err.line}, col ${err.column}: ${err.message}`)
    }
  }

  return {
    ok: true,
    ast,
    warnings,
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', '&quot;')
}

interface EffectiveElementContext {
  id?: string
  classes: string[]
  attrs: Record<string, SlimAttributeValue>
}

function cloneChildDefaultRule(rule: SlimChildDefaultRule): SlimChildDefaultRule {
  return {
    classes: [...rule.classes],
    attrs: { ...rule.attrs },
  }
}

function mergeChildDefaultMaps(
  base?: Record<string, SlimChildDefaultRule>,
  extra?: Record<string, SlimChildDefaultRule>,
): Record<string, SlimChildDefaultRule> | undefined {
  if (!base && !extra) {
    return undefined
  }

  const merged: Record<string, SlimChildDefaultRule> = {}

  const mergeFromSource = (
    source: Record<string, SlimChildDefaultRule> | undefined,
    allowAttrOverwrite: boolean,
  ): void => {
    if (!source) {
      return
    }

    for (const [tag, rule] of Object.entries(source)) {
      const key = tag.toLowerCase()
      if (!merged[key]) {
        merged[key] = cloneChildDefaultRule(rule)
        continue
      }

      const target = merged[key]

      for (const className of rule.classes) {
        if (!target.classes.includes(className)) {
          target.classes.push(className)
        }
      }

      for (const [name, value] of Object.entries(rule.attrs)) {
        if (allowAttrOverwrite || target.attrs[name] === undefined) {
          target.attrs[name] = value
        }
      }
    }
  }

  mergeFromSource(base, true)
  mergeFromSource(extra, false)

  return merged
}

function collectCompactChildDefaults(
  node: SlimElementNode,
): Record<string, SlimChildDefaultRule> | undefined {
  const groups = new Map<string, SlimElementNode[]>()

  for (const child of node.children) {
    if (child.type !== 'element') {
      continue
    }

    const tag = child.tag.toLowerCase()
    const group = groups.get(tag)
    if (group) {
      group.push(child)
    } else {
      groups.set(tag, [child])
    }
  }

  const synthesized: Record<string, SlimChildDefaultRule> = {}

  for (const [tag, children] of groups) {
    if (children.length < 2) {
      continue
    }

    const sharedClasses = children[0].classes.filter((className) =>
      children.every((child) => child.classes.includes(className)),
    )

    if (sharedClasses.length === 0) {
      continue
    }

    synthesized[tag] = {
      classes: sharedClasses,
      attrs: {},
    }
  }

  return Object.keys(synthesized).length > 0 ? synthesized : undefined
}

function resolveSlimEmissionContext(
  node: SlimElementNode,
  parentChildDefaults?: Record<string, SlimChildDefaultRule>,
): EffectiveElementContext {
  const inherited = parentChildDefaults?.[node.tag.toLowerCase()]
  const classes = [...node.classes]
  const attrs: Record<string, SlimAttributeValue> = { ...node.attrs }
  let id = node.id

  if (inherited) {
    for (const className of inherited.classes) {
      let index = classes.indexOf(className)
      while (index !== -1) {
        classes.splice(index, 1)
        index = classes.indexOf(className)
      }
    }

    for (const [name, value] of Object.entries(inherited.attrs)) {
      if (name === 'id') {
        if (id === value) {
          id = undefined
        }
        continue
      }

      if (name === 'class' && typeof value === 'string') {
        for (const className of value.split(/\s+/).filter(Boolean)) {
          let index = classes.indexOf(className)
          while (index !== -1) {
            classes.splice(index, 1)
            index = classes.indexOf(className)
          }
        }
        continue
      }

      if (attrs[name] !== undefined && attrs[name] === value) {
        delete attrs[name]
      }
    }
  }

  return {
    id,
    classes,
    attrs,
  }
}

function getInheritedChildRule(
  parent: SlimElementNode | undefined,
  childTag: string,
): SlimChildDefaultRule | undefined {
  if (!parent?.childDefaults) {
    return undefined
  }
  return parent.childDefaults[childTag.toLowerCase()]
}

function resolveEffectiveElementContext(
  node: SlimElementNode,
  parent?: SlimElementNode,
): EffectiveElementContext {
  const inherited = getInheritedChildRule(parent, node.tag)
  const classes = [...(node.classes || [])]
  const attrs: Record<string, SlimAttributeValue> = { ...node.attrs }
  let id = node.id

  if (inherited) {
    for (const className of inherited.classes) {
      if (!classes.includes(className)) {
        classes.push(className)
      }
    }

    for (const [name, value] of Object.entries(inherited.attrs)) {
      if (name === 'id') {
        if (!id && typeof value === 'string') {
          id = value
        }
        continue
      }

      if (name === 'class') {
        if (typeof value === 'string') {
          for (const className of value.split(/\s+/).filter(Boolean)) {
            if (!classes.includes(className)) {
              classes.push(className)
            }
          }
        }
        continue
      }

      if (attrs[name] === undefined) {
        attrs[name] = value
      }
    }
  }

  if (node.tag.toLowerCase() === 'input' && attrs.type === undefined) {
    attrs.type = 'text'
  }

  if (
    node.tag.toLowerCase() === 'button' &&
    parent?.tag.toLowerCase() === 'form' &&
    attrs.type === undefined
  ) {
    attrs.type = 'submit'
  }

  return {
    id,
    classes,
    attrs,
  }
}

function serializeAttributes(
  node: SlimElementNode,
  parent?: SlimElementNode,
): string {
  const effective = resolveEffectiveElementContext(node, parent)
  const attrs: Array<[string, SlimAttributeValue]> = []

  if (effective.id) {
    attrs.push(['id', effective.id])
  }

  if (effective.classes.length > 0) {
    attrs.push(['class', effective.classes.join(' ')])
  }

  for (const [name, value] of Object.entries(effective.attrs)) {
    attrs.push([name, value])
  }

  if (attrs.length === 0) {
    return ''
  }

  return attrs
    .map(([name, value]) => {
      if (typeof value === 'boolean') {
        return value ? name : ''
      }
      return `${name}="${escapeAttribute(value)}"`
    })
    .filter(Boolean)
    .join(' ')
}

function emitNodeToHtml(
  node: SlimNode,
  depth: number,
  parent?: SlimElementNode,
): string {
  try {
    const indent = '  '.repeat(depth)

    if (node.type === 'text') {
      return `${indent}${escapeHtml(node.value)}\n`
    }

    const attrs = serializeAttributes(node, parent)
    const attrSegment = attrs ? ` ${attrs}` : ''
    const tagName = node.tag
    const tagIsVoid = VOID_TAGS.has(tagName.toLowerCase())

    if (tagIsVoid) {
      return `${indent}<${tagName}${attrSegment}>\n`
    }

    const children = node.children || []

    if (!node.text && children.length === 0) {
      return `${indent}<${tagName}${attrSegment}></${tagName}>\n`
    }

    if (node.text && children.length === 0) {
      return `${indent}<${tagName}${attrSegment}>${escapeHtml(node.text)}</${tagName}>\n`
    }

    let html = `${indent}<${tagName}${attrSegment}>\n`

    if (node.text) {
      html += `${'  '.repeat(depth + 1)}${escapeHtml(node.text)}\n`
    }

    for (const child of children) {
      html += emitNodeToHtml(child, depth + 1, node)
    }

    html += `${indent}</${tagName}>\n`
    return html
  } catch (err) {
    const nodeInfo = node.type === 'element' ? `type: ${node.type}, tag: ${node.tag}` : `type: ${node.type}`
    console.warn(`SlimML: error emitting node (${nodeInfo})`, err)
    return `<!-- Error emitting node -->\n`
  }
}

export function compileToHtml(ast: SlimDocument): string {
  try {
    return (ast.children || []).map((node) => emitNodeToHtml(node, 0)).join('').trim()
  } catch (err) {
    console.warn(`SlimML: error compiling to HTML (${(ast.children || []).length} top-level nodes)`, err)
    return '<!-- Error compiling to HTML -->'
  }
}

function quoteSlimValue(value: string): string {
  if (isSlimExpressionValue(value)) {
    return value
  }

  if (/^[^\s\[\]"']+$/.test(value)) {
    return value
  }
  return JSON.stringify(value)
}

function prepareAttributeValueForSlimEmission(
  attributeName: string,
  tag: string,
  value: string,
  compact: boolean,
): string {
  const aliasedValue = resolveAttributeValueOutputAlias(attributeName, tag, value, compact)

  if (compact && attributeName.toLowerCase() === 'style' && !isSlimExpressionValue(aliasedValue)) {
    return normalizeInlineStyleValue(aliasedValue, 'emit')
  }

  return aliasedValue
}

function flattenInlineText(node: SlimElementNode): string | undefined {
  if (node.text && node.children.length === 0) {
    return node.text
  }

  if (node.text || node.children.length !== 1) {
    return undefined
  }

  const onlyChild = node.children[0]
  if (onlyChild.type === 'text') {
    return onlyChild.value
  }

  return undefined
}

function emitElementDeclaration(
  node: SlimElementNode,
  parent: SlimElementNode | undefined,
  compact: boolean,
  childDefaults?: Record<string, SlimChildDefaultRule>,
  parentChildDefaults?: Record<string, SlimChildDefaultRule>,
): string {
  const lowerTag = node.tag.toLowerCase()
  const tagToken = compact ? TAG_TO_ALIAS[lowerTag] ?? node.tag : node.tag
  const canUseImplicitDiv = compact && lowerTag === 'div'
  let declaration = canUseImplicitDiv ? '' : tagToken

  const emissionContext = compact
    ? resolveSlimEmissionContext(node, parentChildDefaults)
    : {
        id: node.id,
        classes: [...node.classes],
        attrs: { ...node.attrs },
      }

  if (emissionContext.id) {
    declaration += `#${emissionContext.id}`
  }

  for (const className of emissionContext.classes) {
    declaration += `.${className}`
  }

  const tokens: string[] = []
  const attrs = { ...emissionContext.attrs }
  const typeValue = typeof attrs.type === 'string' ? attrs.type.toLowerCase() : undefined

  const isDefaultInputTextType =
    lowerTag === 'input' && typeValue === 'text'
  const isDefaultFormSubmitType =
    lowerTag === 'button' &&
    parent?.tag.toLowerCase() === 'form' &&
    typeValue === 'submit'
  const isDefaultButtonType =
    lowerTag === 'button' &&
    parent?.tag.toLowerCase() !== 'form' &&
    typeValue === 'button'

  if (compact && (isDefaultInputTextType || isDefaultFormSubmitType || isDefaultButtonType)) {
    delete attrs.type
  }

  if (compact && lowerTag === 'script' && attrs.type === 'text/javascript') {
    delete attrs.type
  }

  if (compact && lowerTag === 'style' && attrs.type === 'text/css') {
    delete attrs.type
  }

  if (compact && lowerTag === 'form') {
    if (typeof attrs.method === 'string' && attrs.method.toLowerCase() === 'get') {
      delete attrs.method
    }

    if (attrs.enctype === 'application/x-www-form-urlencoded') {
      delete attrs.enctype
    }
  }

  if (
    compact &&
    lowerTag === 'link' &&
    typeof attrs.rel === 'string' &&
    attrs.rel.toLowerCase() === 'stylesheet' &&
    attrs.type === 'text/css'
  ) {
    delete attrs.type
  }

  if (compact && lowerTag === 'ol' && attrs.type === '1') {
    delete attrs.type
  }

  if (compact && (lowerTag === 'td' || lowerTag === 'th')) {
    if (attrs.colspan === '1') {
      delete attrs.colspan
    }
    if (attrs.rowspan === '1') {
      delete attrs.rowspan
    }
  }

  if (compact && lowerTag === 'img' && attrs.decoding === 'auto') {
    delete attrs.decoding
  }

  if (compact && typeof attrs.href === 'string' && lowerTag === 'a') {
    tokens.push(quoteSlimValue(attrs.href))
    delete attrs.href
  }

  if (compact && typeof attrs.src === 'string' && lowerTag === 'img') {
    tokens.push(quoteSlimValue(attrs.src))
    delete attrs.src
  }

  if (compact && DIMENSIONAL_MEDIA_TAGS.has(lowerTag)) {
    const widthValue = attrs.width
    const heightValue = attrs.height
    if (
      typeof widthValue === 'string' &&
      typeof heightValue === 'string' &&
      /^\d+$/.test(widthValue) &&
      /^\d+$/.test(heightValue)
    ) {
      tokens.push(`${widthValue}x${heightValue}`)
      delete attrs.width
      delete attrs.height
    }
  }

  if (compact && typeof attrs.charset === 'string' && lowerTag === 'meta') {
    tokens.push(quoteSlimValue(attrs.charset))
    delete attrs.charset
  }

  for (const [name, value] of Object.entries(attrs)) {
    const outputName = resolveAttributeOutputNameForTag(name, node.tag, compact)

    if (typeof value === 'boolean') {
      if (value) {
        tokens.push(outputName)
      }
      continue
    }

    const outputValue = prepareAttributeValueForSlimEmission(name, node.tag, value, compact)
    tokens.push(`${outputName}=${quoteSlimValue(outputValue)}`)
  }

  const effectiveChildDefaults = childDefaults ?? node.childDefaults

  if (effectiveChildDefaults) {
    for (const [childTag, rule] of Object.entries(effectiveChildDefaults)) {
      const childToken = compact ? TAG_TO_ALIAS[childTag.toLowerCase()] ?? childTag : childTag

      for (const className of rule.classes) {
        const classToken = compact ? ATTR_TO_ALIAS.class : 'class'
        tokens.push(`${childToken}${classToken}=${quoteSlimValue(className)}`)
      }

      for (const [name, value] of Object.entries(rule.attrs)) {
        const outputName = resolveAttributeOutputNameForTag(name, childTag, compact)

        if (typeof value === 'boolean') {
          if (value) {
            tokens.push(`${childToken}${outputName}`)
          }
          continue
        }

        const outputValue = prepareAttributeValueForSlimEmission(name, childTag, value, compact)
        tokens.push(`${childToken}${outputName}=${quoteSlimValue(outputValue)}`)
      }
    }
  }

  if (canUseImplicitDiv && declaration.length === 0 && tokens.length === 0) {
    declaration = tagToken
  }

  if (tokens.length > 0) {
    declaration += `[${tokens.join(' ')}]`
  }

  return declaration
}

function emitNodeToSlim(
  node: SlimNode,
  depth: number,
  options: ResolvedSlimCompileOptions,
  parent?: SlimElementNode,
  parentChildDefaults?: Record<string, SlimChildDefaultRule>,
): string[] {
  const linePrefix = options.useDepthPrefix
    ? `${depth}`
    : options.indent.repeat(depth)

  if (node.type === 'text') {
    return [`${linePrefix}| ${node.value}`]
  }

  if (options.useCompactSyntax && parent) {
    const implicitChildTag = IMPLICIT_CHILD_TAG_BY_PARENT[parent.tag.toLowerCase()]
    const inlineText = flattenInlineText(node)
    const canEmitImplicitChild =
      implicitChildTag === node.tag.toLowerCase() &&
      inlineText !== undefined &&
      !isExplicitDeclarationInImplicitContext(inlineText) &&
      !node.id &&
      node.classes.length === 0 &&
      Object.keys(node.attrs).length === 0 &&
      !node.childDefaults

    if (canEmitImplicitChild) {
      return [`${linePrefix}${inlineText}`]
    }
  }

  const synthesizedChildDefaults = options.synthesizeChildDefaults
    ? collectCompactChildDefaults(node)
    : undefined
  const effectiveChildDefaults = options.useCompactSyntax
    ? mergeChildDefaultMaps(node.childDefaults, synthesizedChildDefaults)
    : node.childDefaults
  const inlineText = flattenInlineText(node)
  const declaration = emitElementDeclaration(
    node,
    parent,
    options.useCompactSyntax,
    effectiveChildDefaults,
    parentChildDefaults,
  )
  const lines = [
    inlineText !== undefined
      ? `${linePrefix}${declaration} ${inlineText}`
      : `${linePrefix}${declaration}`,
  ]

  let emittedColumnar = false
  if (options.useCompactSyntax && !node.text && node.children.length > 0) {
    const implicitChildTag = IMPLICIT_CHILD_TAG_BY_PARENT[node.tag.toLowerCase()]
    if (implicitChildTag && node.children.every(child => 
      child.type === 'element' &&
      child.tag.toLowerCase() === implicitChildTag &&
      !child.id &&
      child.classes.length === 0 &&
      Object.keys(child.attrs).length === 0 &&
      !child.childDefaults &&
      flattenInlineText(child) !== undefined
    )) {
      const items = node.children.map(child => flattenInlineText(child as SlimElementNode) as string)
      if (!items.some(item => item.includes('|'))) {
        lines[0] = `${linePrefix}${declaration} > ${items.join(' | ')}`
        emittedColumnar = true
      } else if (!items.some(item => item.includes(','))) {
        lines[0] = `${linePrefix}${declaration} > ${items.join(' , ')}`
        emittedColumnar = true
      }
    }
  }

  const emittedInlineFromChild =
    !emittedColumnar && inlineText !== undefined && !node.text && node.children.length === 1

  if (node.text && node.children.length > 0 && !emittedColumnar) {
    const textPrefix = options.useDepthPrefix
      ? `${depth + 1}`
      : options.indent.repeat(depth + 1)
    lines.push(`${textPrefix}| ${node.text}`)
  }

  if (!emittedColumnar) {
    for (const child of node.children) {
      if (emittedInlineFromChild && child.type === 'text') {
        continue
      }
      lines.push(...emitNodeToSlim(child, depth + 1, options, node, effectiveChildDefaults))
    }
  }

  return lines
}

function resolveCompressionMode(options: SlimCompileOptions): SlimCompressionMode {
  if (options.compressionMode) {
    return options.compressionMode
  }

  return options.compact ? 'aggressive' : 'none'
}

function resolveSlimCompileOptions(options: SlimCompileOptions): ResolvedSlimCompileOptions {
  const compressionMode = resolveCompressionMode(options)

  return {
    indent:
      options.indent ??
      (compressionMode === 'minified' ? '' : compressionMode === 'aggressive' ? '\t' : '  '),
    useCompactSyntax: compressionMode !== 'none',
    synthesizeChildDefaults:
      compressionMode === 'aggressive' || compressionMode === 'minified',
    useDepthPrefix: compressionMode === 'minified',
  }
}

export function compileToSlim(
  ast: SlimDocument,
  options: SlimCompileOptions = {},
): string {
  const merged = resolveSlimCompileOptions(options)

  return ast.children
    .flatMap((node) => emitNodeToSlim(node, 0, merged))
    .join('\n')
    .trim()
}

function createDomNode(
  node: SlimNode,
  doc: Document,
  parent?: SlimElementNode,
): Node {
  if (node.type === 'text') {
    return doc.createTextNode(node.value)
  }

  const element = doc.createElement(node.tag)
  const effective = resolveEffectiveElementContext(node, parent)

  if (effective.id) {
    element.id = effective.id
  }
  if (effective.classes.length > 0) {
    element.className = effective.classes.join(' ')
  }

  for (const [name, value] of Object.entries(effective.attrs)) {
    if (!isLikelyAttributeName(name)) {
      continue
    }

    if (typeof value === 'boolean') {
      if (value) {
        element.setAttribute(name, '')
      }
    } else {
      element.setAttribute(name, value)
    }
  }

  if (node.text) {
    element.append(doc.createTextNode(node.text))
  }

  for (const child of node.children) {
    element.append(createDomNode(child, doc, node))
  }

  return element
}

export function compileToDom(ast: SlimDocument, doc: Document): DocumentFragment {
  const fragment = doc.createDocumentFragment()
  for (const node of ast.children) {
    fragment.append(createDomNode(node, doc))
  }
  return fragment
}

function htmlNodeToSlimNode(node: Node, lineSeed: { value: number }): SlimNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.nodeValue ?? ''
    if (value.trim().length === 0) {
      return null
    }
    const line = lineSeed.value
    lineSeed.value += 1
    return {
      type: 'text',
      value,
      line,
    }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement
  const line = lineSeed.value
  lineSeed.value += 1

  const out: SlimElementNode = {
    type: 'element',
    tag: element.tagName.toLowerCase(),
    classes: [],
    attrs: {},
    children: [],
    line,
  }

  if (element.id) {
    out.id = element.id
  }

  if (element.classList.length > 0) {
    out.classes = Array.from(element.classList)
  }

  for (const attr of Array.from(element.attributes)) {
    if (attr.name === 'id' || attr.name === 'class') {
      continue
    }

    if (BOOLEAN_ATTRIBUTES.has(attr.name) && attr.value === '') {
      out.attrs[attr.name] = true
    } else {
      out.attrs[attr.name] = attr.value
    }
  }

  const childCandidates: SlimNode[] = []
  for (const child of Array.from(element.childNodes)) {
    const slimChild = htmlNodeToSlimNode(child, lineSeed)
    if (slimChild) {
      childCandidates.push(slimChild)
    }
  }

  if (childCandidates.length === 1 && childCandidates[0].type === 'text') {
    out.text = childCandidates[0].value
  } else {
    out.children = childCandidates
  }

  return out
}

export function parseHtmlToAst(html: string): HtmlParseResult {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        ok: false,
        error: parserError.textContent?.trim() || 'Invalid HTML source.',
      }
    }

    const lineSeed = { value: 1 }
    const children: SlimNode[] = []

    for (const child of Array.from(doc.body.childNodes)) {
      const converted = htmlNodeToSlimNode(child, lineSeed)
      if (converted) {
        children.push(converted)
      }
    }

    return {
      ok: true,
      ast: {
        type: 'document',
        children,
      },
      warnings: [],
    }
  } catch {
    return {
      ok: false,
      error: 'Unable to parse HTML in this environment.',
    }
  }
}

export function convertHtmlToSlim(
  html: string,
  options: SlimCompileOptions = { compressionMode: 'aggressive' },
):
  | { ok: true; slim: string; ast: SlimDocument; warnings: string[] }
  | { ok: false; error: string } {
  const parsed = parseHtmlToAst(html)
  if (!parsed.ok) {
    return parsed as { ok: false; error: string }
  }

  return {
    ok: true,
    slim: compileToSlim(parsed.ast, options),
    ast: parsed.ast,
    warnings: parsed.warnings,
  }
}

export function compressSlimLossless(
  source: string,
  options: SlimCompileOptions = {},
):
  | { ok: true; slim: string; ast: SlimDocument; warnings: string[] }
  | { ok: false; errors: SlimParseError[] } {
  const parsed = parseSlimML(source)
  if (!parsed.ok) {
    return parsed as { ok: false; errors: SlimParseError[] }
  }

  const compileOptions: SlimCompileOptions =
    options.compressionMode || options.compact !== undefined
      ? options
      : {
          ...options,
          compressionMode: 'aggressive',
        }

  return {
    ok: true,
    slim: compileToSlim(parsed.ast, compileOptions),
    ast: parsed.ast,
    warnings: parsed.warnings,
  }
}

export function estimateTokenCount(value: string): number {
  if (value.length === 0) {
    return 0
  }
  return Math.ceil(value.length / 4)
}

export interface TokenComparison {
  slimChars: number
  htmlChars: number
  slimTokens: number
  htmlTokens: number
  charSavingsPct: number
  tokenSavingsPct: number
}

function computeSavingsPct(from: number, to: number): number {
  if (from <= 0) {
    return 0
  }
  return ((from - to) / from) * 100
}

export function compareTokenUsage(slim: string, html: string): TokenComparison {
  const slimChars = slim.length
  const htmlChars = html.length
  const slimTokens = estimateTokenCount(slim)
  const htmlTokens = estimateTokenCount(html)

  return {
    slimChars,
    htmlChars,
    slimTokens,
    htmlTokens,
    charSavingsPct: computeSavingsPct(htmlChars, slimChars),
    tokenSavingsPct: computeSavingsPct(htmlTokens, slimTokens),
  }
}

export function formatParseError(error: SlimParseError | SlimParseError[]): string {
  const errArray = Array.isArray(error) ? error : [error]
  if (errArray.length === 0) return 'Unknown error.'
  if (errArray.length === 1) {
    const err = errArray[0]
    return `Line ${err.line}, column ${err.column}: ${err.message}`
  }
  return errArray
    .map((err) => `• Line ${err.line}, col ${err.column}: ${err.message}`)
    .join('\n')
}
