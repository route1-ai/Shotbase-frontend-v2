"use client"

import * as React from "react"

type Integration = {
  name: string
  href?: string
}

const INTEGRATIONS: Integration[] = [
  { name: "Linear" },
  { name: "Stripe" },
  { name: "Railway" },
  { name: "Framer" },
  { name: "Figma" },
]

function Item({ name }: { name: string }) {
  return (
    <li className="integrations-item" aria-label={name}>
      <span className="integrations-mark" aria-hidden="true" />
      <span className="integrations-name">{name}</span>
    </li>
  )
}

export default function IntegrationsMarquee({
  label = "Integrations from",
  integrations = INTEGRATIONS,
}: {
  label?: string
  integrations?: Integration[]
}) {
  const items = React.useMemo(() => integrations.map((i) => i.name), [integrations])
  const rendered = React.useMemo(() => [...items, ...items], [items])

  return (
    <div className="integrations-band" aria-label={`${label} ${items.join(", ")}`}>
      <div className="integrations-label">{label}</div>
      <div className="integrations-marquee" role="presentation">
        <ul className="integrations-track">
          {rendered.map((name, idx) => (
            <Item key={`${name}-${idx}`} name={name} />
          ))}
        </ul>
      </div>
    </div>
  )
}

