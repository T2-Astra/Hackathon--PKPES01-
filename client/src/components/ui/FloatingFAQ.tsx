"use client"

import React from "react"
import { MorphSurface } from "./MorphSurface"

export function FloatingFAQ() {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-sm:bottom-3 max-sm:right-3">
      <MorphSurface />
    </div>
  )
}

export default FloatingFAQ
