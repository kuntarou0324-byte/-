import { ActivityCard } from "./ActivityCard";
import type { Activity, SavedActivity } from "../types";

type Props = {
  items: SavedActivity[];
  onRemove: (id: string) => void;
  onExecute?: (activity: Activity) => void;
  onAsk?: (activity: Activity) => void;
};

export function SavedList({ items, onRemove, onExecute, onAsk }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ActivityCard
          key={item.id}
          activity={item}
          savedAt={item.savedAt}
          onRemove={() => onRemove(item.id)}
          onExecute={onExecute ? () => onExecute(item) : undefined}
          onAsk={onAsk ? () => onAsk(item) : undefined}
        />
      ))}
    </div>
  );
}
