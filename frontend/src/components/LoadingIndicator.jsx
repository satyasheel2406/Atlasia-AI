import React, { useEffect, useState } from 'react'

const WORDS = ["Analyzing", "Reasoning", "Generating", "Thinking"]

const LoadingIndicator = () => {
    const [wordIndex, setWordIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const currentWord = WORDS[wordIndex]

        if (!deleting && charIndex < currentWord.length) {
            const t = setTimeout(() => setCharIndex((c) => c + 1), 100 + Math.random() * 60)
            return () => clearTimeout(t)
        }

        if (!deleting && charIndex === currentWord.length) {
            const t = setTimeout(() => setDeleting(true), 1200)
            return () => clearTimeout(t)
        }

        if (deleting && charIndex > 0) {
            const t = setTimeout(() => setCharIndex((c) => c - 1), 50)
            return () => clearTimeout(t)
        }

        if (deleting && charIndex === 0) {
            setDeleting(false)
            setWordIndex((i) => (i + 1) % WORDS.length)
        }
    }, [charIndex, deleting, wordIndex])

    const displayText = WORDS[wordIndex].slice(0, charIndex)

    return (
        <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span className="text-[13px] text-slate-400 font-medium min-w-[90px]">
                    {displayText}
                    <span className="animate-pulse text-indigo-400">|</span>
                </span>
            </div>
        </div>
    )
}

export default LoadingIndicator
