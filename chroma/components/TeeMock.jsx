export default function TeeMock({ art, label, sub, blur }) {
  return (
    <div className="tm">
      <img src="/tee.webp" alt="" />
      {art && (
        <div className="ta" style={{ background: art }}>
          {label || ''}
        </div>
      )}
      {blur && (
        <div className="tb">
          <span>{label || ''}</span>
          {sub ? <small>{sub}</small> : null}
        </div>
      )}
    </div>
  )
}
