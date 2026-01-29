'use client'

type SessionProps = {
    uuid: string
}

export default function Session({ uuid }: SessionProps) {
    return (
        <div>
            { uuid }
        </div>
    );
}