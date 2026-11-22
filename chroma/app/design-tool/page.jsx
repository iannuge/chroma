export const metadata = { title: 'design tool | chroma' }

// The node editor is a self-contained page in /public/tools, shown here in a frame
// so its own styles and canvas don't clash with the site's.
export default function DesignToolPage() {
  return (
    <main className="dtool">
      <iframe src="/tools/design-tool.html" title="chroma design tool" className="dtframe" allow="clipboard-write" />
    </main>
  )
}
