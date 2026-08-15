"use client";

import React from "react";
import { SessionProvider as Provider } from "next-auth/react";
import { UserStoreProvider } from "./UserStoreProvider";
import { CompareProvider } from "./CompareProvider";
import CompareTray from "./CompareTray";
import CompareSuggestionPopup from "./CompareSuggestionPopup";

interface Props {
  children: React.ReactNode;
}

export function SessionProvider({ children }: Props) {
  return (
    <Provider>
      <UserStoreProvider>
        <CompareProvider>
          {children}
          <CompareTray />
          <CompareSuggestionPopup />
        </CompareProvider>
      </UserStoreProvider>
    </Provider>
  );
}
