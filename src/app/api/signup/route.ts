import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    // 1. Zodによるバリデーション
    const payload = signupRequestSchema.parse(body);

    // 2. メールの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, payload: null, message: "このメールアドレスは既に登録されています。" },
        { status: 400 }
      );
    }

    // 3. パスワードを bcryptjs でガチガチにハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    // 4. データベースに保存
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
      },
    });

    const res: ApiResponse<unknown> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "ユーザー登録が成功しました。",
    };

    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return NextResponse.json(
      { success: false, payload: null, message: "サインアップ中にエラーが発生しました。" },
      { status: 500 }
    );
  }
};