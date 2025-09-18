// Mock data for wedding table planner

export const mockGuests = [
  {
    id: "g1",
    name: "Marco Rossi",
    email: "marco.rossi@email.com",
    category: "Famiglia dello sposo",
    dietaryRestrictions: "Vegetariano",
    tableId: null,
    seatNumber: null
  },
  {
    id: "g2",
    name: "Anna Bianchi",
    email: "anna.bianchi@email.com",
    category: "Famiglia della sposa",
    dietaryRestrictions: "Senza glutine",
    tableId: null,
    seatNumber: null
  },
  {
    id: "g3",
    name: "Luigi Verdi",
    email: "luigi.verdi@email.com",
    category: "Amici dello sposo",
    dietaryRestrictions: null,
    tableId: "t1",
    seatNumber: 1
  },
  {
    id: "g4",
    name: "Francesca Romano",
    email: "francesca.romano@email.com",
    category: "Amici della sposa",
    dietaryRestrictions: null,
    tableId: "t1",
    seatNumber: 2
  },
  {
    id: "g5",
    name: "Giuseppe Marino",
    email: "giuseppe.marino@email.com",
    category: "Famiglia dello sposo",
    dietaryRestrictions: null,
    tableId: "t1",
    seatNumber: 3
  },
  {
    id: "g6",
    name: "Valentina Ferrari",
    email: "valentina.ferrari@email.com",
    category: "Amici della sposa",
    dietaryRestrictions: "Vegano",
    tableId: null,
    seatNumber: null
  },
  {
    id: "g7",
    name: "Antonio Galli",
    email: "antonio.galli@email.com",
    category: "Colleghi",
    dietaryRestrictions: null,
    tableId: "t2",
    seatNumber: 1
  },
  {
    id: "g8",
    name: "Sofia Conti",
    email: "sofia.conti@email.com",
    category: "Famiglia della sposa",
    dietaryRestrictions: null,
    tableId: "t2",
    seatNumber: 2
  },
  {
    id: "g9",
    name: "Roberto Ricci",
    email: "roberto.ricci@email.com",
    category: "Amici dello sposo",
    dietaryRestrictions: "Senza lattosio",
    tableId: null,
    seatNumber: null
  },
  {
    id: "g10",
    name: "Elena Barbieri",
    email: "elena.barbieri@email.com",
    category: "Famiglia della sposa",
    dietaryRestrictions: null,
    tableId: "t2",
    seatNumber: 3
  },
  {
    id: "g11",
    name: "Davide Moretti",
    email: "davide.moretti@email.com",
    category: "Colleghi",
    dietaryRestrictions: null,
    tableId: null,
    seatNumber: null
  },
  {
    id: "g12",
    name: "Chiara Fontana",
    email: "chiara.fontana@email.com",
    category: "Amici della sposa",
    dietaryRestrictions: null,
    tableId: null,
    seatNumber: null
  }
];

export const mockTables = [
  {
    id: "t1",
    name: "Tavolo 1",
    shape: "round",
    seats: 8,
    x: 200,
    y: 150,
    assignedGuests: ["g3", "g4", "g5"]
  },
  {
    id: "t2",
    name: "Tavolo 2",
    shape: "round",
    seats: 6,
    x: 400,
    y: 200,
    assignedGuests: ["g7", "g8", "g10"]
  },
  {
    id: "t3",
    name: "Tavolo 3",
    shape: "rectangular",
    seats: 10,
    x: 600,
    y: 150,
    assignedGuests: []
  }
];

export const mockVenue = {
  id: "v1",
  name: "Villa Rosa - Sala Principale",
  width: 1000,
  height: 600,
  elements: [
    {
      id: "dancefloor",
      type: "dancefloor",
      x: 100,
      y: 400,
      width: 200,
      height: 150,
      label: "Pista da ballo"
    },
    {
      id: "stage",
      type: "stage",
      x: 50,
      y: 450,
      width: 100,
      height: 50,
      label: "Palco"
    }
  ]
};

export const mockGuestCategories = [
  "Famiglia dello sposo",
  "Famiglia della sposa",
  "Amici dello sposo",
  "Amici della sposa",
  "Colleghi",
  "Altri invitati"
];

export const mockDietaryRestrictions = [
  "Vegetariano",
  "Vegano",
  "Senza glutine",
  "Senza lattosio",
  "Allergie alimentari",
  "Kosher",
  "Halal"
];

export const mockTableShapes = [
  { id: "round", name: "Rotondo", maxSeats: 12 },
  { id: "rectangular", name: "Rettangolare", maxSeats: 16 },
  { id: "square", name: "Quadrato", maxSeats: 8 }
];