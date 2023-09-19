import { Horse } from "./types";

export let isGameStarted = false;
const horses = new Map<string, Horse>();
let symbols = generateCharacters();
let symbolsByStep: Array<string> = [];

export function createHorse(uuid: string): Horse {
  const horse = {
    id: uuid,
    name: "",
    position: 0,
  };

  horses.set(uuid, horse);
  return horse;
}

export function removeHorseById(id: string): Horse | undefined {
  const horse = horses.get(id);
  if (horse) {
    horses.delete(id);
  }
  return horse;
}

export function getAllHorses(): Array<Horse> {
  return Array.from(horses.values());
}

function generateCharacters(): Array<string> {
  const symbols = [];
  for (let i = 33; i < 96; i++) {
    symbols.push(String.fromCharCode(i));
  }
  for (let i = 97; i < 126; i++) {
    symbols.push(String.fromCharCode(i));
  }
  symbols.sort(() => Math.random() > .5 ? 1 : -1);
  return symbols;
}

function generateSymbolsByStep(steps: number): Array<string> {
  const data = [];
  for (let i = 0; i < steps; i++) {
    data[i] = '';
    for (let j = 0; j < i + 1; j++) {
      data[i] += symbols[Math.floor(Math.random() * symbols.length)];
    }
  }
  return data;
}

export function startRace(stepsAmount: number): string {
  isGameStarted = true;
  symbols = generateCharacters();
  symbolsByStep = generateSymbolsByStep(stepsAmount);
  horses.forEach((horse) => {
    horse.position = 0;
  });

  return symbolsByStep[0];
}

export function moveHorse(horseId: string, letter: string): string | undefined {
  const horse = horses.get(horseId);
  if (symbolsByStep[horse!.position] === letter) {
    horse!.position += 1;
    if (horse?.position === symbolsByStep.length) {
      return 'ñ'; // This horse won
    }
    return symbolsByStep[horse!.position];
  }
  return;
}

export function aHorseWon(horseId: string): Horse {
  const horse = horses.get(horseId);
  isGameStarted = false;
  return horse!;
}