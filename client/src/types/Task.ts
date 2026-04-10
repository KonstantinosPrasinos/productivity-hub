export interface Task {
  _id?: number;
  userId: string;
  title: string;
  type: string;
  priority: number;
  repeats: boolean;
  mostRecentProperDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  currentEntryId?: number | string | null;
  hidden: boolean;
  goal?: any; // Consider adding specific type based on goal structure
  longGoal?: any; // Consider adding specific type based on longGoal structure
  repeatRate?: any; // Consider adding specific type based on repeatRate structure
  mustSync: boolean;
  isNew: boolean;
  tasks?: Task[]; // This is used in the TaskList component to display multiple tasks
  category?: string;
  group?: string;
}
