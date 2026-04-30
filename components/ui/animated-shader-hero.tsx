"use client"

import * as React from "react"
import { WebGLShader } from "./web-gl-shader"
import { LiquidButton } from "./liquid-glass-button"

export interface HeroProps {
  trustBadge?: {
    text: string
    icons?: string[]
  }
  headline: {
    line1: string
    line2: string
  }
  subtitle: string
  buttons?: {
    primary?: {
      text: string
      onClick: () => void
    }
    secondary?: {
      text: string
      onClick: () => void
    }
  }
  className?: string
}

export default function Hero({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = "",
}: HeroProps) {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      <WebGLShader />
      <div className="absolute inset-0 bg-black/70 z-[1]" />
      
      <div className="relative z-[2] w-full max-w-5xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        {trustBadge && (
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-zinc-300">
            {trustBadge.icons && (
              <span className="flex gap-1">
                {trustBadge.icons.map((icon, i) => (
                  <span key={i}>{icon}</span>
                ))}
              </span>
            )}
            <span>{trustBadge.text}</span>
          </div>
        )}

        <h1 className="text-white text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[1.1]">
          <span className="block">{headline.line1}</span>
          <span className="block text-zinc-400">{headline.line2}</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {buttons?.primary && (
            <LiquidButton 
              size="xl" 
              className="text-white border border-white/20 rounded-full bg-white/5"
              onClick={buttons.primary.onClick}
            >
              {buttons.primary.text}
            </LiquidButton>
          )}
          
          {buttons?.secondary && (
            <button 
              className="px-8 py-3 rounded-full text-zinc-300 font-medium hover:text-white transition-colors"
              onClick={buttons.secondary.onClick}
            >
              {buttons.secondary.text}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
