export default function TeeMock({ art, label, blur }) {
  return (
    <div className="tm">
      <img src="/tee.webp" alt="" />
      <div className="ta" style={{ background: art }}>
        {label || ''}
      </div>
      {blur && <div className="tb" />}
    </div>
  )
}
