import NextLink from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

const links = [
  {
    href: "/login",
    label: "ログインページ",
    info: "セッション認証によるログインを行います",
  },
  {
    href: "/signup",
    label: "サインアップページ",
    info: "Server Actionsを用いたユーザー登録を行います",
  },
];

const Page = async () => {
  return (
    <main>
      <div className="text-2xl font-bold">メインメニュー</div>
      <div className="mt-4 ml-2 flex flex-col gap-y-2">
        {links.map(({ href, label, info }) => (           <div key={href} className="flex items-center">
            <FontAwesomeIcon icon={faCode} className="mr-1.5" />
            <NextLink href={href} className="mr-2 hover:underline text-indigo-600 font-semibold">
              {label}
            </NextLink>
            <div className="text-xs text-slate-600"> - {info}</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;