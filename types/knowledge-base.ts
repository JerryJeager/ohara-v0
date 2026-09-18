export type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
};

export type Website = {
  id: number;
  name: string;
  url: string;
  messages: Message[];
};
