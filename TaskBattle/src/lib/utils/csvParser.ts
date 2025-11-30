import type { Task } from '../types/Task.js';

export function parseCsv(csvContent: string): Task[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());

  if (!headers.includes('id') || !headers.includes('name') || !headers.includes('description')) {
    throw new Error('CSV must contain id, name, and description columns');
  }

  const idIndex = headers.indexOf('id');
  const nameIndex = headers.indexOf('name');
  const descriptionIndex = headers.indexOf('description');
  const winnerIndex = headers.indexOf('winner');
  const priorityIndex = headers.indexOf('priority');

  const tasks: Task[] = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.replace(/"/g, '').trim());
    return {
      id: values[idIndex],
      name: values[nameIndex],
      description: values[descriptionIndex],
      winner: winnerIndex !== -1 ? values[winnerIndex] === 'true' : undefined,
      priority: priorityIndex !== -1 ? values[priorityIndex] as 'high' | 'medium' | 'low' : undefined
    };
  });

  return tasks;
}

export function exportCsv(tasks: Task[]): string {
  const headers = ['id', 'name', 'description', 'winner', 'priority'];
  const lines = [
    headers.map(h => `"${h}"`).join(','),
    ...tasks.map(task =>
      [
        `"${task.id}"`,
        `"${task.name}"`,
        `"${task.description}"`,
        `"${task.winner ? 'true' : 'false'}"`,
        `"${task.priority ?? ''}"`
      ].join(',')
    )
  ];
  return lines.join('\n');
}

import type { Tournament } from '../types/Task.js';
import { assignTaskPriorities } from './bracketGenerator.js';

export function exportTournamentToCsv(tournament: Tournament): string {
  const tasksWithPriority = assignTaskPriorities(tournament);
  return exportCsv(tasksWithPriority);
}
