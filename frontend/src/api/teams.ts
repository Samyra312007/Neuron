import { api } from './client';

export interface TeamInfo {
  id: string;
  name: string;
  department: string;
}

export function fetchTeams() {
  return api.get<TeamInfo[]>('/teams');
}
