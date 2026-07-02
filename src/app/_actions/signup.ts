"use server";

import { prisma } from "@/libs/prisma";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";
import bcrypt from "bcryptjs";

// 画面側から送られてくるデータの形を柔軟に受け取れるように、引数の型を引越し後の形（anyまたはRecord）に対応させます
export const signupServerAction = async (
  signupRequest: any,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    // 1. 必要なデータ（name, email, password）を安全に抽出
    const { name, email, password } = signupRequest;

    if (!name || !email || !password) {
      return {
        success: false,
        payload: null,
        message: "入力項目が不足しています。",
      };
    }

    // 2. メールの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return {
        success: false,
        payload: null,
        message: "このメールアドレスは既に登録されています。",
      };
    }

    // 3. パスワードを bcryptjs でソルトラウンド10でハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. データベースに安全に保存
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
      },
    });

    const res: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "ユーザー登録が成功しました。",
    };
    return res;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return {
      success: false,
      payload: null,
      message: "サインアップ中にエラーが発生しました。",
    };
  }
};