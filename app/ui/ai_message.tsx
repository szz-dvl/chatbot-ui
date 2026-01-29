'use client'

import { useState } from 'react';
import Markdown from 'react-markdown';
import { DateTime } from "luxon";

export type AiMessageContext = {
    link: string;
    text: string;
    published: string;
    image?: string;
}

type AiMessageProps = {
    message: string,
    context: AiMessageContext[]
}

function ContextEntry({
    text,
    link,
    image,
    published
}: AiMessageContext) {

    const [epoch] = useState<number>(parseInt(published))

    return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
            <div className='h-full w-full border-1 border-black flex flex-col items-end justify-end'>
                <div className="p-2 flex flex-row justify-center items-center">
                    {
                        image &&
                        <div className='w-1/3 overflow-hidden'>
                            <img
                                className='object-cover h-full w-full'
                                src={image}
                                width={220}
                                height={80}
                                alt="Image"
                            />
                        </div>
                    }
                    <p className='p-2 w-2/3'>{text.split("\n\n")[0]}</p>
                </div>
                <span className='p-2'> Enviada: {DateTime.fromJSDate(new Date(epoch)).toFormat("dd/MM/yyyy HH:mm")}</span>
            </div>
        </a>
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
                        <span onClick={(ev) => {

                            setPos({
                                x: ev.clientX,
                                y: ev.clientY
                            });

                            setPanel(!panel)
                        }
                        }>Contexto</span>
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
                    }}
                    className={`absolute w-[800px] h-[250px] bg-white grid grid-cols-2 overflow-scroll p-2`}>
                    {
                        context.map(({ text, link, image, published }) => {
                            return <ContextEntry
                                text={text}
                                link={link}
                                image={image}
                                published={published}
                            />
                        })
                    }
                </div>

            }
        </div>

    )
}