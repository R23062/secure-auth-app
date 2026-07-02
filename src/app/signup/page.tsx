"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { faSpinner, faPenNib, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiResponse } from "../_types/ApiResponse";
import { z } from "zod";

// 確認用パスワードを含めたフロントエンド専用のバリデーションスキーマ
const frontendSignupSchema = signupRequestSchema
  .extend({
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type FrontendSignupInput = z.infer<typeof frontendSignupSchema>;

const Page: React.FC = () => {
  const c_Name = "name";
  const c_Email = "email";
  const c_Password = "password";
  const c_ConfirmPassword = "confirmPassword";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSignUpCompleted, setIsSignUpCompleted] = useState(false);

  // パスワード表示・非表示切り替え用の状態管理
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formMethods = useForm<FrontendSignupInput>({
    mode: "onChange",
    resolver: zodResolver(frontendSignupSchema),
  });

  const fieldErrors = formMethods.formState.errors;

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  const { onChange: onEmailChange, ...emailRegister } = formMethods.register(c_Email);
  const { onChange: onPasswordChange, ...passwordRegister } = formMethods.register(c_Password);

  const clearRootOnChange =
    (originalOnChange: React.ChangeEventHandler<HTMLInputElement>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      originalOnChange(e);
      formMethods.clearErrors("root");
    };

  useEffect(() => {
    if (isSignUpCompleted) {
      router.replace(`/login?${c_Email}=${formMethods.getValues(c_Email)}`);
      router.refresh();
    }
  }, [formMethods, isSignUpCompleted, router]);

  const onSubmit = async (data: FrontendSignupInput) => {
    try {
      setIsPending(true);
      setRootError("");

      // 普通のAPIルートへデータをPOSTする（絶対にバグらない安全な方法）
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        }),
        credentials: "same-origin",
        cache: "no-store",
      });

      setIsPending(false);

      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }

      setIsSignUpCompleted(true);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "エラーが発生しました。";
      setRootError(errorMsg);
      setIsPending(false);Ref
    }
  };

  return (     <main>
       <div className="text-2xl font-bold">
         <FontAwesomeIcon icon={faPenNib} className="mr-1.5" />
         Signup
       </div>
       <form
         noValidate
         onSubmit={formMethods.handleSubmit(onSubmit)}
         className="mt-6 flex flex-col gap-y-4"
       >
         <div>
           <label htmlFor={c_Name} className="mb-2 block font-bold text-slate-700">
             ユーザー名
           </label>
           <TextInputField
             {...formMethods.register(c_Name)}
             id={c_Name}
             placeholder="お名前"
             type="text"
             disabled={isPending || isSignUpCompleted}
             error={!!fieldErrors.name}
             autoComplete="name"
           />
           <ErrorMsgField msg={fieldErrors.name?.message} />
         </div>

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
             disabled={isPending || isSignUpCompleted}
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
               disabled={isPending || isSignUpCompleted}
               error={!!fieldErrors.password}
               autoComplete="off"
             />
             <button
               type="button"
               className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
               onClick={() => setShowPassword(!showPassword)}
             >
               <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
             </button>
           </div>
           <ErrorMsgField msg={fieldErrors.password?.message} />
         </div>

         <div>
           <label htmlFor={c_ConfirmPassword} className="mb-2 block font-bold text-slate-700">
             パスワード（確認用）
           </label>
           <div className="relative">
             <TextInputField
               {...formMethods.register(c_ConfirmPassword)}
               id={c_ConfirmPassword}
               placeholder="*****"
               type={showConfirmPassword ? "text" : "password"}
               disabled={isPending || isSignUpCompleted}
               error={!!fieldErrors.confirmPassword}
               autoComplete="off"
             />
             <button
               type="button"
               className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             >
               <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
             </button>
           </div>
           <ErrorMsgField msg={fieldErrors.confirmPassword?.message} />
           <ErrorMsgField msg={fieldErrors.root?.message} />
         </div>

         <Button
           variant="indigo"
           width="stretch"
           className="tracking-widest mt-2"
           isBusy={isPending}
           disabled={!formMethods.formState.isValid || isPending || isSignUpCompleted}
         >
           登録する
         </Button>
       </form>

       {isSignUpCompleted && (
         <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
           <div className="flex items-center gap-x-2 text-green-700 font-semibold mb-1">
             <FontAwesomeIcon icon={faSpinner} spin />
             <div>アカウントを作成しました！</div>
           </div>
           <NextLink href={`/login?${c_Email}=${formMethods.getValues(c_Email)}`} className="text-blue-500 hover:underline text-sm">
             ログインページへ移動する
           </NextLink>
         </div>
       )}
     </main>
  );
};

export default Page;