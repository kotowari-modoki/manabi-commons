// ABOUTME: Astro と Starlight のサイト設定をまとめる設定ファイルです。
// ABOUTME: サイドバーや編集リンクなど、公開サイト全体の基本動作を定義します。
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://kotowari-modoki.github.io/",
  base: "manabi-commons",
  integrations: [
    starlight({
      title: "まなびコモンズ",
      description: "小学生・中学生のための無料教科書",
      defaultLocale: "ja",
      locales: {
        ja: { label: "日本語", lang: "ja" },
        en: { label: "English", lang: "en" },
      },
      // logo: {
      //   src: "./public/logo.svg",
      // },
      //
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/kotowari-modoki/manabi-commons",
        },
      ],
      sidebar: [
        {
          label: "算数・数学",
          autogenerate: { directory: "math" },
        },
        {
          label: "理科",
          autogenerate: { directory: "science" },
        },
        {
          label: "英語",
          autogenerate: { directory: "english" },
        },
        {
          label: "社会",
          autogenerate: { directory: "social" },
        },
        {
          label: "国語",
          autogenerate: { directory: "japanese" },
        },
        {
          label: "このサイトについて",
          autogenerate: { directory: "about" },
        },
      ],
      // customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/kotowari-modoki/manabi-commons/edit/main/",
      },
    }),
  ],
});
