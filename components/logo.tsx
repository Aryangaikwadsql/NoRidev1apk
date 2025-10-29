import React from 'react'
import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="flex items-center space-x-2">
        <Image
          src="/logo.png"
          alt="App Logo"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="text-2xl font-bold text-primary-foreground">
          NoRide
        </div>
      </div>
      <p className="text-xs opacity-90 text-primary-foreground">
        Mumbai Auto Rickshaw Monitoring
      </p>
    </div>
  )
}
