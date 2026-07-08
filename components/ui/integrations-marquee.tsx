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
    <div className="integrations-band" aria-label={`${label} ${items.join(", ")}`.trim()}>
      {label ? <div className="integrations-label">{label}</div> : null}
      <div className="integrations-marquee" tabIndex={0} role="region">
        <ul className="integrations-track" aria-hidden="true">
          {rendered.map((name, idx) => (
            <Item key={`${name}-${idx}`} name={name} />
          ))}
        </ul>
      </div>
    </div>
  )
}

