import { ActivityCard } from "./ActivityCard";
import type { SavedActivity } from "../types";

type Props = {
  items: SavedActivity[];
  onRemove: (id: string) => void;
};

export function SavedList({ items, onRemove }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ActivityCard
          key={item.id}
          activity={item}
          savedAt={item.savedAt}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </div>
  );
}
