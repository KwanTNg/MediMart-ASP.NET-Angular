export type LoginErrorResponse = {
  message: string;
  accessFailedCount: number;
  isLockedOut?: boolean;
}