// Define the structure of a question
export interface BaseQuestion {
  id: number;
  type: 'text' | 'image' | 'multipleChoice';
  text: string;
  answer: string;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
}

export interface ImageQuestion extends BaseQuestion {
  type: 'image';
  imageUrl: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  options: string[];
}

export type Question = TextQuestion | ImageQuestion | MultipleChoiceQuestion;

// Sample questions
export const questions: Question[] = [
  { id: 1, type: 'text', text: "Cuál es la palanca nº 1?", answer: "muñeca de oro y de seda" },
  { id: 2, type: 'text', text: "Cuál es la palanca nº 2?", answer: "mano corta como cuchillo" },
  { id: 3, type: 'text', text: "Cuál es la palanca nº 3?", answer: "arrodillarse a pedir limosna" },
  { id: 4, type: 'text', text: "Cuál es la palanca nº 4?", answer: "xiang zi lleva la canasta" },
  { id: 5, type: 'text', text: "Cuál es la palanca nº 5?", answer: "proteger los hombros" },
  { id: 6, type: 'text', text: "Cuál es la palanca nº 6?", answer: "sostener la luna entre las manos" },
  { id: 7, type: 'text', text: "Cuál es la palanca nº 7?", answer: "doblar el codo" },
  { id: 8, type: 'text', text: "Cuál es la palanca nº 8?", answer: "el rey del cielo sostiene la torre" },
  { id: 9, type: 'text', text: "Cuál es la palanca nº 9?", answer: "sostener la mano y atrapar los dedos" },
  { id: 10, type: 'text', text: "Cuál es la palanca nº 10?", answer: "habilmente tomar dos dedos" },
  { id: 11, type: 'text', text: "Cuál es la palanca nº 11?", answer: "empujar el bote con la corriente" },
  { id: 12, type: 'text', text: "Cuál es la palanca nº 12?", answer: "ba wang indica la batalla" },
  { id: 13, type: 'text', text: "Cuál es la palanca nº 13?", answer: "palmada en el pecho y girar el codo" },
  { id: 14, type: 'text', text: "Cuál es la palanca nº 14?", answer: "manos de flor de ciruelo" },
  { id: 15, type: 'text', text: "Cuál es la palanca nº 15?", answer: "girar la muñeca y llevar el codo" },
  { id: 16, type: 'text', text: "Cuál es la palanca nº 16?", answer: "girar el remo con la corriente" },
  { id: 17, type: 'text', text: "Cuál es la palanca nº 17?", answer: "girar el codo y bloquear la garganta" },
  { id: 18, type: 'text', text: "Cuál es la palanca nº 18?", answer: "llevarse una cabra de paso" },
  { id: 19, type: 'text', text: "Cuál es la palanca nº 19?", answer: "sostener el brazo y el codo" },
  { id: 20, type: 'text', text: "Cuál es la palanca nº 20?", answer: "dar la vuelta y girar el codo" },
  { id: 21, type: 'text', text: "Cuál es la palanca nº 21?", answer: "gallo de oro gira la cabeza" },
  { id: 22, type: 'text', text: "Cuál es la palanca nº 22?", answer: "sostener el brazo y presionar el hombro" },
  { id: 23, type: 'text', text: "Cuál es la palanca nº 23?", answer: "girar la muñeca y presionar el hombro" },
  { id: 24, type: 'text', text: "Cuál es la palanca nº 24?", answer: "levantar el codo y trabar el brazo" },
  { id: 25, type: 'text', text: "Cuál es la palanca nº 25?", answer: "llevar el brazo y presionar el hombro" },
  { id: 26, type: 'text', text: "Cuál es la palanca nº 26?", answer: "envolver el codo y dislocar el hombro" },
  { id: 27, type: 'text', text: "Cuál es la palanca nº 27?", answer: "entrelazar el cuello y bloquear la garganta" },
  { id: 28, type: 'text', text: "Cuál es la palanca nº 28?", answer: "brazo de hierro bloquea la garganta" },
  { id: 29, type: 'text', text: "Cuál es la palanca nº 29?", answer: "niño adora a buda" },
  { id: 30, type: 'text', text: "Cuál es la palanca nº 30?", answer: "sostener la cabeza y presionar la muñeca" },
  { id: 31, type: 'text', text: "Cuál es la palanca nº 31?", answer: "hacer un paquete con rodillas y piernas" },
  { id: 32, type: 'text', text: "Cuál es la palanca nº 32?", answer: "el dragon azul inclina la cabeza" },
]
