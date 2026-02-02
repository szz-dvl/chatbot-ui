'use client'

type SessionProps = {
    uuid: string
}

export default function Session({ uuid }: SessionProps) {
    return (
        <div className="flex w-full justify-end">
            <div>
                {uuid}
            </div>
        </div>
    );
}