// Data types voor ROC van Twente rondleiding applicatie

export interface TourSlide {
  id: string;
  order: number;
  instruction: string;
  imageUrl?: string;
}

export interface TourPoint {
  id: string;
  name: string;
  description: string;
  x: number; // positie op de kaart (percentage)
  y: number; // positie op de kaart (percentage)
  slides: TourSlide[];
}
