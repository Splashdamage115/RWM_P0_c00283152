import type { Task, BracketMatch, BracketRound, Tournament } from '../types/Task.js';

export function assignTaskPriorities(tournament: Tournament): Task[] {
  // Map taskId to furthest round reached
  const roundMap: Record<string, number> = {};
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      [match.task1, match.task2].forEach(task => {
        if (task && task.id) {
          const prev = roundMap[task.id] ?? 0;
          roundMap[task.id] = Math.max(prev, round.round);
        }
      });
      if (match.winner && match.winner.id) {
        roundMap[match.winner.id] = Math.max(roundMap[match.winner.id] ?? 0, round.round);
      }
    });
  });

  // Determine max round (final)
  const maxRound = tournament.rounds.length;

  return tournament.tasks.map(task => {
    const roundReached = roundMap[task.id] ?? 0;
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (tournament.winner && task.id === tournament.winner.id) {
      priority = 'high';
    } else if (roundReached === maxRound || roundReached === maxRound - 1) {
      priority = 'medium';
    }
    return {
      ...task,
      winner: tournament.winner && task.id === tournament.winner.id ? true : false,
      priority
    };
  });
}

export function generateBracket(tasks: Task[]): Tournament {
  if (tasks.length === 0) {
    return {
      tasks: [],
      rounds: [],
      winner: null
    };
  }

  // If only one task, it's the winner
  if (tasks.length === 1) {
    return {
      tasks: tasks,
      rounds: [],
      winner: tasks[0]
    };
  }

  // Calculate the number of participants needed (next power of 2)
  const bracketSize = getNextPowerOfTwo(tasks.length);
  
  // Pad with bye rounds if needed
  const paddedTasks = [...tasks];
  while (paddedTasks.length < bracketSize) {
    paddedTasks.push(null as any); // null represents a bye
  }

  // Calculate number of rounds needed
  const totalRounds = Math.log2(bracketSize);
  
  const rounds: BracketRound[] = [];
  
  // Generate first round with actual tasks
  const firstRound: BracketRound = {
    round: 1,
    matches: []
  };

  for (let i = 0; i < paddedTasks.length; i += 2) {
    const task1 = paddedTasks[i];
    const task2 = paddedTasks[i + 1];
    
    const match: BracketMatch = {
      id: `round-1-match-${i / 2}`,
      round: 1,
      position: i / 2,
      task1: task1,
      task2: task2,
      winner: null,
      status: 'pending'
    };

    // If one task is null (bye), the other automatically advances
    if (!task1 && task2) {
      match.winner = task2;
      match.status = 'completed';
    } else if (task1 && !task2) {
      match.winner = task1;
      match.status = 'completed';
    }

    firstRound.matches.push(match);
  }

  rounds.push(firstRound);

  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const previousRound = rounds[round - 2];
    const currentRound: BracketRound = {
      round: round,
      matches: []
    };

    for (let i = 0; i < previousRound.matches.length; i += 2) {
      const match: BracketMatch = {
        id: `round-${round}-match-${i / 2}`,
        round: round,
        position: i / 2,
        task1: null, // Will be filled when previous matches complete
        task2: null, // Will be filled when previous matches complete
        winner: null,
        status: 'pending'
      };

      currentRound.matches.push(match);
    }

    rounds.push(currentRound);
  }

  return {
    tasks: tasks,
    rounds: rounds,
    winner: null
  };
}

function getNextPowerOfTwo(n: number): number {
  if (n <= 1) return 2;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function advanceWinner(tournament: Tournament, matchId: string, winner: Task): Tournament {
  const updatedRounds = tournament.rounds.map(round => ({
    ...round,
    matches: round.matches.map(match => {
      if (match.id === matchId) {
        return {
          ...match,
          winner: winner,
          status: 'completed' as const
        };
      }
      return match;
    })
  }));

  // Find the match and determine which subsequent match it feeds into
  const matchFound = updatedRounds.find(round => 
    round.matches.some(match => match.id === matchId)
  );
  
  if (matchFound) {
    const match = matchFound.matches.find(m => m.id === matchId);
    if (match && match.round < updatedRounds.length) {
      // Find the next round match that this winner should advance to
      const nextRound = updatedRounds.find(r => r.round === match.round + 1);
      if (nextRound) {
        const nextMatchIndex = Math.floor(match.position / 2);
        const nextMatch = nextRound.matches[nextMatchIndex];
        if (nextMatch) {
          // Determine if winner goes to task1 or task2 slot
          const isFirstSlot = match.position % 2 === 0;
          if (isFirstSlot) {
            nextMatch.task1 = winner;
          } else {
            nextMatch.task2 = winner;
          }
        }
      }
    }
  }

  // Check if tournament is complete (last round has a winner)
  const finalRound = updatedRounds[updatedRounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  const tournamentWinner = finalMatch?.winner || null;

  return {
    ...tournament,
    rounds: updatedRounds,
    winner: tournamentWinner
  };
}
