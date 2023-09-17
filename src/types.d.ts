export interface WebSocketData {
  id: string;
}

export interface OnCloseResponse {
  action: string;
  horse: Horse;
  allHorses: Array<Horse>;
}

export interface Horse {
  id: string;
  name: string;
  position: number;
}
