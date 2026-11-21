import Link from 'next/link'

export const metadata = { title: 'terms of service | chroma' }

const SECTIONS = [
  {
    h: 'the short version',
    p: [
      'chroma is a small, independent project run by ian, a freelance artist. you submit images, vote, and can pre-order shirts. by using the site you agree to these terms. if you do not agree, please do not use it.',
    ],
  },
  {
    h: 'accounts',
    p: [
      'you sign in with google. you are responsible for activity on your account. you must be 13 or older to use the site, and you must be 18 or older, or have a parent or guardian\'s permission, to place an order.',
      'one account per person. do not use bots, scripts or extra accounts to vote or to manipulate rankings. votes that look manipulated may be removed.',
    ],
  },
  {
    h: 'what you submit',
    p: [
      'you can upload images and start clusters on the moodboard. only upload things you made, or that you have the right to share. do not upload anything illegal, hateful, sexual, or that infringes someone else\'s copyright, trademark or privacy.',
      'you keep ownership of what you upload. by uploading, you give chroma a non-exclusive, worldwide, royalty-free license to display it on the site and to use it as inspiration while designing a shirt. the moodboard is a source of reference and direction. chroma\'s shirt designs are original artwork made by ian, and are not copies of what users upload.',
      'we may remove any submission, cluster or account at any time, for any reason, including to respond to a copyright complaint. we remove accounts that repeatedly upload infringing material (see the copyright page for our designated agent and repeat-infringer policy). if you believe something on the site infringes your copyright, send a notice through our copyright page at /copyright.',
    ],
  },
  {
    h: 'voting and how drops work',
    p: [
      'users vote on clusters and images. when a drop\'s countdown ends, the top-ranked cluster is chosen as the direction for the next shirt. the winning cluster\'s creator receives a free shirt.',
      'votes guide the design, but they are not a guarantee of a particular result. ian designs the final shirt, posts drafts for feedback, and may revise it. chroma may count some votes more heavily than others, for example votes from people who have pre-ordered, and does not disclose how. we may adjust or remove votes to keep voting fair.',
      'once pre-orders for a drop are claimed, buyers vote to approve the final design before it goes to print. drops are limited in number, and dates, quantities and details may change.',
    ],
  },
  {
    h: 'pre-orders, cancellation and refunds',
    p: [
      'a pre-order is a purchase of a shirt that has not been designed or printed yet. payments are handled by shopify. the price is shown before you check out.',
      'you can cancel and receive a full refund at any time until production begins. to cancel, reply to your order confirmation email. cancelling removes your pre-order\'s extra vote weight. once the design is approved and sent to print, orders are final.',
      'if a drop does not reach its pre-order goal, or the final design is not approved, you will be refunded in full.',
      'we ship to addresses in the united states only. shipping cost is shown at checkout. production and shipping dates are estimates, not guarantees. if your shirt arrives damaged or with a printing error, contact us and we will fix it or refund you.',
    ],
  },
  {
    h: 'ai and generated artwork',
    p: [
      'the shirt designs are not made with generative ai. please do not submit ai-generated images to the moodboard. we may remove submissions we believe are ai-generated.',
    ],
  },
  {
    h: 'using the site',
    p: [
      'do not attempt to break, scrape, overload or gain unauthorized access to the site or its data. do not harass other users.',
      'the chroma name, the site design and the shirt designs belong to ian. you may not copy or sell them without permission.',
    ],
  },
  {
    h: 'ending your access',
    p: [
      'you can stop using the site any time and ask us to delete your account. we may suspend or end access for anyone who breaks these terms.',
    ],
  },
  {
    h: 'no warranties and limits on liability',
    p: [
      'the site is provided as is, without promises that it will always be available or error-free. to the fullest extent the law allows, chroma and ian are not liable for indirect or consequential losses, and our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim. nothing here limits rights you have under law that cannot be waived.',
    ],
  },
  {
    h: 'changes and contact',
    p: [
      'we may update these terms as the project grows. the date below shows the latest version. continuing to use the site after a change means you accept it.',
      'questions, copyright complaints or cancellation help: reach out through threeletters.net or instagram @iannuge.',
    ],
  },
]

export default function Terms() {
  return (
    <main className="w page po">
      <Link className="bk g" href="/">
        Back home
      </Link>
      <div className="cvh">
        <h1>Terms of service</h1>
        <p className="mu">last updated november 20, 2026</p>
      </div>
      <div className="pocs">
        {SECTIONS.map((s) => (
          <section className="g poc" key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </section>
        ))}
        <p className="mu pof">
          <a href="https://threeletters.net" target="_blank" rel="noopener noreferrer">
            threeletters.net
          </a>{' '}
          ·{' '}
          <a href="https://instagram.com/iannuge" target="_blank" rel="noopener noreferrer">
            @iannuge
          </a>
        </p>
      </div>
    </main>
  )
}
