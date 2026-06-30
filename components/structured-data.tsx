const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Alex Lyashok',
  url: 'https://lyashok.com',
  sameAs: ['https://www.linkedin.com/in/lyashok/', 'https://x.com/alyashok'],
  jobTitle: 'Software builder',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Alex Lyashok',
  url: 'https://lyashok.com',
}

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([personSchema, websiteSchema]),
      }}
    />
  )
}
