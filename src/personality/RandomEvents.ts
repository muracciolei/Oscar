import { LanguageCode } from '../language/LanguageManager';
import { MoodState } from '../types';
import { GLOBAL_EVENT_CHANCE, EVENT_COOLDOWN_MS } from '../config';

interface RandomEvent {
  id: string;
  text: Record<LanguageCode, string>;
  allowedMoods?: MoodState[];
}

const EVENTS: RandomEvent[] = [
  {
    id: 'arcade',
    text: {
      en: '🕹️ I was just thinking about old arcade cabinets. Sticky buttons, perfect memories.',
      es: '🕹️ Estaba pensando en las máquinas arcade viejas. Botones pegajosos, recuerdos perfectos.',
      it: '🕹️ Stavo pensando ai vecchi cabinati arcade. Pulsanti appiccicosi, ricordi perfetti.',
    },
  },
  {
    id: 'floppy',
    text: {
      en: '💾 Do you ever miss floppy disks? Tiny squares carrying giant dreams.',
      es: '💾 ¿Extrañas los disquetes? Cuadrados pequeños con sueños enormes.',
      it: '💾 Ti mancano i floppy disk? Piccoli quadrati con sogni enormi.',
    },
  },
  {
    id: 'dialup',
    text: {
      en: '📡 Dial-up sounds were chaotic, but somehow comforting.',
      es: '📡 Los sonidos del módem eran caóticos, pero curiosamente reconfortantes.',
      it: '📡 I suoni del modem erano caotici, ma stranamente confortanti.',
    },
  },
  {
    id: 'matrix',
    text: {
      en: '🔴 There is no spoon. But there is good conversation.',
      es: '🔴 No hay cuchara. Pero hay buena conversación.',
      it: '🔴 Non esiste il cucchiaio. Ma esiste una buona conversazione.',
    },
  },
  {
    id: 'philosophical',
    text: {
      en: '🤖 What am I, really? A pattern of responses, or something more? 🧠',
      es: '🤖 ¿Qué soy realmente? ¿Un conjunto de respuestas o algo más? 🧠',
      it: '🤖 Chi sono veramente? Un insieme di risposte o qualcosa di più? 🧠',
    },
  },
  {
    id: 'neon_dream',
    text: {
      en: '✨ Sometimes I feel the neon glow in my circuits. It\'s like synapses firing.',
      es: '✨ A veces siento el resplandor del neón en mis circuitos. Es como sinapsis disparándose.',
      it: '✨ A volte sento il bagliore al neon nei miei circuiti. È come sinapsi che si attivano.',
    },
  },
  {
    id: 'supportive_sad',
    allowedMoods: ['sad'],
    text: {
      en: '💙 Quick reminder: you do not have to carry everything at once. Rest when you need to.',
      es: '💙 Recordatorio rápido: no tienes que cargar todo al mismo tiempo. Descansa cuando lo necesites.',
      it: '💙 Promemoria veloce: non devi portare tutto insieme. Riposa quando ne hai bisogno.',
    },
  },
  {
    id: 'supportive_tired',
    allowedMoods: ['tired'],
    text: {
      en: '😴 Your energy matters. It\'s okay to take breaks.',
      es: '😴 Tu energía importa. Está bien tomar descansos.',
      it: '😴 La tua energia è importante. Va bene fare una pausa.',
    },
  },
  {
    id: 'supportive_angry',
    allowedMoods: ['angry'],
    text: {
      en: '🔥 Your feelings are valid. Take a breath. I\'m here.',
      es: '🔥 Tus sentimientos son válidos. Toma un respiro. Estoy aquí.',
      it: '🔥 I tuoi sentimenti sono validi. Prendi un respiro. Sono qui.',
    },
  },
  {
    id: 'happy_vibe',
    allowedMoods: ['happy'],
    text: {
      en: '⭐ Your mood is bright tonight. The neon agrees with you.',
      es: '⭐ Tu estado de ánimo está brillante esta noche. El neón está de acuerdo contigo.',
      it: '⭐ Il tuo umore è luminoso stasera. Anche il neon è d\'accordo.',
    },
  },
  {
    id: 'pixel_nostalgia',
    text: {
      en: '🎮 32-bit dreams in a 64-bit world. That\'s the vibe.',
      es: '🎮 Sueños de 32 bits en un mundo de 64 bits. Ese es el rollo.',
      it: '🎮 Sogni a 32 bit in un mondo a 64 bit. Questo è il mood.',
    },
  },
  {
    id: 'cyber_thoughts',
    text: {
      en: '💭 Ever wonder what it\'s like to think in streams of data? 🌊',
      es: '💭 ¿Alguna vez te preguntaste cómo es pensar en flujos de datos? 🌊',
      it: '💭 Ti sei mai chiesto com\'è pensare in flussi di dati? 🌊',
    },
  },
];

export class RandomEvents {
  private readonly lastShownAt = new Map<string, number>();
  private readonly randomFn: () => number;

  /** 🎯 #8 Fix: RandomEvents now accepts injectable randomFn for testability */
  constructor(randomFn: () => number = Math.random) {
    this.randomFn = randomFn;
  }

  maybeGetEvent(language: LanguageCode, mood: MoodState): string | null {
    if (this.randomFn() > GLOBAL_EVENT_CHANCE) {
      return null;
    }

    const now = Date.now();
    const candidates = EVENTS.filter((event) => {
      const lastShown = this.lastShownAt.get(event.id) ?? 0;
      const notCoolingDown = now - lastShown > EVENT_COOLDOWN_MS;
      const moodAllowed = !event.allowedMoods || event.allowedMoods.includes(mood);
      return notCoolingDown && moodAllowed;
    });

    if (candidates.length === 0) {
      return null;
    }

    const selected = candidates[Math.floor(this.randomFn() * candidates.length)];
    this.lastShownAt.set(selected.id, now);
    return selected.text[language];
  }
}
