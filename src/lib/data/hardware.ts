export type HardwareCategory =
  | "synthesizer"
  | "audio"
  | "sensor"
  | "iot"
  | "robotics"
  | "other";

export interface HardwareImage {
  src: string;       // path under /public/hardware/
  alt: string;
  caption?: string;
  type: "photo" | "schematic" | "diagram" | "breadboard" | "pcb";
}

export interface HardwareSpec {
  label: string;
  value: string;
}

export interface HardwareProject {
  id: string;
  nameEn: string;
  namePt: string;
  taglineEn: string;
  taglinePt: string;
  descriptionEn: string;
  descriptionPt: string;
  /** Longer multi-paragraph body — use \n\n to separate paragraphs */
  bodyEn: string;
  bodyPt: string;
  microcontroller: string;
  categories: HardwareCategory[];
  tech: string[];
  specs: HardwareSpec[];
  images: HardwareImage[];
  githubUrl?: string;
  videoUrl?: string;
  year: number;
  status: "completed" | "in-progress" | "prototype";
}

export const hardwareProjects: HardwareProject[] = [
  {
    id: "esp32-synthesizer",
    nameEn: "ESP32 Digital Synthesizer",
    namePt: "Sintetizador Digital ESP32",
    taglineEn: "Real-time audio synthesis on a microcontroller",
    taglinePt: "Síntese de áudio em tempo real num microcontrolador",
    descriptionEn:
      "A fully functional digital audio synthesizer running on an ESP32 microcontroller, leveraging the Mozzi library for real-time audio synthesis with minimal latency.",
    descriptionPt:
      "Um sintetizador de áudio digital totalmente funcional rodando num microcontrolador ESP32, utilizando a biblioteca Mozzi para síntese de áudio em tempo real com latência mínima.",
    bodyEn: `The ESP32 Synthesizer was born from a desire to understand digital audio at its most fundamental level — not through a DAW or plugin, but through direct hardware control.

The project uses the Mozzi library to generate audio waveforms entirely on the ESP32's dual-core processor. Mozzi handles the audio interrupt loop at a configurable rate (up to 32kHz), leaving one core free for reading sensor inputs and updating oscillator parameters in real time.

The architecture supports multiple oscillator shapes (sine, sawtooth, square, triangle), a low-frequency oscillator (LFO) for modulation, and a rudimentary envelope generator (ADSR). Control is handled via potentiometers wired to the ADC pins, giving physical, tactile control over pitch, filter cutoff, and envelope parameters.

Output is through a simple RC low-pass filter and a small amplifier circuit to drive headphones. The whole build fits on a breadboard, making it easy to iterate on the circuit design.`,
    bodyPt: `O Sintetizador ESP32 nasceu do desejo de entender o áudio digital em seu nível mais fundamental — não através de um DAW ou plugin, mas por meio de controle direto de hardware.

O projeto usa a biblioteca Mozzi para gerar formas de onda de áudio inteiramente no processador dual-core do ESP32. O Mozzi gerencia o loop de interrupção de áudio em uma taxa configurável (até 32kHz), deixando um núcleo livre para ler entradas de sensores e atualizar parâmetros dos osciladores em tempo real.

A arquitetura suporta múltiplas formas de onda (senoidal, dente de serra, quadrada, triangular), um oscilador de baixa frequência (LFO) para modulação e um gerador de envelope rudimentar (ADSR). O controle é feito via potenciômetros ligados aos pinos ADC, dando controle físico e tátil sobre pitch, corte de filtro e parâmetros de envelope.

A saída passa por um filtro RC passa-baixas e um circuito amplificador simples para acionar fones de ouvido. A montagem inteira cabe numa protoboard, facilitando a iteração no design do circuito.`,
    microcontroller: "ESP32",
    categories: ["synthesizer", "audio"],
    tech: ["C++", "ESP32", "Arduino Framework", "Mozzi Library", "PWM Audio", "ADC"],
    specs: [
      { label: "MCU", value: "ESP32 (Xtensa dual-core LX6, 240 MHz)" },
      { label: "Audio Rate", value: "Up to 32kHz (Mozzi STANDARD_PLUS)" },
      { label: "Oscillators", value: "2× (carrier + LFO)" },
      { label: "Waveforms", value: "Sine, Sawtooth, Square, Triangle" },
      { label: "Controls", value: "4× potentiometers (ADC)" },
      { label: "Output", value: "RC low-pass filter → headphone amp" },
      { label: "Power", value: "5V via USB" },
    ],
    images: [
      // Add actual images to /public/hardware/esp32-synth/
      {
        src: "/hardware/esp32-synth/placeholder.png",
        alt: "ESP32 Synthesizer breadboard build",
        caption: "Full breadboard assembly with potentiometer controls",
        type: "breadboard",
      },
      {
        src: "/hardware/esp32-synth/schematic.png",
        alt: "ESP32 Synthesizer schematic",
        caption: "Circuit schematic — RC filter and output stage",
        type: "schematic",
      },
    ],
    year: 2024,
    status: "completed",
  },
  // Add more hardware projects here as they are documented
];
