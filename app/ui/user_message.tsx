'use client'

type UserMessageProps = {
    message: string
}

export default function UserMessage({ message }: UserMessageProps) {
    return (
        <div className="self-start max-w-2/3 border-1 border-black p-2 rounded-lg bg-indigo-100 mb-[15px]">
            { message }
        </div>
    )
}