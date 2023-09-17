import { Horse } from "./types";

export let isGameStarted = false;
const horses = new Map<string, Horse>();
let symbols = generateCharacters();

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

export function startRace(): string {
  isGameStarted = true;
  symbols = generateCharacters();
  horses.forEach((horse) => {
    horse.position = 0;
  });

  return symbols[0];
}

export function moveHorse(horseId: string, letter: string): string | undefined {
  const horse = horses.get(horseId);
  if (symbols[horse!.position] === letter) {
    horse!.position += 1;
    return symbols[horse!.position];
  }
  return;
}