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
    'start-race': () => startRace(ws),
    'submit-letter': () => submitLetter(ws, json.data)
  };

  methods[json.action]();
}

export function startRace(ws: ServerWebSocket<WebSocketData>): void {
  if (service.isGameStarted) {
    return;
  }
  const symbol = service.startRace();
  ws.publish('race', JSON.stringify({
    action: 'next-symbol',
    symbol,
  }));
  ws.send(JSON.stringify({
    action: 'next-symbol',
    symbol,
  }));
}

export function submitLetter(ws: ServerWebSocket<WebSocketData>, letter: any ) {
  if (letter === undefined) {
    return;
  }
  const horseId = ws.data.id;
  const nextSymbol = service.moveHorse(horseId, letter);
  if (nextSymbol) {
    const data = JSON.stringify ({
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
}