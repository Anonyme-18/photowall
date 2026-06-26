import type { TabItem } from "@/components/Header";

export interface EventConfig {
  name: string;
  subtitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventParticipants: string;
  tabs: TabItem[];
  accentColor: string;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  name: "TECH MEETUP 5",
  subtitle: "Les Pro de la Tech · Photowall",
  tabs: [
    { id: "wall", label: "Photo wall" },
    { id: "meetup", label: "Meetup" },
    { id: "event", label: "Infos" },
  ],
  accentColor: "#f5c842",
  eventDate: "25 juin 2026",
  eventTime: "19h – 23h",
  eventLocation: "Paris, France",
  eventParticipants: "Communauté Les Pro de la Tech",
};
