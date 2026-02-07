declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "jobseeker" | "recruiter";
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "jobseeker" | "recruiter";
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "jobseeker" | "recruiter";
    accessToken: string;
  }
}

export {};
