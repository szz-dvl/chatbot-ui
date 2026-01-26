"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import UserMessage from "./ui/user_message";
import AiMessage, { AiMessageContext } from "./ui/ai_message";
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import Thoughts from "./ui/thoughts";

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

export default function Home() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [done, setDone] = useState<boolean>(true);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [uuid,] = useState<string>(uuidv4())

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

    setDone(false);

    // Read the form data
    const form = ev.target as HTMLFormElement;
    const formData = new FormData(form);

    setMessages([
      ...messages,
      {
        type: "user",
        content: formData.get("question")!.toString()
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
      setMessages([
        ...messages,
        {
          type: "ai",
          content: "Lo siento, se ha producido un error, ¿puedes repetir tu pregunta por favor?",
          context: []
        },

      ]);
      setDone(true);
    } else if (response.body) {
      await parseResponse(response.body);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center font-sans bg-orange-500">
      <h1 className="mb-[50px]">
        <Image
          src="https://www.meneame.net/img/mnm/logo-white.svg"
          width={500}
          height={500}
          alt="Meneame"
        />
        <span className="text-4xl text-white p-[20px] m-[20px]"> Bot </span>
      </h1>
      <div className="min-h-[650px] max-h-[650px] min-w-2/3 max-w-2/3 border-red-100 border-1 mb-[50px] overflow-scroll p-[15px] bg-white">
        <div className="flex flex-col w-full h-full">
          {
            messages.reverse().map(message => {
              switch (message.type) {
                case "ai":
                  return <AiMessage key={uuidv4()} message={message.content} context={message.context} />
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
      <form method="post" onSubmit={formSubmit} className="flex justify-between items-center">
        <fieldset disabled={!done} className="space-x-5">
          <input type="text" name="question" className="w-200 border-black border-1 bg-white" />
          <button type="submit" className="border-black border-1 p-[2px] cursor-pointer bg-white">Send</button>
        </fieldset>
      </form>
      <div>
        {uuid}
      </div>
    </div>
  );
}
