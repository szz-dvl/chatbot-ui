'use client'

import { useState } from "react";

type ThoughtsProps = {
    thoughts: string[]
}

export function Dots() {
    const [dots, setDots] = useState<string>("...");

    setInterval(() => {
        if(dots == "...")
            setDots(".")
        else
            setDots(dots + ".")
    }, 1000)

    return (
        <span className="text-xl">
            { dots }
        </span>
    )
}

export default function Thoughts({ thoughts }: ThoughtsProps) {
    return (
        <div className="self-end max-w-2/3 border-1 border-black p-2 rounded-lg bg-gray-100 mb-[15px]">
            { thoughts.map(thought => <span> {thought} </span>)  } 
            <Dots />
        </div>
    )
}

