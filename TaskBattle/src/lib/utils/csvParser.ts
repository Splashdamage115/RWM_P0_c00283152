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

  const tasks: Task[] = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.replace(/"/g, '').trim());
    return {
      id: values[idIndex],
      name: values[nameIndex],
      description: values[descriptionIndex]
    };
  });

  return tasks;
}
