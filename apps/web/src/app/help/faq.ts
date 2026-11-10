export interface FaqItem {
  /** Anchor for links such as /help#returns */
  id: string;
  q: string;
  a: string[];
}

export interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ: FaqSection[] = [
  {
    id: 'orders',
    title: 'Orders & payment',
    items: [
      {
        id: 'demo',
        q: 'Can I really order?',
        a: [
          'No. This is a demo shop: checkout runs Stripe Checkout in test mode (or a simulator of it), no money moves, and the data is reset every night.',
          'To try it, pay with the test card 4242 4242 4242 4242, any future expiry and any CVC. 4000 0000 0000 0002 shows a declined card.',
        ],
      },
      {
        id: 'guest',
        q: 'Do I need an account?',
        a: [
          'No. On the sign-in page choose “Continue as guest”. We email you a link to set a password later, so you can follow your order.',
        ],
      },
      {
        id: 'payment',
        q: 'Which payment methods do you take?',
        a: [
          'Payment goes through Stripe: all major cards, and Apple Pay or Google Pay where your device offers them. We never see your card number.',
        ],
      },
      {
        id: 'discount',
        q: 'Where do I enter a discount code?',
        a: ['On the checkout page, under the address. Try WELCOME10 for 10% off.'],
      },
      {
        id: 'cancel',
        q: 'Can I cancel my order?',
        a: [
          'Yes, until it ships. Open the order under “My orders” and choose “Cancel order”; a paid order is refunded at once.',
        ],
      },
    ],
  },
  {
    id: 'shipping-section',
    title: 'Shipping',
    items: [
      {
        id: 'shipping',
        q: 'How much is shipping?',
        a: [
          'Shipping is free on orders over $40. Orders leave within 1–2 business days and usually arrive 2–5 days later.',
        ],
      },
      {
        id: 'tracking',
        q: 'How do I track my order?',
        a: [
          'When your order ships we email you the carrier and tracking number. The same link is on the order page.',
        ],
      },
      {
        id: 'international',
        q: 'Do you ship abroad?',
        a: ['Yes, to most countries. Any import duties are shown before you pay.'],
      },
    ],
  },
  {
    id: 'returns-section',
    title: 'Returns',
    items: [
      {
        id: 'returns',
        q: 'What is your return policy?',
        a: [
          'Return any book in the condition you received it within 30 days of shipping for a full refund. Returns are free.',
        ],
      },
      {
        id: 'how-to-return',
        q: 'How do I return a book?',
        a: [
          'Open the order under “My orders” and choose “Return a book”. We email you once the request is approved, again when the parcel arrives, and when the refund is on its way.',
        ],
      },
      {
        id: 'damaged',
        q: 'My book arrived damaged.',
        a: [
          'We are sorry. Start a return with the reason “Arrived damaged” and we will refund you or send a fresh copy.',
        ],
      },
    ],
  },
  {
    id: 'books',
    title: 'Books & reading',
    items: [
      {
        id: 'look-inside',
        q: 'Can I read a sample?',
        a: [
          'Many books have “Look inside” on their page: the first pages, so you can try the writing before you buy.',
        ],
      },
      {
        id: 'sold-out',
        q: 'A book is sold out. Will it come back?',
        a: [
          'Usually, within a few weeks. Leave your email under “Email me when it is back” on the book page and we will write the moment it is in stock.',
        ],
      },
      {
        id: 'reading-list',
        q: 'What is the reading list?',
        a: [
          'Your personal list of books to read next. Sign in and press the heart on any book to save it.',
        ],
      },
      {
        id: 'series',
        q: 'How do I find the next book in a series?',
        a: [
          'Book pages show the series and number. Search the series name to see every volume in order.',
        ],
      },
    ],
  },
  {
    id: 'account-section',
    title: 'Your account',
    items: [
      {
        id: 'password',
        q: 'I forgot my password.',
        a: [
          'Choose “Forgot your password?” on the sign-in page. We email you a link that works for one hour.',
        ],
      },
      {
        id: 'addresses',
        q: 'Can I save my address?',
        a: [
          'Yes. Tick “Save this address” at checkout, or add addresses under Account. Your default address fills in the checkout form.',
        ],
      },
      {
        id: 'newsletter',
        q: 'How do I stop the newsletter?',
        a: ['Every newsletter email has an unsubscribe link at the bottom.'],
      },
    ],
  },
];
