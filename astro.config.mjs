// ABOUTME: Astro と Starlight のサイト設定をまとめる設定ファイルです。
// ABOUTME: サイドバーや編集リンクなど、公開サイト全体の基本動作を定義します。
// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://kotowari-modoki.github.io/",
  base: "/manabi-commons",
  integrations: [
    starlight({
      title: "まなびコモンズ",
      description: "小中高生のための無料教科書",
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
          label: "ガイド",
          autogenerate: { directory: "guides" },
        },
        {
          label: "リファレンス",
          autogenerate: { directory: "reference" },
        },
        {
          label: "このサイトについて",
          autogenerate: { directory: "about" },
        },
        {
          label: "学びのガイド",
          autogenerate: { directory: "school-guide" },
        },
      ],
      // customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/kotowari-modoki/manabi-commons/edit/main/",
      },
    }),
  ],
});
