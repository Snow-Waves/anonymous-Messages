import { Message } from "../models/User";

export interface ApiResponseType {
  success: boolean;
  message: string;
  messages?: Array<Message>;
  isAccesptingMessage?: boolean;

}