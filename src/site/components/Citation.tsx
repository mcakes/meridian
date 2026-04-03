interface CitationProps { id: number; authors: string; title: string; source?: string; url?: string; }

export function Citation({ id, authors, title, source, url }: CitationProps) {
  return (
    <div id={`ref-${id}`} style={{ borderLeft: '2px solid var(--border-default)', paddingLeft: 12, margin: '8px 0', fontSize: 12, lineHeight: 1.6 }}>
      <strong style={{ color: 'var(--text-secondary)' }}>[{id}]</strong>{' '}
      <span style={{ color: 'var(--text-muted)' }}>
        {authors}. &ldquo;{title}.&rdquo;{source && <> {source}.</>}
        {url && <> <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)' }}>Link</a></>}
      </span>
    </div>
  );
}
