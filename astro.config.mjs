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
      locales: {
        root: {
          label: "日本語",
          lang: "ja",
        },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/kotowari-modoki/manabi-commons",
        },
      ],
      components: {
        Head: "./src/components/overrides/Head.astro",
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "学びのガイド",
          items: [{ autogenerate: { directory: "school-guide" } }],
        },
        {
          label: "算数・数学",
          items: [{ autogenerate: { directory: "math" } }],
        },
        {
          label: "国語",
          items: [
            "japanese",
            "japanese/elementary-kanji-by-grade",
            {
              label: "3年生の漢字 水族館ドリル",
              collapsed: true,
              items: [
                { autogenerate: { directory: "japanese/grade-3-kanji-aquarium" } },
              ],
            },
            "japanese/hyakunin-isshu",
            "japanese/hyakunin-isshu-complete",
            "japanese/junior-high-japanese-overview",
          ],
        },
        {
          label: "理科",
          items: [{ autogenerate: { directory: "science" } }],
        },
        {
          label: "社会",
          items: [{ autogenerate: { directory: "social" } }],
        },
        {
          label: "外国語",
          items: [{ autogenerate: { directory: "english" } }],
        },
        {
          label: "図工・アート",
          items: [{ autogenerate: { directory: "art" } }],
        },
        {
          label: "体育",
          items: [{ autogenerate: { directory: "physical-education" } }],
        },
        {
          label: "おうちの方へ",
          items: [{ autogenerate: { directory: "parent-guide" } }],
        },
        {
          label: "このサイトについて",
          items: [{ autogenerate: { directory: "about" } }],
        },
      ],
      head: [
        {
          tag: "meta",
          attrs: {
            name: "google-site-verification",
            content: "ysuEj023oFjddObiBNrkXRESp6QvqewPEAm0d0Ak61c",
          },
        },
      ],
      editLink: {
        baseUrl: "https://github.com/kotowari-modoki/manabi-commons/edit/main/",
      },
    }),
  ],
});
