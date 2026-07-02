import { prisma } from "@/libs/prisma";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/api/_helper/verifySession";

// キャッシュを無効化して常に最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    // 【セッション認証】Cookieから安全にセッションを検証してユーザーIDを取得
    const userId = await verifySession();

    // 認証されていない場合
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証されていません。ログインしてください。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザーが見つかりません。",
      };
      return NextResponse.json(res, { status: 404 });
    }

    // Zodで検証して安全なプロフィールデータのみを返却
    const res: ApiResponse<unknown> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "",
    };

    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "認証情報の取得中にエラーが発生しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};