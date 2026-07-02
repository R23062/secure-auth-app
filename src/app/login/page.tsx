"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { UserProfile, userProfileSchema } from "../_types/UserProfile";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import { ApiResponse } from "../_types/ApiResponse";
import { decodeJwt } from "jose";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AUTH } from "@/config/auth";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  // 【追加機能2】ログイン画面用のパスワード表示・非表示切り替え
  const [showPassword, setShowPassword] = useState(false);

  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get(c_Email);
    formMethods.setValue(c_Email, email || "");
  }, [formMethods]);

  useEffect(() => {
    if (isLoginCompleted) {
      router.replace("/");
      router.refresh();
    }
  }, [isLoginCompleted, router]);

  const { onChange: onEmailChange, ...emailRegister } = formMethods.register(c_Email);
  const { onChange: onPasswordChange, ...passwordRegister } = formMethods.register(c_Password);

  const clearRootOnChange =
    (originalOnChange: React.ChangeEventHandler<HTMLInputElement>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      originalOnChange(e);
      formMethods.clearErrors("root");
    };

  const onSubmit = async (formValues: LoginRequest) => {
    const ep = "/api/login";
    try {
      setIsPending(true);
      setRootError("");
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });
      setIsPending(false);
      
      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }
      
      setUserProfile(userProfileSchema.parse(body.payload));
      mutate("/api/auth", body);
      setIsLoginCompleted(true);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "エラーが発生しました";
      setRootError(errorMsg);
    }
  };

  return (
    <main className="p-6 bg-white rounded-lg border border-slate-200 shadow-xs">
      <div className="text-2xl font-bold text-slate-800">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1.5 text-indigo-500" />
        ログイン
      </div>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={twMerge(
          "mt-6 flex flex-col gap-y-4",
          isLoginCompleted && "cursor-not-allowed opacity-50",
        )}
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold text-slate-700">
            メールアドレス
          </label>
          <TextInputField
            {...emailRegister}
            onChange={clearRootOnChange(onEmailChange)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold text-slate-700">
            パスワード
          </label>
          <div className="relative">
            <TextInputField
              {...passwordRegister}
              onChange={clearRootOnChange(onPasswordChange)}
              id={c_Password}
              placeholder="*****"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isLoginCompleted}
              error={!!fieldErrors.password}
              autoComplete="off"
            />
            {/* 【独自機能2】目玉アイコンボタン */}
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest mt-2"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending || isLoginCompleted}
        >
          ログインする
        </Button>
      </form>

      {isLoginCompleted && (
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200 flex items-center gap-x-2 text-green-700 font-semibold">
          <FontAwesomeIcon icon={faSpinner} spin />
          <div>ようこそ、{userProfile?.name} さん！</div>
        </div>
      )}
    </main>
  );
};

export default Page;