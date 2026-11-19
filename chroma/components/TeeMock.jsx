export default function TeeMock({ art, label }) {
  return (
    <div className="tm">
      <img src="/tee.webp" alt="" />
      <div className="ta" style={{ background: art }}>
        {label || ''}
      </div>
    </div>
  )
}
