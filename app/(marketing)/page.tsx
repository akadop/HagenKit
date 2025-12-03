import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import { Container } from "@/components/marketing/container";
import { PLANS } from "@/config/plans";

export default function Home() {
  return (
    <>
      <section
        id="home"
        className="overflow-hidden border-b [--color-border:var(--border-illustration)]"
      >
        <div className="relative">
          {/* <div
            aria-hidden
            className="dither-md mask-x-from-65% mask-x-to-95% mask-y-from-75% pointer-events-none absolute -inset-x-12 -bottom-24 top-1/4 mt-auto 2xl:mx-auto 2xl:max-w-7xl"
          >
            <div className="size-full">
              <Image
                src="https://res.cloudinary.com/dohqjvu9k/image/upload/v1759215689/grid-1-bg_byeo9b.webp"
                alt="tailark hero section background"
                className="size-full object-cover object-bottom brightness-125 contrast-75"
                width={1152}
                height={767}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                priority
                fetchPriority="high"
              />
            </div>
          </div> */}
          <div className="relative mx-auto max-w-5xl px-6 pt-32 text-center sm:pt-44">
            <div className="relative mx-auto max-w-3xl text-center">
              <h1 className="text-foreground text-balance text-5xl font-semibold sm:text-6xl">
                The Modern Way to Build{" "}
                <span className="relative text-indigo-500">
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 -bottom-3 w-full"
                    viewBox="0 0 283 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.24715 19.3744C72.4051 10.3594 228.122 -4.71194 281.724 7.12332"
                      stroke="url(#paint0_linear_pl)"
                      strokeWidth="4"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_pl"
                        x1="282"
                        y1="5.49999"
                        x2="40"
                        y2="13"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="var(--color-indigo-300)" />
                        <stop offset="1" stopColor="var(--color-blue-200)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="relative">SaaS</span>
                </span>
              </h1>
              <p className="text-muted-foreground mb-9 mt-7 text-balance text-lg">
                Enterprise-ready Next.js boilerplate with authentication, database, payments, and beautiful UI components. Ship production-grade SaaS applications faster.
              </p>
              <Button
                asChild
                size="lg"
                className="border-transparent px-4 text-sm shadow-xl shadow-indigo-950/30"
              >
                <Link href="#">Clone Repository</Link>
              </Button>
              <span className="text-muted-foreground mt-3 block text-center text-sm">
                Open source and ready to deploy
              </span>
            </div>
          </div>
          <Container className="bg-background **:data-[slot=content]:py-0 mt-8 sm:mt-16">
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="-mx-12 -mt-4 px-12 pt-4">
              <div className="bg-background ring-foreground/5 p-1 shadow-2xl shadow-indigo-900/35 ring-1">
                <div className="bg-background sm:aspect-3/2 relative origin-top overflow-hidden border-l-8 border-t-4 border-transparent">
                  <Image
                    className="object-top-left min-w-xl size-full object-cover"
                    src="/hero.png"
                    alt="Oxymor overview"
                    width={1152}
                    height={768}
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>
      
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Pricing that grows with you
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                  plan.isPopular ? "ring-2 ring-indigo-600" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={plan.id}
                      className={`text-lg font-semibold leading-8 ${
                        plan.isPopular ? "text-indigo-600" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    {plan.isPopular ? (
                      <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                        Most popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {plan.price.displayAmount}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /{plan.price.interval}
                    </span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex gap-x-3">
                        <svg
                          className={`h-6 w-5 flex-none ${
                            feature.included ? "text-indigo-600" : "text-gray-400"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Note: BillingCTA requires workspaceId, which we don't have on marketing page. 
                    Usually marketing page redirects to login/signup, then checkout.
                    For this demo, we'll link to dashboard or login. 
                    If logged in, we might show checkout.
                    For now, let's just use a Link to /dashboard/billing or signup.
                */}
                <Button
                  asChild
                  className={`mt-8 block w-full py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.isPopular
                      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus-visible:outline-indigo-600"
                  }`}
                >
                   <Link href="/dashboard/billing">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
