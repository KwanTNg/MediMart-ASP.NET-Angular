export type Message = {
    id: number,
    senderId: string,
    senderDisplayName: string,
    recipientId: string,
    recipientDisplayName: string,
    content: string,
    dateRead?: string,
    messageSent: string,
    currentUserSender: boolean,
    isFromAdmin: boolean
}