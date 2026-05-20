export interface NotifyDocumentPayload {
  type: "document";
  name: string;
  email?: string;
  phone?: string;
  code: string;
  docTitle: string;
  fileName: string;
}

export interface NotifySubmissionPayload {
  type: "submission";
  name: string;
  email?: string;
  phone?: string;
  code: string;
  docs: string[];
  loanType: string;
  employment: string;
}

export interface NotifyProfilePayload {
  type: "profile";
  name: string;
  email?: string;
  phone?: string;
  code: string;
  goal: string;
  profileItems: string[];
  estimate: string;
  employment: string;
  scenarios?: string[];
}

export type NotifyPayload = NotifyDocumentPayload | NotifySubmissionPayload | NotifyProfilePayload;

export async function sendNotification(payload: NotifyPayload): Promise<void> {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently fail — notification is best-effort
  }
}
