import { writeFileSync } from 'node:fs';
const out = process.argv[2];
const B = [
  ['1984', 'George Orwell', '9780451524935', '$9.99', 'Dystopia', 4.7],
  ['To Kill a Mockingbird', 'Harper Lee', '9780061120084', '$10.99', 'Classics', 4.8],
  ['Pride and Prejudice', 'Jane Austen', '9780141439518', '$8.50', 'Classics', 4.6],
  ['Dune', 'Frank Herbert', '9780441013593', '$11.99', 'Sci-Fi', 4.6],
  ['One Hundred Years of Solitude', 'Gabriel García Márquez', '9780060883287', '$12.99', 'Fiction', 4.5],
  ['The Alchemist', 'Paulo Coelho', '9780062315007', '$11.50', 'Fiction', 4.2],
  ['Sapiens', 'Yuval Noah Harari', '9780062316110', '$16.99', 'History', 4.5],
  ['Norwegian Wood', 'Haruki Murakami', '9780375704024', '$13.99', 'Fiction', 4.1],
  ['Brave New World', 'Aldous Huxley', '9780060850524', '$10.50', 'Dystopia', 4.4],
  ['Jane Eyre', 'Charlotte Brontë', '9780141441146', '$8.99', 'Classics', 4.5],
  ['The Name of the Rose', 'Umberto Eco', '9780156001311', '$14.99', 'Mystery', 4.3],
  ['Salt Fat Acid Heat', 'Samin Nosrat', '9781476753836', '$22.00', 'Cooking', 4.8],
  ['Frankenstein', 'Mary Shelley', '9780486282114', '$6.00', 'Classics', 4.2],
  ['Crime and Punishment', 'Fyodor Dostoevsky', '9780486415871', '$9.00', 'Classics', 4.6],
];
const img = (b, cls = '', st = '') => `<img class="cv ${cls}" style="${st}" src="../covers/${b[2]}.jpg" alt="${b[0]}">`;
const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
const css = `*{box-sizing:border-box;margin:0}:root{--g:#174236;--g2:#2c6a57;--mint:#9bd0c0;--cream:#f5f1e8;--ink:#1c2b24;--serif:'Caladea','Liberation Serif',serif;--sans:Inter,sans-serif}
body{width:1440px;background:var(--cream);color:var(--ink);font-family:var(--serif)}
.cv{display:block;width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:2px;box-shadow:0 14px 26px -12px rgba(0,0,0,.55),inset 3px 0 0 rgba(0,0,0,.15)}
.top{background:var(--g);color:#fff;display:flex;align-items:center;gap:28px;padding:12px 96px}.logo{font:500 24px var(--serif)}
.sf{flex:1;display:flex;background:#fff;color:#777;border-radius:2px;font:15px var(--serif);max-width:640px}.sf span{padding:12px 14px;border-right:1px solid #ddd;color:#333}.sf em{font-style:normal;padding:12px 14px;flex:1}.sf b{background:var(--mint);color:var(--g);padding:12px 16px;font-weight:600}
.top a{font:15px var(--serif);border:1px solid #6fa593;padding:7px 14px}
.menu{display:flex;gap:30px;padding:0 96px;background:#fff;font:16px var(--serif);height:46px;align-items:center;border-bottom:1px solid #ddd}.menu .on{background:var(--mint);height:100%;display:flex;align-items:center;padding:0 18px;margin-left:-18px}
.btn{display:inline-block;background:var(--g);color:#fff;padding:13px 28px;font:600 16px var(--serif);border-radius:2px}.btn.o{background:none;color:var(--g);border:1.5px solid var(--g)}
h2.s{font:500 34px var(--serif);color:var(--g);padding:64px 96px 22px;display:flex;justify-content:space-between;align-items:baseline}h2.s a{font:16px var(--serif);text-decoration:underline}
.price{font:700 18px var(--sans);color:var(--g)}.badge{display:inline-block;background:#e3f2ec;color:#1b6b4f;font:600 12px var(--sans);padding:4px 10px;border-radius:99px}
.star{color:#c98a1b;letter-spacing:2px;font-size:14px}
footer{margin-top:80px;background:var(--g);color:#cfe6dd;padding:44px 96px;display:flex;justify-content:space-between;font:15px var(--serif)}
`;
const header = (on) => `<div class=top><div class=logo>Bay Book Company</div><div class=sf><span>Keyword ⌄</span><em>Search by title, author, genre, or ISBN</em><b>Search</b></div><a>♡ Reading list</a><a>Login</a><a>Cart (2)</a></div>
<div class=menu>${['Home', 'Browse ⌄', 'Series', 'Staff Picks', 'Events', 'Gift Cards', 'About'].map((m) => `<span class="${m === on ? 'on' : ''}">${m}</span>`).join('')}</div>`;
const foot = `<footer><span>© Bay Book Company — demo shop, fake payments</span><span>EN · DE · ES · فارسی · العربية</span></footer>`;
const page = (t, extra, body) => `<!doctype html><meta charset=utf-8><title>${t}</title><style>${css}${extra}</style><body>${body}</body>`;

// 1 HOME
const wood = 'repeating-linear-gradient(90deg,#8a5a2b 0 110px,#7a4d22 110px 114px)';
const home = page('Home', `
.hero{height:600px;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.5)),${wood};position:relative;display:flex;align-items:center;padding:0 96px;gap:60px;overflow:hidden}
.box{flex:none;background:#fff;padding:40px 44px;width:560px;box-shadow:0 24px 50px -20px rgba(0,0,0,.6);position:relative;z-index:2}
.box h1{font:500 46px/1.08 var(--serif);color:var(--g)}.box p{font:18px/1.6 var(--serif);margin:14px 0 24px}
.shelf{flex:1;min-width:0;display:flex;align-items:flex-end;gap:12px;border-bottom:18px solid #4b2e14;padding-bottom:0;height:420px;margin-top:70px}.shelf .cv{width:118px;flex:none}.shelf .cv:nth-child(2n){width:130px}.shelf .cv:nth-child(3n){width:112px}
.row{display:grid;grid-template-columns:repeat(5,1fr);gap:30px;padding:0 96px}
.card h3{font:600 18px var(--serif);margin:14px 0 2px}.card p{font:15px var(--serif);color:#555;margin-bottom:6px}.card q{display:block;font:italic 14px/1.4 var(--serif);color:var(--g);border-left:3px solid var(--mint);padding-left:10px;margin-top:8px;quotes:none}
.promo{margin:70px 96px 0;display:grid;grid-template-columns:1.2fr 1fr;background:var(--g);color:#fff;border-radius:6px;overflow:hidden;position:relative;height:230px}
.promo div{padding:44px}.promo h3{font:500 36px var(--serif)}.promo p{opacity:.8;margin:10px 0 20px}.promo .btn{background:#ffc94d;color:var(--g)}
.st{position:relative}.st i{position:absolute;bottom:0;width:16.6%;display:block}.seal{z-index:3;position:absolute;right:70px;top:28px;width:100px;height:100px;border-radius:50%;background:#ffb000;color:var(--g);display:grid;place-items:center;text-align:center;font:800 22px/1 var(--sans);transform:rotate(10deg);box-shadow:0 0 0 7px #ffc94d}
.ev{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;padding:0 96px}.ev div{background:#fff;border-top:5px solid var(--g);padding:26px}.ev b{font:600 12px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#3f8a73}.ev h4{font:500 24px var(--serif);margin:10px 0}.ev p{font:15px/1.5 var(--serif);color:#555}
.gen{display:flex;gap:12px;padding:0 96px;flex-wrap:wrap}.gen span{background:#fff;border:1px solid #d6e5de;padding:10px 20px;border-radius:10px;font:500 15px var(--sans);color:var(--g)}
`, `${header('Home')}
<section class=hero><div class=box><h1>A bookshop for people who still browse.</h1><p>Thousands of titles, picked by readers. Look inside any book before it goes in your bag.</p><span class=btn>Browse the shelves</span> &nbsp; <span class="btn o">Today's picks</span></div>
<div class=shelf>${[0, 3, 1, 4, 2].map((i) => img(B[i])).join('')}</div></section>
<h2 class=s>Staff picks <a>See all</a></h2><div class=row>${[1, 4, 6, 9, 11].map((i, k) => `<div class=card>${img(B[i])}<h3>${B[i][0]}</h3><p>${B[i][1]}</p><span class=price>${B[i][3]}</span><q>“${['Still the kindest book I know.', 'Magic in every paragraph.', 'Rewires how you see history.', 'Wild, bleak, brilliant.', 'Changed how I cook.'][k]}” — Dana</q></div>`).join('')}</div>
<div class=promo><div><h3>Autumn classics: up to 30% off</h3><p>Penguin and Dover editions, this month only. Use code <b>LEAF30</b> at checkout.</p><span class=btn>Shop the sale</span></div><div class=st><div class=seal>30%<br>off</div>${['#fde7d3', '#ffb000', '#ff7a1a', '#e4322b', '#b01f64', '#6b1450'].map((c, i) => `<i style="background:${c};height:${(i + 1) * 28}px;left:${i * 16.6}%"></i>`).join('')}</div></div>
<h2 class=s>This month at the shop</h2><div class=ev><div><b>Oct 24 · 7 pm</b><h4>An evening with Orwell: a reading group</h4><p>We read the first chapters of 1984 aloud and talk. Tea provided.</p></div><div><b>Oct 29 · 6 pm</b><h4>Poetry open shelf</h4><p>Bring a poem, or just a seat.</p></div><div><b>Nov 2 · 11 am</b><h4>Children's story hour</h4><p>Picture books, puppets and biscuits.</p></div></div>
<h2 class=s>Shop by genre</h2><div class=gen>${['Fiction', 'Classics', 'Sci-Fi', 'Dystopia', 'Mystery', 'History', 'Cooking', 'Poetry', 'Children'].map((g) => `<span>${g}</span>`).join('')}</div>${foot}`);

// 2 LISTING
const listing = page('Listing', `
.crumb{padding:22px 96px 0;font:14px var(--sans);color:#666}.crumb b{color:var(--g)}
.hd{display:flex;justify-content:space-between;align-items:flex-end;padding:10px 96px 24px}.hd h1{font:500 42px var(--serif);color:var(--g)}.hd p{font:14px var(--sans);color:#666;margin-top:6px}
.sort{display:flex;gap:12px;font:14px var(--sans)}.sort span{background:#fff;border:1px solid #d6e5de;border-radius:10px;padding:10px 16px}
.lay{display:grid;grid-template-columns:290px 1fr;gap:48px;padding:0 96px}
aside .blk{margin-bottom:30px}aside h4{font:600 13px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#3f8a73;margin-bottom:12px}
.f{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:12px;font:16px var(--sans);margin-bottom:3px;color:var(--g)}.f.on{background:#fff;font-weight:600}.f i{width:28px;height:28px;border-radius:8px;background:#e1ede8;display:grid;place-items:center;font-style:normal;font-size:12px}.f em{margin-left:auto;font-style:normal;font-size:13px;color:#888}
.rng{height:6px;background:#d6e5de;border-radius:9px;position:relative;margin:18px 6px 8px}.rng:before{content:'';position:absolute;left:12%;right:30%;top:0;bottom:0;background:var(--g);border-radius:9px}.rl{display:flex;justify-content:space-between;font:14px var(--sans);color:#555}
.chk{font:15px var(--sans);padding:5px 0;display:flex;gap:10px}.chk u{width:16px;height:16px;border:1.5px solid var(--g);border-radius:4px;text-decoration:none;display:grid;place-items:center;font-size:11px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:34px 28px}.card h3{font:600 17px/1.2 var(--serif);margin:12px 0 2px}.card p{font:14px var(--serif);color:#555;margin-bottom:6px}.card .pr{display:flex;justify-content:space-between;align-items:center;margin-top:8px}.card .add{font:600 13px var(--sans);background:var(--g);color:#fff;padding:7px 12px;border-radius:8px}
.ribbon{position:absolute;top:10px;left:-4px;background:#e4322b;color:#fff;font:700 11px var(--sans);padding:4px 10px}.card .w{position:relative}.heart{position:absolute;right:8px;top:8px;width:30px;height:30px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.pg{display:flex;justify-content:center;gap:8px;padding:50px 0 0;font:15px var(--sans)}.pg span{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:#fff;border:1px solid #d6e5de}.pg .on{background:var(--g);color:#fff}
`, `${header('Browse ⌄')}
<div class=crumb>Home › <b>Classics</b></div><div class=hd><div><h1>Classics</h1><p>128 books · sorted by popularity</p></div><div class=sort><span>Sort: Popular ⌄</span><span>Grid</span><span>List</span></div></div>
<div class=lay><aside><div class=blk><h4>Genre</h4>${[['All books', 480, 1], ['Classics', 128], ['Fiction', 96], ['Sci-Fi', 64], ['Dystopia', 31], ['Mystery', 44], ['History', 52], ['Cooking', 27]].map((g) => `<div class="f ${g[2] ? '' : ''}${g[0] === 'Classics' ? 'on' : ''}"><i>◆</i>${g[0]}<em>${g[1]}</em></div>`).join('')}</div>
<div class=blk><h4>Price</h4><div class=rng></div><div class=rl><span>$5</span><span>$25</span></div></div>
<div class=blk><h4>Author</h4>${['George Orwell', 'Jane Austen', 'Fyodor Dostoevsky', 'Mary Shelley'].map((a, i) => `<div class=chk><u>${i < 1 ? '✓' : ''}</u>${a}</div>`).join('')}</div>
<div class=blk><h4>Format</h4>${['Paperback', 'Hardcover', 'E-book'].map((a, i) => `<div class=chk><u>${i < 1 ? '✓' : ''}</u>${a}</div>`).join('')}</div>
<div class=blk><h4>Availability</h4><div class=chk><u>✓</u>In stock only</div><div class=chk><u></u>Has a free sample</div></div></aside>
<div><div class=grid>${[0, 1, 2, 9, 12, 13, 8, 4].map((i) => `<div class=card><div class=w>${img(B[i])}${i % 3 == 0 ? '<span class=ribbon>-30%</span>' : ''}<span class=heart>♡</span></div><h3>${B[i][0]}</h3><p>${B[i][1]}</p><span class=star>${stars(B[i][5])}</span><div class=pr><span class=price>${B[i][3]}</span><span class=add>Add to cart</span></div></div>`).join('')}</div>
<div class=pg><span>‹</span><span class=on>1</span><span>2</span><span>3</span><span>…</span><span>11</span><span>›</span></div></div></div>${foot}`);

// 3 PRODUCT
const p = B[2];
const product = page('Product', `
.crumb{padding:22px 96px 0;font:14px var(--sans);color:#666}.crumb b{color:var(--g)}
.top2{display:grid;grid-template-columns:420px 1fr 340px;gap:56px;padding:26px 96px 0}
.cover{position:relative}.cover .cv{box-shadow:0 30px 50px -20px rgba(0,0,0,.6),inset 4px 0 0 rgba(0,0,0,.15)}.thumbs{display:flex;gap:10px;margin-top:16px}.thumbs .cv{width:70px}
.info h1{font:500 46px/1.05 var(--serif);color:var(--g)}.info .by{font:19px var(--serif);margin:10px 0 14px}.info .by u{color:#2c6a57}
.meta span{white-space:nowrap}.meta{display:flex;gap:14px;align-items:center;font:14px var(--sans);color:#555;margin-bottom:18px}
.info p.d{font:19px/1.65 var(--serif);max-width:560px}
.tbl{margin-top:26px;display:grid;grid-template-columns:140px 1fr;gap:9px 12px;font:15px var(--sans);max-width:560px}.tbl b{color:#3f8a73;font-weight:600}
.buy{background:#fff;border:1px solid #d6e5de;border-radius:10px;padding:28px;align-self:start;position:sticky;top:20px}
.buy .pr{font:700 36px var(--sans);color:var(--g)}.buy .old{font:15px var(--sans);color:#999;text-decoration:line-through;margin-left:8px}
.opts{display:flex;gap:8px;margin:16px 0}.opts span{flex:1;text-align:center;border:1.5px solid #cfe0d8;border-radius:8px;padding:10px;font:600 14px var(--sans)}.opts .on{border-color:var(--g);background:#eef6f2;color:var(--g)}
.live{margin:6px 0 16px;font:14px var(--sans);color:#1b6b4f;display:flex;align-items:center;gap:8px}.live i{width:9px;height:9px;border-radius:50%;background:#2fb67e;box-shadow:0 0 0 4px #d3f0e3}
.qty{display:flex;gap:10px;margin-bottom:12px}.qty div{border:1.5px solid #cfe0d8;border-radius:8px;padding:12px 18px;font:600 16px var(--sans)}.buy .btn{flex:1;text-align:center;border-radius:8px;white-space:nowrap;padding:13px 10px}
.buy .btn.o{display:block;text-align:center;margin-top:10px;border-radius:8px}.ship{font:13px/1.6 var(--sans);color:#666;margin-top:16px;border-top:1px solid #e6eee9;padding-top:14px}
.inside{margin:70px 96px 0;background:radial-gradient(circle at 70% 40%,#2c3f36,#14231d 65%);border-radius:10px;padding:56px;display:grid;grid-template-columns:1fr 1.3fr;gap:56px;align-items:center;color:#eadfca}
.inside h3{font:500 38px/1.1 var(--serif)}.inside h3 em{color:#d9a85b}.inside p{font:17px/1.6 var(--serif);opacity:.85;margin:14px 0 22px}.inside .btn{background:#d9a85b;color:#14231d}
.open{display:grid;grid-template-columns:1fr 1fr;box-shadow:0 36px 70px -20px #000;transform:perspective(1400px) rotateY(-6deg)}.open>div{background:#efe4cc;color:#2a1d10;height:360px;padding:30px 28px;font:15px/1.75 var(--serif)}.open>div:first-child{border-right:2px solid #c9b88f;background:linear-gradient(90deg,#efe4cc,#e0d2b0)}
.open h5{font:700 11px var(--sans);letter-spacing:.2em;text-transform:uppercase;color:#8a4b1f;margin-bottom:12px}.dc::first-letter{font:700 52px/.8 var(--serif);float:left;padding:6px 8px 0 0;color:#8a4b1f}
.rev{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:0 96px}.rev div{background:#fff;padding:24px;border-left:4px solid var(--mint)}.rev b{font:600 15px var(--sans)}.rev p{font:16px/1.55 var(--serif);margin-top:8px;color:#444}
.row{display:grid;grid-template-columns:repeat(6,1fr);gap:26px;padding:0 96px}.row h3{font:600 15px/1.2 var(--serif);margin:10px 0 2px}.row p{font:13px var(--sans);color:#666}
`, `${header('Browse ⌄')}
<div class=crumb>Home › Classics › <b>Pride and Prejudice</b></div>
<section class=top2><div class=cover>${img(p)}<div class=thumbs>${[p, B[9], B[1], B[12]].map((b) => img(b)).join('')}</div></div>
<div class=info><span class=badge>Classics · Romance</span><h1 style="margin-top:12px">Pride and Prejudice</h1><div class=by>by <u>Jane Austen</u> · Penguin Classics</div>
<div class=meta><span class=star>★★★★★</span><span>4.6 · 2,140 reviews</span><span>Series: <u>Austen Collection</u></span></div>
<p class=d>Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen's chronicle of Elizabeth Bennet's quarrelsome courtship with the proud Mr Darcy is as sharp and witty today as it ever was.</p>
<div class=tbl><b>ISBN</b><span>978-0-14-143951-8</span><b>Pages</b><span>480</span><b>Language</b><span>English</span><b>Published</b><span>2002 (first 1813)</span><b>Format</b><span>Paperback</span></div></div>
<div class=buy><div><span class=pr>$8.50</span><span class=old>$12.00</span></div><div class=opts><span class=on>Paperback</span><span>Hardcover</span><span>E-book</span></div><div class=live><i></i>In stock — 14 copies left</div><div class=qty><div>−</div><div>1</div><div>+</div><span class=btn>Add to cart</span></div><span class="btn o">♡ Add to reading list</span><div class=ship>Free shipping over $40 · Ships in 1–2 days<br>Fake payment gateway (demo shop)</div></div></section>
<section class=inside><div><h3>Read the first pages — <em>before you buy.</em></h3><p>Every book has a free sample. Turn the pages right here, no sign-in needed.</p><span class=btn>Look inside →</span></div>
<div class=open><div><h5>Chapter 1</h5><p class=dc>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p><p style="margin-top:10px">However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families…</p></div><div><p>“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”</p><p style="margin-top:10px">Mr. Bennet replied that he had not.</p><h5 style="margin-top:70px">Pride and Prejudice · p. 1</h5></div></div></section>
<h2 class=s>Reader reviews</h2><div class=rev><div><b>Dana · <span class=star>★★★★★</span></b><p>Funnier than I remembered. Read it in two evenings and then started over.</p></div><div><b>Karim · <span class=star>★★★★☆</span></b><p>Lovely edition, clear print. The notes at the back are genuinely useful.</p></div></div>
<h2 class=s>You may also like</h2><div class=row>${[9, 1, 12, 13, 0, 8].map((i) => `<div>${img(B[i])}<h3>${B[i][0]}</h3><p>${B[i][1]} · ${B[i][3]}</p></div>`).join('')}</div>${foot}`);

// 4 CART
const items = [[2, 1], [0, 2], [12, 1]];
const cart = page('Cart', `
.crumb{padding:22px 96px 0;font:14px var(--sans);color:#666}
.steps{display:flex;gap:10px;padding:8px 96px 0;font:600 13px var(--sans);color:#888;align-items:center}.steps .on{color:var(--g)}.steps u{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#d6e5de;text-decoration:none;margin-right:6px}.steps .on u{background:var(--g);color:#fff}.steps hr{width:40px;border:0;border-top:1px solid #bcd0c6}
h1.t{font:500 42px var(--serif);color:var(--g);padding:14px 96px 24px}
.lay{display:grid;grid-template-columns:1fr 400px;gap:48px;padding:0 96px}
.it{display:grid;grid-template-columns:96px 1fr 120px 100px 30px;gap:22px;align-items:center;background:#fff;padding:18px;border-radius:8px;margin-bottom:14px}
.it h3{font:600 20px var(--serif)}.it p{font:14px var(--sans);color:#666;margin-top:4px}.it .q{display:flex;border:1.5px solid #cfe0d8;border-radius:8px;font:600 15px var(--sans);justify-content:space-between;padding:9px 12px}.it .p{font:700 18px var(--sans);color:var(--g);text-align:right}.it .x{color:#999;font-size:18px}
.sum{background:#fff;border-radius:8px;padding:30px;align-self:start;border-top:5px solid var(--g)}.sum h3{font:500 26px var(--serif);margin-bottom:18px}.r{display:flex;justify-content:space-between;font:16px var(--sans);padding:8px 0}.r.t{border-top:1px solid #e3ece7;margin-top:10px;padding-top:16px;font-weight:700;font-size:22px;color:var(--g)}
.code{display:flex;margin:14px 0;border:1.5px solid #cfe0d8;border-radius:8px;overflow:hidden}.code span{flex:1;padding:12px;font:14px var(--sans);color:#888}.code b{background:var(--mint);color:var(--g);padding:12px 16px;font:600 14px var(--sans)}
.ok{font:13px var(--sans);color:#1b6b4f;margin-bottom:6px}.sum .btn{display:block;text-align:center;margin-top:18px;border-radius:8px;padding:16px}.note{font:12px/1.5 var(--sans);color:#777;margin-top:14px;text-align:center}
.free{background:#e3f2ec;border-radius:8px;padding:14px 18px;font:14px var(--sans);color:#1b6b4f;margin-bottom:14px}.bar{height:6px;background:#c7e2d7;border-radius:9px;margin-top:8px}.bar i{display:block;width:86%;height:100%;background:var(--g);border-radius:9px}
.row{display:grid;grid-template-columns:repeat(5,1fr);gap:26px;padding:0 96px}.row h3{font:600 15px/1.2 var(--serif);margin:10px 0 2px}.row p{font:13px var(--sans);color:#666}
`, `${header('Home')}<div class=crumb>Home › <b>Cart</b></div>
<div class=steps><span class=on><u>1</u>Cart</span><hr><span><u>2</u>Details</span><hr><span><u>3</u>Payment</span><hr><span><u>4</u>Done</span></div>
<h1 class=t>Your cart · 4 books</h1>
<div class=lay><div><div class=free>You are $5.52 away from free shipping<div class=bar><i></i></div></div>${items.map(([i, q]) => `<div class=it>${img(B[i])}<div><h3>${B[i][0]}</h3><p>${B[i][1]} · Paperback<br><span style="color:#1b6b4f">In stock</span></p></div><div class=q><span>−</span><span>${q}</span><span>+</span></div><div class=p>$${(parseFloat(B[i][3].slice(1)) * q).toFixed(2)}</div><div class=x>✕</div></div>`).join('')}<span class="btn o" style="margin-top:10px">← Continue shopping</span></div>
<div class=sum><h3>Order summary</h3><div class=r><span>Subtotal (4 items)</span><span>$34.48</span></div><div class=code><span>Discount code</span><b>Apply</b></div><div class=ok>✓ LEAF30 applied: −$10.34</div><div class=r><span>Shipping</span><span>$4.90</span></div><div class=r><span>Tax</span><span>$2.10</span></div><div class="r t"><span>Total</span><span>$31.14</span></div><span class=btn>Checkout</span><div class=note>Demo shop: payment uses a simulated gateway, no real card needed.</div></div></div>
<h2 class=s>Add a little more</h2><div class=row>${[9, 1, 13, 8, 4].map((i) => `<div>${img(B[i])}<h3>${B[i][0]}</h3><p>${B[i][1]} · ${B[i][3]}</p></div>`).join('')}</div>${foot}`);

for (const [k, v] of Object.entries({ '1_home': home, '2_listing': listing, '3_product': product, '4_cart': cart })) writeFileSync(`${out}/${k}.html`, v);
