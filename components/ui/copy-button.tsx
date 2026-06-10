"use client"

import React, { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="ccopy"
      style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px" }}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span style={{ fontSize: "10px" }}>{copied ? "Copied" : "Copy"}</span>
    </button>
  )
}
