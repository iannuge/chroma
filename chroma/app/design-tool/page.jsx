export const metadata = { title: 'super secret design tool | chroma' }

// The node editor is a self-contained page in /public/tools, shown here in a frame
// so its own styles and canvas don't clash with the site's.
export default function DesignToolPage() {
  return (
    <main className="w page dtool">
      <div className="cvh">
        <h1>super secret design tool</h1>
      </div>
      <p className="mu lede dtl">
        ive always liked node based workflows, and i wanted a tool that combined features from blender, photoshop,
        and after effects. im trying to make one, play around with it <a href="#tool">here</a>
      </p>
      <iframe id="tool" src="/tools/design-tool.html" title="chroma design tool" className="dtframe" />
    </main>
  )
}
