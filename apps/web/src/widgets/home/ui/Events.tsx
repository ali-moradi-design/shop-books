const events = [
  {
    when: 'Oct 24 · 7 pm',
    title: 'An evening with Orwell: a reading group',
    text: 'We read the first chapters of 1984 aloud and talk. Tea provided.',
  },
  { when: 'Oct 29 · 6 pm', title: 'Poetry open shelf', text: 'Bring a poem, or just a seat.' },
  {
    when: 'Nov 2 · 11 am',
    title: "Children's story hour",
    text: 'Picture books, puppets and biscuits.',
  },
];

export function Events() {
  return (
    <section id="events" aria-labelledby="events-title" className="pt-16">
      <h2 id="events-title" className="font-serif text-4xl font-medium text-forest-900">
        This month at the shop
      </h2>
      <ul className="mt-6 grid gap-8 md:grid-cols-3">
        {events.map((e) => (
          <li key={e.title} className="border-t-[5px] border-forest-900 bg-white p-6">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-mint-500">
              {e.when}
            </p>
            <h3 className="my-2 font-serif text-2xl leading-tight">{e.title}</h3>
            <p className="font-serif text-[15px] leading-snug text-ink-muted">{e.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
