import { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  // Standard Nextron production directory
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  
  // FIX: Set this to false so home.tsx becomes home.html
  trailingSlash: false, 
  
  images: {
    unoptimized: true,
  },
}

export default config