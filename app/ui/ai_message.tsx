'use client'

import { useState } from 'react';
import Markdown from 'react-markdown';

export type AiMessageContext = {
    link: string;
    text: string;
}

type AiMessageProps = {
    message: string,
    context: AiMessageContext[]
}

function ContextEntry({
    text,
    link,
}: AiMessageContext) {
    return (
        <div className="border-1 border-black p-2">
            <a target="_blank" rel="noopener noreferrer" href={link}><p>{text.split("\n\n")[0]}</p></a>
        </div>
    )
}

export default function AiMessage({ message, context }: AiMessageProps) {
    const [panel, setPanel] = useState<boolean>(false);
    const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    return (
        <div className="self-end max-w-2/3 mb-[15px]">
            <div className="border-1 border-black p-2 rounded-lg bg-cyan-100 size-full">
                <Markdown>
                    {message}
                </Markdown>
            </div>
            {
                context.length ?
                    <div className="underline text-gray-500 cursor-pointer">
                        <span onMouseEnter={(ev) => {
                            
                            setPos({
                                x: ev.clientX,
                                y: ev.clientY
                            });

                            setPanel(!panel)
                        }
                        }>Context</span>
                    </div>
                    : null
            }
            {
                panel &&
                <div 
                style={{
                    top: pos.y,
                    left: pos.x
                }}
                onMouseLeave={() => {
                    setPanel(false)
                }} className={`absolute w-[600px] h-[250px] bg-white grid grid-cols-2 overflow-scroll p-2`}>
                    {
                        context.map(({ text, link }) => {
                            return <ContextEntry
                                text={text}
                                link={link}
                            />
                        })
                    }
                </div>

            }
        </div>

    )
}