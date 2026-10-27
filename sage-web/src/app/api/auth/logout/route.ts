import { NextResponse } from "next/server";

function performLogout(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  response.cookies.set("sageai_jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}

export async function POST(req: Request) {
  return performLogout(req);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.redirect(new URL("/login", url.origin));
  
  response.cookies.set("sageai_jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
