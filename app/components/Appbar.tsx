"use client";
import { signIn, signOut, useSession } from "next-auth/react";

const Appbar = () => {
  const session = useSession();

  return (
    <div>
      <div className="flex justify-between">
        <div>Muzi</div>
        <div>
          {session.data?.user && (
            <button className="m-2 p-2 bg-blue-400" onClick={() => signOut()}>
              Log out
            </button>
          )}
          {!session.data?.user && (
            <button className="m-2 p-2 bg-blue-400" onClick={() => signIn()}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appbar;
