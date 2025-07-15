import TPHCalculatorClient from "./TPHCalculatorClient"

export const metadata = {
  title: "TPH Calculator - Trust Per Human Score Assessment",
  description:
    "Discover your Trust Per Human (TPH) score with our quick 10-question assessment. Find out how much trust you're creating, one person at a time.",
  keywords: "trust assessment, TPH calculator, trust building, leadership assessment, trust score",
  openGraph: {
    title: "TPH Calculator - What's Your Trust Per Human Score?",
    description: "Take the TPH assessment and discover your trust-building potential. 10 questions, instant results.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TPH Calculator - Trust Per Human Score",
    description: "Discover how much trust you're creating with our quick assessment tool.",
  },
}

export default function TPHCalculator() {
  return <TPHCalculatorClient />
}
