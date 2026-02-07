interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'table' | 'list' | 'tip'
  text?: string
  html?: string
  src?: string
  caption?: string
  items?: string[]
  rows?: string[][]
}

interface ContentRendererProps {
  blocks: ContentBlock[]
}

export default function ContentRenderer({ blocks }: ContentRendererProps) {
  return (
    <div className="prose prose-gray max-w-none">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="mb-4 leading-relaxed">
                {block.html ? (
                  <span dangerouslySetInnerHTML={{ __html: block.html }} />
                ) : (
                  block.text
                )}
              </p>
            )

          case 'image':
            if (!block.src) {
              // PDF figure placeholder
              if (block.caption) {
                return (
                  <p key={i} className="text-sm text-gray-500 italic my-4">
                    {block.caption}
                  </p>
                )
              }
              return null
            }
            return (
              <figure key={i} className="my-6">
                <img
                  src={block.src}
                  alt={block.caption || ''}
                  className="rounded-lg border border-gray-200 max-w-full h-auto"
                  loading="lazy"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-sm text-gray-500 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case 'table':
            if (!block.rows || block.rows.length === 0) return null
            return (
              <div key={i} className="my-6 overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'bg-gray-50 font-medium' : 'border-t border-gray-200'}>
                        {row.map((cell, ci) => {
                          const Tag = ri === 0 ? 'th' : 'td'
                          return (
                            <Tag key={ci} className="px-3 py-2 text-left">
                              {cell}
                            </Tag>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'list':
            if (!block.items || block.items.length === 0) return null
            return (
              <ul key={i} className="my-4 space-y-1 list-disc pl-6">
                {block.items.map((item, li) => (
                  <li key={li} className="text-gray-700">{item}</li>
                ))}
              </ul>
            )

          case 'tip':
            return (
              <div key={i} className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-blue-800">{block.text}</p>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
