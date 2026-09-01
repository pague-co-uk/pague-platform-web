export interface PortalUser {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  client: {
    id: string;
    displayName: string;
  };
}