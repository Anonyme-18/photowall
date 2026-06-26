export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export const MUSIC_LIBRARY: Track[] = [
  {
    id: "always-yours",
    title: "Always Yours",
    artist: "The Parrisian ft. Parris Fleming",
    src: "/imports/Always_Yours__feat._The_Parrisian___Parris_Fleming__-_The_Parrisian_feat._Parris_Fleming.mp3",
  },
  {
    id: "halfway-in",
    title: "Halfway In",
    artist: "Anno Domini Beats",
    src: "/imports/Halfway_In_-_Anno_Domini_Beats.mp3",
  },
  {
    id: "in-the-morning",
    title: "In The Morning",
    artist: "Blue Beat Review",
    src: "/imports/In_The_Morning_-_Blue_Beat_Review.mp3",
  },
  {
    id: "wait-too-long",
    title: "Wait Too Long",
    artist: "Anno Domini Beats",
    src: "/imports/Wait_Too_Long_-_Anno_Domini_Beats.mp3",
  },
  {
    id: "wildfire",
    title: "Wildfire",
    artist: "Jessie Villa",
    src: "/imports/Wildfire_-_Jessie_Villa.mp3",
  },
];
