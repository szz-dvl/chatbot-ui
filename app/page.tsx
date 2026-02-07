"use client";

import { createContext, FormEvent, useContext, useEffect, useRef, useState } from "react";
import UserMessage from "./ui/user_message";
import AiMessage, { AiMessageContext } from "./ui/ai_message";
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import Thoughts from "./ui/thoughts";
import dynamic from "next/dynamic";
import AudioConfig, { AudioContextType } from "./ui/audio-config";

export const AudioContext = createContext<AudioContextType>({
  voice: undefined,
  volume: 1,
  pitch: 1,
  rate: 1
});

type AiMessageType = {
  type: "ai"
  content: string
  context: AiMessageContext[]
}

type UserMessageType = {
  type: "user",
  content: string
}

type Message = AiMessageType | UserMessageType;

const Session = dynamic(() => import('./ui/session'), { ssr: false });

export default function Home() {
  const audio = useContext(AudioContext);

  const [messages, setMessages] = useState<Array<Message>>([]);
  const [done, setDone] = useState<boolean>(true);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [erroredResponse, setErroredResponse] = useState<AiMessageType>();
  const [uuid,] = useState<string>(uuidv4())
  const [config, setConfig] = useState<AudioContextType>(audio)

  const bottom = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    if (done && thoughts.length) {
      setThoughts([])

      fetch(`http://localhost:3002/context`, {
        method: "GET",
        headers: {
          "X-ChatBot-Session": uuid
        }
      }).then(async (response) => {

        const { context } = await response.json() as { context: AiMessageContext[] };

        setMessages([
          ...messages,
          {
            type: "ai",
            content: thoughts.join(""),
            context,
          }
        ]);
      });
    }
  }, [done]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thoughts]);

  useEffect(() => {
    if (erroredResponse)
      setMessages([...messages, erroredResponse])
  }, [erroredResponse])

  const decodeChunk = (chunk: Uint8Array<ArrayBufferLike>) => {
    return Buffer.from(chunk).toString("utf-8");
  }

  const parseResponse = async (body: ReadableStream<Uint8Array<ArrayBufferLike>>) => {

    let content = "";

    const reader = body.getReader();
    let { value, done } = await reader.read();

    if (value) {
      content = decodeChunk(value)
    }

    let count = 1
    while (!done) {

      let chunk = await reader.read();

      if (chunk.value)
        content += decodeChunk(chunk.value);

      if (count % 20 == 0)
        setThoughts([...thoughts, content])

      count++;

      done = chunk.done;

    }

    setThoughts([...thoughts, content])
    setDone(true)
  }

  const formSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const form = ev.target as HTMLFormElement;
    const formData = new FormData(form);

    const content = formData.get("question")!.toString()

    if (content.trim()) {

      setDone(false);

      setMessages([
        ...messages,
        {
          type: "user",
          content
        }
      ]);

      const response = await fetch("http://localhost:3002/chatbot", {
        method: form.method,
        body: formData,
        headers: {
          "X-ChatBot-Session": uuid
        }
      });

      if (!response.ok) {
        setErroredResponse(
          {
            type: "ai",
            content: "Lo siento, se ha producido un error, ¿puedes repetir tu pregunta por favor?",
            context: []
          },
        );

        setDone(true);
      } else if (response.body) {
        await parseResponse(response.body);
      }
    }
  }

  return (
    <AudioContext value={config}>
      <div className="flex min-h-screen items-center justify-center font-sans bg-orange-500 flex-wrap">
        <div className="w-full flex justify-center items-center m-[20px]">
          <h1>
            <Image
              src="https://www.meneame.net/img/mnm/logo-white.svg"
              width={500}
              height={500}
              alt="Meneame"
            />
            <span className="text-4xl text-white p-[5px] md:p-[20px]"> Bot </span>
          </h1>
        </div>
        <div className="min-h-[500px] max-h-[500px] min-w-full max-w-full
                      md:min-h-[850px] md:max-h-[850px] md:min-w-2/3 md:max-w-2/3
                      border-red-100 border-1 mb-[35px] overflow-y-auto overflow-x-hidden p-[15px] bg-white pb-[50px]">

          <div className="flex w-full h-full flex-col flex-wrap">
            {
              messages.map(message => {
                switch (message.type) {
                  case "ai":
                    return <AiMessage key={uuidv4()} message={message.content} context={message.context} audio={config} />
                  case "user":
                    return <UserMessage key={uuidv4()} message={message.content} />
                  default:
                    break;
                }
              })
            }
            {
              !done ?
                <Thoughts thoughts={thoughts} />
                : null

            }
            <div ref={bottom} />
          </div>
        </div>
        <form method="post" onSubmit={formSubmit} className="flex items-center justify-center w-full">
          <fieldset disabled={!done} className="min-h-30 flex items-center justify-center flex-wrap m-2 md:max-w-2/3">
            <textarea name="question" rows={2} cols={20} className="w-full bg-white md:min-w-200 border-black border-1" />
            {/* <input type="text" name="question" className="w-full md:min-w-200 border-black border-1 bg-white" /> */}
            <button type="submit" className="border-black border-1 p-[2px] cursor-pointer bg-white">Enviar</button>
          </fieldset>
        </form>
        <div className="flex justify-between items-end w-full">
          <AudioConfig config={config} setConfig={setConfig} />
          <Session uuid={uuid} />
        </div>
      </div>
    </AudioContext>
  );
}
