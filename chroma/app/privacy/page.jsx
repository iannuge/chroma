import Link from 'next/link'

export const metadata = { title: 'privacy policy | chroma' }

const SECTIONS = [
  {
    h: 'the short version',
    p: [
      'chroma collects only what it needs to run the moodboard and take pre-orders. we do not sell your personal information, and we do not run ads.',
    ],
  },
  {
    h: 'what we collect',
    p: [
      'account: when you sign in with google, we receive your name, email address and profile picture from google. your name shows publicly next to clusters and images you submit.',
      'what you add: images you upload, clusters you start, and your votes. uploads and cluster names are public. your individual votes are not shown to other users.',
      'orders: payments and shipping details are collected by shopify at checkout, not by this site. we receive order information from shopify (such as your email, size and order status) so we can match your order to your account and give pre-orderers their vote weight.',
      'technical data: our hosting provider records standard server logs such as ip address, browser type and pages requested. your browser stores a sign-in session so you stay logged in.',
    ],
  },
  {
    h: 'how we use it',
    p: [
      'to run your account, show the moodboard, count votes, fulfill and support orders, prevent abuse and manipulated voting, keep the site secure, and communicate with you about your order. we do not use your information for advertising.',
    ],
  },
  {
    h: 'who we share it with',
    p: [
      'we use a few services to run the site, and they process data on our behalf: supabase (database, sign-in and image storage), vercel (hosting), google (sign-in) and shopify (checkout and payments). each has its own privacy policy. we may also disclose information if the law requires it, or to protect the site and its users.',
    ],
  },
  {
    h: 'cookies',
    p: [
      'the site uses the cookies and browser storage needed to keep you signed in. we do not use advertising or cross-site tracking cookies.',
    ],
  },
  {
    h: 'how long we keep it',
    p: [
      'we keep your account and submissions while your account is active. order records are kept as long as needed for fulfillment, refunds and taxes. you can ask us to delete your account and the content you uploaded at any time. deleting a pre-order\'s account does not by itself cancel or refund it, so cancel first.',
    ],
  },
  {
    h: 'your choices',
    p: [
      'you can ask to see, correct or delete the personal information we hold about you. depending on where you live, you may have additional rights under local law. to make a request, reach out through threeletters.net and we will respond as soon as we can.',
    ],
  },
  {
    h: 'children',
    p: [
      'the site is not meant for children under 13, and we do not knowingly collect information from them. if you think a child has given us information, contact us and we will delete it.',
    ],
  },
  {
    h: 'security',
    p: [
      'we use reputable providers and take reasonable steps to protect your data, but no online service is perfectly secure. payment card details are handled by shopify and never reach this site.',
    ],
  },
  {
    h: 'changes and contact',
    p: [
      'we may update this policy as the project changes. the date below shows the latest version. questions or requests: reach out through threeletters.net.',
    ],
  },
]

export default function Privacy() {
  return (
    <main className="w page po">
      <Link className="bk g" href="/">
        Back home
      </Link>
      <div className="cvh">
        <h1>Privacy policy</h1>
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
          <Link href="/terms">terms of service</Link>
        </p>
      </div>
    </main>
  )
}
