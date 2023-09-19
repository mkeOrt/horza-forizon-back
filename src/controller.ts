import { ServerWebSocket } from "bun";
import * as service from './service';
import { OnCloseResponse, WebSocketData } from "./types";

export function onOpen(ws: ServerWebSocket<WebSocketData>): void {
  const horse = service.createHorse(ws.data.id);
  const allHorses = service.getAllHorses();
  ws.subscribe('race');
  const data = {
    horse,
    allHorses,
  }
  ws.publish('race', JSON.stringify({
    action: 'opponent-joined',
    ...data,
  }));
  ws.send(JSON.stringify({
    action: 'me-joined',
    ...data,
  }));
}

export function onClose(ws: ServerWebSocket<WebSocketData>, code: number, reason: string): OnCloseResponse | undefined {
  const horseLeft = service.removeHorseById(ws.data.id);
  if (horseLeft) {
    return {
      action: 'opponent-left',
      horse: horseLeft,
      allHorses: service.getAllHorses()
    }
  }
}

export function onMessage(ws: ServerWebSocket<WebSocketData>, message: string): void {
  const json = JSON.parse(message);
  const methods: any = {
    'start-race': () => startRace(ws, json['steps-amount']),
    'submit-letter': () => submitLetter(ws, json.data)
  };

  methods[json.action]();
}

export function startRace(ws: ServerWebSocket<WebSocketData>, stepsAmount: number): void {
  if (service.isGameStarted) {
    ws.send(JSON.stringify({
      action: 'start-race-error',
      description: 'The game is already started'
    }));
    return;
  }
  if (stepsAmount === undefined) {
    ws.send(JSON.stringify({
      action: 'start-race-error',
      description: 'steps-amount is needed'
    }));
    return;
  }
  const symbol = service.startRace(stepsAmount);
  ws.publish('race', JSON.stringify({
    action: 'next-symbol',
    symbol,
  }));
  ws.send(JSON.stringify({
    action: 'next-symbol',
    symbol,
  }));
}

export function submitLetter(ws: ServerWebSocket<WebSocketData>, letter: any) {
  if (letter === undefined || !service.isGameStarted) {
    return;
  }
  const horseId = ws.data.id;
  const nextSymbol = service.moveHorse(horseId, letter);
  if (nextSymbol) {
    if (nextSymbol === 'ñ') {
      const winnerHorse = service.aHorseWon(horseId);
      const data = {
        action: 'horse-won',
        horse: winnerHorse,
      };
      ws.send(JSON.stringify(data));
      ws.publish('race', JSON.stringify(data));
    } else {
      const data = JSON.stringify({
        action: 'horse-moved',
        horses: service.getAllHorses(),
      });
  
      ws.publish('race', data);
      ws.send(data);
      ws.send(JSON.stringify({
        action: 'next-symbol',
        symbol: nextSymbol,
      }));
    }

  } else {
    ws.send(JSON.stringify({
      action: 'wrong-symbol',
      symbol: letter,
    }));
  }
}