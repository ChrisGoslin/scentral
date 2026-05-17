// app/disclaimer/page.tsx

export default function DisclaimerPage() {
  const sections = [
    {
      heading: 'Fragrance Suggestions',
      body: 'Application zones, spritz counts, layering combinations, and anosmia risk ratings are based on general fragrance community knowledge and hobbyist research. They are not clinical recommendations. Individual skin chemistry, sensitivity, and health conditions vary — what works for one person may not suit another.',
    },
    {
      heading: 'Anosmia Risk Ratings',
      body: 'The ARR system indicates community-reported likelihood of olfactory fatigue from overuse. It is not a medical assessment and does not account for individual health conditions or neurological factors.',
    },
    {
      heading: 'Layering Protocols',
      body: 'Aroma chemical references are for educational context only. They are not instructions to apply raw chemicals to skin. Always use commercially formulated fragrances as directed by their manufacturers.',
    },
    {
      heading: 'Patch Testing',
      body: 'Always patch test a new fragrance before full application. Apply a small amount to the inside of your wrist and wait 24 hours. Discontinue use if irritation occurs.',
    },
    {
      heading: 'Allergies and Skin Conditions',
      body: 'If you have known fragrance allergies, sensitive skin, eczema, psoriasis, or any respiratory condition, consult a dermatologist before following any application guidance in this app.',
    },
    {
      heading: 'No Liability',
      body: 'Scentral and its creator accept no liability for adverse reactions, skin irritation, or any harm arising from fragrance application based on suggestions in this tool. Use at your own discretion.',
    },
    {
      heading: 'About Scentral',
      body: 'Scentral is an independent hobby project. It is not affiliated with, endorsed by, or connected to any fragrance brand or retailer mentioned within the app.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Disclaimer &amp; Terms of Use</h1>
        <p className="text-slate-400 text-base mb-10">
          Scentral is a personal fragrance organisation tool — not a medical or clinical service.
        </p>

        <div className="space-y-8">
          {sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="text-lg font-semibold text-white mb-2">{heading}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
