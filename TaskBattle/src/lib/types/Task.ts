export interface Task {
  id: string;
  name: string;
  description: string;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  task1: Task | null;
  task2: Task | null;
  winner: Task | null;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface Tournament {
  tasks: Task[];
  rounds: BracketRound[];
  winner: Task | null;
}
