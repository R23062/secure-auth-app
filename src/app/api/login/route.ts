import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/app/api/_helper/createSession";
import bcrypt from "bcryptjs"; // インポート

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    // Zodによるバリデーション
    const payload = loginRequestSchema.parse(body);

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, payload: null, message: "メールアドレスまたはパスワードが間違っています。" },
        { status: 400 }
      );
    }

    // bcrypt でハッシュ化されたパスワードを安全に比較
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, payload: null, message: "メールアドレスまたはパスワードが間違っています。" },
        { status: 400 }
      );
    }

    // セッションの作成（有効期限1時間 = 3600秒）
    const tokenMaxAgeSeconds = 3600;
    await createSession(user.id, tokenMaxAgeSeconds);

    const res: ApiResponse<unknown> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "ログインに成功しました。",
    };

    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return NextResponse.json(
      { success: false, payload: null, message: "ログイン処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
};