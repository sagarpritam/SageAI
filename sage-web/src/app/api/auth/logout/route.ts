import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.redirect(new URL("/", url.origin));
  
  response.cookies.set("sageai_jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}
