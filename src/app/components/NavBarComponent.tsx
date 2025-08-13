"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

function NavBarComponent() {
  const { user } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <Link
          href={
            user.role === "admin" ? "/Admin-Dashboard" : "/Client-Dashboard"
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {user.role === "admin" ? "Admin Dashboard" : "Client Dashboard"}
        </Link>
      ) : (
        <Link href="/auth/login" className="text-gray-500 hover:text-gray-700">
          Login
        </Link>
      )}
      {user ? (
        <Link
          href="/auth/logout"
          className="bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-800"
        >
          Logout
        </Link>
      ) : (
        <Link
          href="/auth/signup"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Sign Up
        </Link>
      )}
    </div>
  );
}

export default NavBarComponent;
