export const metadata = { title: 'my node based design tool | chroma' }

// The node editor is a self-contained page in /public/tools, shown here in a frame
// so its own styles and canvas don't clash with the site's.
export default function DesignToolPage() {
  return (
    <main className="w page dtool">
      <div className="cvh">
        <h1>my node based design tool</h1>
      </div>
      <p className="mu lede dtl">
        i love using node based workflows and i wish there was a node tool that was optimized for 2d design! so i
        decided to make it. i had nowhere else to host it so it can live here on the chroma page. still in alpha i
        will be improving it as i go.
      </p>
      <iframe src="/tools/design-tool.html" title="chroma design tool" className="dtframe" />
    </main>
  )
}
