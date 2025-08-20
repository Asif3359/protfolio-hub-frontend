"use client"
import NavBarComponent from '@/components/NavBarComponent'
import React from 'react'

    function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <NavBarComponent />
        {children}
    </>
  )
}

export default FeedLayout