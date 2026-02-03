import { createContext, FormEvent, SetStateAction, useContext, useState } from "react";
import Image from 'next/image'

export type AudioContextType = {
    voice: SpeechSynthesisVoice,
    volume: number,
    pitch: number,
    rate: number
}

type AudioConfigProps = {
    setConfig: (value: SetStateAction<AudioContextType>) => void
    config: AudioContextType,
}

export default function AudioConfig({ setConfig, config }: AudioConfigProps) {

    const [voices] = useState<SpeechSynthesisVoice[]>(speechSynthesis.getVoices())
    const [panel, setPanel] = useState<boolean>(false)

    return (
        <div className="relative m-20 cursor-pointer">
            <Image
                src="headphones.svg"
                width={50}
                height={50}
                alt="Audio"
                onClick={() => {
                    setPanel(!panel)
                }}
            />
            {
                panel &&
                <div style={{ top: -45, left: -420 }} className="absolute bg-white w-[400px] border-1 border-black p-2">
                    <div className="flex w-full justify-center mb-2">
                        <h2 className="m-auto"> <strong>Configuración de audio</strong> </h2>
                    </div>

                    <form>
                        <div className="flex justify-between">
                            <label htmlFor="voice">Voz</label>
                            <select name="voice" className="w-[300px]" onChange={(ev) => {
                                const selected = voices.find(voice => voice.voiceURI === ev.target.value)
                                setConfig({
                                    ...config,
                                    voice: selected!
                                })
                            }}>
                                {
                                    voices.map(voice => <option value={voice.voiceURI}>{voice.name}</option>)
                                }
                            </select>
                        </div>

                        <div className="flex justify-between">
                            <label htmlFor="volume">Volumen</label>
                            <input type="range" min="0" max="1" step="0.1" name="volume" value={config.volume} onChange={(ev) => {
                                setConfig({
                                    ...config,
                                    volume: parseFloat(ev.target.value)
                                })
                            }} />
                        </div>

                        <div className="flex justify-between">
                            <label htmlFor="pitch">Pitch</label>
                            <input type="range" min="0" max="2" step="0.1" name="pitch" value={config.pitch} onChange={(ev) => {
                                setConfig({
                                    ...config,
                                    pitch: parseFloat(ev.target.value)
                                })
                            }} />
                        </div>

                        <div className="flex justify-between">
                            <label htmlFor="rate">Rate</label>
                            <input type="range" min="0.1" max="10" step="0.1" name="rate" value={config.rate} onChange={(ev) => {
                                setConfig({
                                    ...config,
                                    rate: parseFloat(ev.target.value)
                                })
                            }} />
                        </div>
                    </form>
                </div>
            }
        </div>
    );
}