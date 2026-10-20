import { ButtonLink } from '@/shared/ui/Button';

const steps = ['#fde7d3', '#ffb000', '#ff7a1a', '#e4322b', '#b01f64', '#6b1450'];

export function PromoBanner() {
  return (
    <section
      aria-label="Promotion"
      className="relative mt-20 grid h-[230px] overflow-hidden rounded-md bg-forest-900 text-white md:grid-cols-[1.2fr_1fr]"
    >
      <div className="p-10">
        <h2 className="font-serif text-4xl font-medium">Welcome gift: 10% off</h2>
        <p className="my-3 opacity-80">
          Create an account and use code <b>WELCOME10</b> at checkout (orders over $20).
        </p>
        <ButtonLink href="/register" variant="gold">
          Create account
        </ButtonLink>
      </div>
      <div aria-hidden="true" className="relative hidden md:block">
        <div className="absolute right-16 top-7 z-10 grid size-[100px] rotate-[10deg] place-items-center rounded-full bg-[#ffb000] text-center font-sans text-2xl font-extrabold leading-none text-forest-900 shadow-[0_0_0_7px_#ffc94d]">
          10%
          <br />
          off
        </div>
        {steps.map((c, i) => (
          <i
            key={c}
            className="absolute bottom-0 block w-1/6"
            style={{ background: c, height: (i + 1) * 28, left: `${(i * 100) / 6}%` }}
          />
        ))}
      </div>
    </section>
  );
}
