export type CredentialSummary = {
  id: string;
  name: string;
  type: string;
  username: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CredentialSecretPayload = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  apiKey: string | null;
  username: string | null;
  password: string | null;
  cookieValue: string | null;
  customHeaders: string | null;
};

export function maskCredentialValue() {
  return "********";
}

export function formatCredentialType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
