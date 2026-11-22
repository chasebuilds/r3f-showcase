export function PageHead({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </header>
  )
}

export function UseIt({ title = 'Use it in your site', code }: { title?: string; code: string }) {
  return (
    <details className="panel use-it">
      <summary>{title}</summary>
      <pre>
        <code>{code}</code>
      </pre>
    </details>
  )
}
