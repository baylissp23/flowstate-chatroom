export function getClientId() : string {
  const storageKey = "flowstate-client-id";

  let clientId = sessionStorage.getItem(storageKey);
  if (!clientId) {
    clientId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, clientId);
  }

  return clientId;
}

