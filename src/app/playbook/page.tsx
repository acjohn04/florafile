"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { TaskItem } from "@/components/TaskItem";
import { useTranslation } from "@/i18n/client";

export default function PlaybookPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  const days = [
    t.playbook.days.sunday,
    t.playbook.days.monday,
    t.playbook.days.tuesday,
    t.playbook.days.wednesday,
    t.playbook.days.thursday,
    t.playbook.days.friday,
    t.playbook.days.saturday
  ];

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/playbook");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await fetch("/api/playbook", { method: "POST" });
      await fetchTasks();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/playbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const activeTasks = tasks.filter(t => t.dayOfWeek === activeDay);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-on-surface">{t.playbook.title}</h1>
          <p className="text-on-surface-variant mt-1">{t.playbook.subtitle}</p>
        </div>
        <a 
          href="/api/playbook/export"
          className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <Icon name="calendar_month" /> {t.playbook.sync}
        </a>
      </header>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">{t.playbook.loading}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-surface-container border-dashed">
          <Icon name="auto_awesome" className="text-6xl text-primary mb-4" />
          <h3 className="text-lg font-medium text-on-surface mb-2">{t.playbook.noPlaybookTitle}</h3>
          <p className="text-on-surface-variant mb-6">{t.playbook.noPlaybookDesc}</p>
          <button 
            onClick={handleGenerate}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold inline-block hover:bg-primary-fixed transition-colors"
          >
            {t.playbook.generateButton}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          {/* Days Sidebar */}
          <div className="flex overflow-x-auto md:flex-col gap-2 pb-4 md:pb-0 scrollbar-hide">
            {days.map((day, idx) => {
              const count = tasks.filter(t => t.dayOfWeek === idx && !t.completed).length;
              const isActive = activeDay === idx;
              
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl whitespace-nowrap transition-colors flex-shrink-0 md:w-full
                    ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}
                  `}
                >
                  {day}
                  {count > 0 && (
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isActive ? 'bg-on-primary-container text-primary-container' : 'bg-surface-container-highest text-on-surface'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-bold text-on-surface mb-4">
              {days[activeDay]} <span className="text-on-surface-variant font-medium text-base ml-2">{t.playbook.tasksCount.replace('{count}', activeTasks.length.toString())}</span>
            </h2>
            
            {activeTasks.length === 0 ? (
              <div className="bg-surface-container-low p-6 rounded-2xl text-center text-on-surface-variant border border-surface-container">
                <Icon name="park" className="text-4xl mb-2 opacity-50" />
                <p>{t.playbook.noTasks}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
