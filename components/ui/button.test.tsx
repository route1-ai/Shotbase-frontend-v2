import * as React from "react"
import { render, screen } from "@testing-library/react"
import { expect, test, describe } from "vitest"

import { Button } from "./button"

describe("Button component", () => {
  test("renders correctly", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: "Click me" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-primary", "text-primary-foreground")
  })

  test("renders outline variant correctly", () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole("button", { name: "Outline" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("border-border", "bg-background")
  })

  test("renders destructive variant correctly", () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole("button", { name: "Destructive" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-destructive/10", "text-destructive")
  })

  test("handles extra classes correctly", () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole("button", { name: "Custom" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("custom-class")
  })

  test("renders with specific size class", () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole("button", { name: "Small" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("h-7")
  })

  test("passes other props like disabled to button", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: "Disabled" })
    expect(button).toBeDisabled()
  })
})
