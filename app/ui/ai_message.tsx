'use client'

import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { DateTime } from "luxon";
import { AudioContextType } from './audio-config';
import Image from 'next/image'

export type AiMessageContext = {
    link: string;
    text: string;
    published: string;
    image?: string;
}

type AiMessageProps = {
    message: string,
    context: AiMessageContext[],
    audio: AudioContextType
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
type PlayerProps = {
    message: string,
    audio: AudioContextType
}

function Player({ message, audio }: PlayerProps) {
    const [playing, setPlaying] = useState<boolean>(false);
    useEffect(() => {
        return () => {
            speechSynthesis.cancel()
        }
    }, [])

    return (
        <div className='cursor-pointer mt-1'>
            <Image
                src={playing ? "stop.svg" : "play.svg"}
                width={20}
                height={20}
                alt="Audio"
                onClick={() => {

                    if (playing) {
                        speechSynthesis.cancel()
                    } else {
                        
                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.voice = audio.voice;
                        utterance.volume = audio.volume;
                        utterance.pitch = audio.pitch;
                        utterance.rate = audio.rate;

                        utterance.addEventListener("end", () => {
                            setPlaying(false)
                        });

                        speechSynthesis.speak(utterance);
                    }

                    setPlaying(!playing)
                }}
            />
        </div>
    )
}

export default function AiMessage({ message, context, audio }: AiMessageProps) {

    const [panel, setPanel] = useState<boolean>(false);
    const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isMobile] = useState<boolean>(window.screen.width <= 640)

    return (
        <div className="self-end md:max-w-2/3 mb-[15px]">
            <div className="border-1 border-black p-2 rounded-lg bg-cyan-100 size-full">
                <Markdown>
                    {message}
                </Markdown>
            </div>
            <div className='flex justify-between'>
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
                        : <span></span>
                }
                <Player message={message} audio={audio} />
            </div>
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
                    className="absolute h-[250px] md:w-[800px] md:h-[250px] bg-white grid md:grid-cols-2 grid-cols-1 overflow-scroll p-2">
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