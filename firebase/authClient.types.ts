export type AppAuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

export type AppAuthUserCredential = {
  user: AppAuthUser;
};

export type AppPhoneConfirmation = {
  confirm: (code: string) => Promise<AppAuthUserCredential>;
};
