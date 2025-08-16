"use client";
import { useParams } from 'next/navigation';
import React from 'react'

function PortfolioPage() {
    const params = useParams();
    const id = params.id as string;
  return (
    <div>PortfolioPage {id}</div>
  )
}

export default PortfolioPage;