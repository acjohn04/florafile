"use client";

import { useState } from "react";
import { Icon } from "./Icon";

interface TaskItemProps {
  task: {
    id: string;
    label: string;
    description: string | null;
    type: string;
    completed: boolean;
  };
  onToggle: (id: string, completed: boolean) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [loading, setLoading] = useState(false);

  const getTypeColor = (type: string) => {
    switch(type) {
      case "water": return "bg-secondary/20 text-secondary border-secondary/30";
      case "mist": return "bg-primary/20 text-primary border-primary/30";
      case "prune": return "bg-tertiary/20 text-tertiary border-tertiary/30";
      default: return "bg-surface-container-high text-on-surface-variant border-surface-container-highest";
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "water": return "water_drop";
      case "mist": return "shower";
      case "prune": return "content_cut";
      case "fertilize": return "science";
      case "rotate": return "sync";
      default: return "eco";
    }
  };

  return (
    <div className={`flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-surface-container transition-all ${task.completed ? 'opacity-50 grayscale' : ''}`}>
      <button 
        onClick={async () => {
          setLoading(true);
          await onToggle(task.id, !task.completed);
          setLoading(false);
        }}
        disabled={loading}
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors
          ${task.completed ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant hover:border-primary'}
        `}
      >
        {task.completed && <Icon name="check" className="text-[18px]" />}
      </button>
      
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium text-on-surface ${task.completed ? 'line-through text-on-surface-variant' : ''}`}>
            {task.label}
          </h4>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${getTypeColor(task.type)}`}>
            <Icon name={getTypeIcon(task.type)} className="text-[12px]" />
            {task.type}
          </div>
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-on-surface-variant">{task.description}</p>
        )}
      </div>
    </div>
  );
}
