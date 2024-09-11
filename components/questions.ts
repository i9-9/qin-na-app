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
  { id: 1, type: 'text', text: "Cuál es la palanca nº 1?", answer: "Muñeca de oro y de seda|Muñeca de oro y seda" },
  { id: 2, type: 'text', text: "Cuál es la palanca nº 2?", answer: "Mano corta como cuchillo|Mano que corta como cuchillo" },
  { id: 3, type: 'text', text: "Cuál es la palanca nº 3?", answer: "Arrodillarse a pedir limosna" },
  { id: 4, type: 'text', text: "Cuál es la palanca nº 4?", answer: "Xiang zi lleva la canasta" },
  { id: 5, type: 'text', text: "Cuál es la palanca nº 5?", answer: "Proteger los hombros" },
  { id: 6, type: 'text', text: "Cuál es la palanca nº 6?", answer: "Sostener la luna entre las manos" },
  { id: 7, type: 'text', text: "Cuál es la palanca nº 7?", answer: "Doblar el codo" },
  { id: 8, type: 'text', text: "Cuál es la palanca nº 8?", answer: "El rey del cielo sostiene la torre|Rey del cielo sostiene la torre" },
  { id: 9, type: 'text', text: "Cuál es la palanca nº 9?", answer: "Sostener la mano y atrapar los dedos" },
  { id: 10, type: 'text', text: "Cuál es la palanca nº 10?", answer: "Habilmente tomar dos dedos" },
  { id: 11, type: 'text', text: "Cuál es la palanca nº 11?", answer: "Empujar el bote con la corriente" },
  { id: 12, type: 'text', text: "Cuál es la palanca nº 12?", answer: "Ba wang indica la batalla" },
  { id: 13, type: 'text', text: "Cuál es la palanca nº 13?", answer: "Palmadas en el pecho y girar el codo|Palmaditas en el pecho y girar el codo" },
  { id: 14, type: 'text', text: "Cuál es la palanca nº 14?", answer: "Manos de flor de ciruelo|Manos como flor de ciruelo" },
  { id: 15, type: 'text', text: "Cuál es la palanca nº 15?", answer: "Girar la muñeca y llevar el codo" },
  { id: 16, type: 'text', text: "Cuál es la palanca nº 16?", answer: "Girar el remo con la corriente|Girar el remo a lo largo de la corriente" },
  { id: 17, type: 'text', text: "Cuál es la palanca nº 17?", answer: "Girar el codo y bloquear la garganta" },
  { id: 18, type: 'text', text: "Cuál es la palanca nº 18?", answer: "Llevarse una cabra de paso" },
  { id: 19, type: 'text', text: "Cuál es la palanca nº 19?", answer: "Sostener el brazo y el codo|Sostener el brazo y sostener el codo" },
  { id: 20, type: 'text', text: "Cuál es la palanca nº 20?", answer: "Dar la vuelta y girar el codo" },
  { id: 21, type: 'text', text: "Cuál es la palanca nº 21?", answer: "Gallo de oro gira la cabeza" },
  { id: 22, type: 'text', text: "Cuál es la palanca nº 22?", answer: "Sostener el brazo y presionar el hombro" },
  { id: 23, type: 'text', text: "Cuál es la palanca nº 23?", answer: "Girar la muñeca y presionar el hombro" },
  { id: 24, type: 'text', text: "Cuál es la palanca nº 24?", answer: "Levantar el codo y trabar el brazo" },
  { id: 25, type: 'text', text: "Cuál es la palanca nº 25?", answer: "Llevar el brazo y presionar el hombro" },
  { id: 26, type: 'text', text: "Cuál es la palanca nº 26?", answer: "Envolver el codo y dislocar el hombro" },
  { id: 27, type: 'text', text: "Cuál es la palanca nº 27?", answer: "Entrelazar el cuello y bloquear la garganta" },
  { id: 28, type: 'text', text: "Cuál es la palanca nº 28?", answer: "Brazo de hierro bloquea la garganta" },
  { id: 29, type: 'text', text: "Cuál es la palanca nº 29?", answer: "Niño adora a buda" },
  { id: 30, type: 'text', text: "Cuál es la palanca nº 30?", answer: "Sostener la cabeza y presionar la muñeca" },
  { id: 31, type: 'text', text: "Cuál es la palanca nº 31?", answer: "Hacer un paquete con rodillas y piernas" },
  { id: 32, type: 'text', text: "Cuál es la palanca nº 32?", answer: "El dragon azul inclina la cabeza|Dragon azul inclina la cabeza" },
]
