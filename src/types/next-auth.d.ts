import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string;
      points: number;
      familyId: string | null;
      familyName: string | null;
    };
  }
}
