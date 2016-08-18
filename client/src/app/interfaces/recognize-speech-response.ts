export interface IRecognizeSpeechOption {
  transcript: string;
  confidence: number;
}

export interface IRecognizeSpeechResult {
  alternatives: IRecognizeSpeechOption[];
}

export interface IRecognizeSpeechResponse {
  results: IRecognizeSpeechResult[];
}
